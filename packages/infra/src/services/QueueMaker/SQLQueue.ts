import { Model } from "@effect-app/infra-adapters/SQL"
import { setupRequestContext } from "@effect-app/infra/api/setupRequest"
import { RequestContext } from "@effect-app/infra/RequestContext"
import { reportNonInterruptedFailure } from "@effect-app/infra/services/QueueMaker/errors"
import type { QueueBase } from "@effect-app/infra/services/QueueMaker/service"
import { QueueMeta } from "@effect-app/infra/services/QueueMaker/service"
import { RequestContextContainer } from "@effect-app/infra/services/RequestContextContainer"
import { SqlClient } from "@effect/sql"
import { randomUUID } from "crypto"
import { subMinutes } from "date-fns"
import { Effect, Fiber, Option, S, Tracer } from "effect-app"
import { RequestId } from "effect-app/ids"
import { NonEmptyString255 } from "effect-app/schema"
import { pretty } from "effect-app/utils"
import { InfraLogger } from "../../logger.js"

export const QueueId = S.Number.pipe(S.brand("QueueId"))
export type QueueId = typeof QueueId.Type

// TODO: let the model track and Auto Generate versionColumn on every update instead
export function makeSQLQueue<
  Evt extends { id: S.StringId; _tag: string },
  DrainEvt extends { id: S.StringId; _tag: string },
  EvtE,
  DrainEvtE
>(
  queueName: NonEmptyString255,
  queueDrainName: NonEmptyString255,
  schema: S.Schema<Evt, EvtE>,
  drainSchema: S.Schema<DrainEvt, DrainEvtE>
) {
  return Effect.gen(function*() {
    const base = {
      id: Model.Generated(QueueId),
      meta: Model.JsonFromString(QueueMeta),
      name: S.NonEmptyString255,
      createdAt: Model.DateTimeInsert,
      updatedAt: Model.DateTimeUpdate,
      // TODO: at+owner
      processingAt: Model.FieldOption(S.Date),
      finishedAt: Model.FieldOption(S.Date),
      etag: S.String // TODO: use a Model thing that auto updates it?
      // TODO: record locking.. / optimistic locking
      // rowVersion: Model.DateTimeFromNumberWithNow
    }
    class Queue extends Model.Class<Queue>("Queue")({
      body: Model.JsonFromString(schema),
      ...base
    }) {}
    class Drain extends Model.Class<Drain>("Drain")({
      body: Model.JsonFromString(drainSchema),
      ...base
    }) {}
    const sql = yield* SqlClient.SqlClient

    const queueRepo = yield* Model.makeRepository(Queue, {
      tableName: "queue",
      spanPrefix: "QueueRepo",
      idColumn: "id",
      versionColumn: "etag"
    })

    const drainRepo = yield* Model.makeRepository(Drain, {
      tableName: "queue",
      spanPrefix: "DrainRepo",
      idColumn: "id",
      versionColumn: "etag"
    })

    const decodeDrain = S.decode(Drain)

    const drain = Effect
      .sync(() => subMinutes(new Date(), 15))
      .pipe(
        Effect
          .andThen((limit) =>
            sql<typeof Drain.Encoded>`SELECT *
    FROM queue
    WHERE name = ${queueDrainName} AND finishedAt IS NULL AND (processingAt IS NULL OR processingAt < ${limit.getTime()})
    LIMIT 1`
          )
      )

    const q = {
      offer: (body: Evt, meta: typeof QueueMeta.Type) =>
        Effect.gen(function*() {
          yield* queueRepo.insertVoid(
            Queue.insert.make({
              body,
              meta,
              name: queueName,
              processingAt: Option.none(),
              finishedAt: Option.none(),
              etag: randomUUID()
            })
          )
        }),
      take: Effect.gen(function*() {
        while (true) {
          const [first] = yield* drain.pipe(Effect.withTracerEnabled(false)) // disable sql tracer otherwise we spam it..
          if (first) {
            const dec = yield* decodeDrain(first)
            const { createdAt, updatedAt, ...rest } = dec
            return yield* drainRepo.update(
              Drain.update.make({ ...rest, processingAt: Option.some(new Date()) }) // auto in lib , etag: randomUUID()
            )
          }
          if (first) return first
          yield* Effect.sleep(250)
        }
      }),
      finish: ({ createdAt, updatedAt, ...q }: Drain) =>
        drainRepo.updateVoid(Drain.update.make({ ...q, finishedAt: Option.some(new Date()) })) // auto in lib , etag: randomUUID()
    }
    const rcc = yield* RequestContextContainer

    return {
      publish: (...messages) =>
        Effect
          .gen(function*() {
            const requestContext = yield* rcc.requestContext
            const span = yield* Effect.serviceOption(Tracer.ParentSpan)
            return yield* Effect
              .forEach(
                messages,
                (m) =>
                  q.offer(m, {
                    requestContext: new RequestContext(requestContext), // workaround Schema expecting exact class
                    span: Option.getOrUndefined(span)
                  }),
                {
                  discard: true
                }
              )
          })
          .pipe(
            Effect.withSpan("queue.publish: " + queueName, {
              captureStackTrace: false,
              kind: "producer",
              attributes: { "message_tags": messages.map((_) => _._tag) }
            })
          ),
      drain: <DrainE, DrainR>(
        handleEvent: (ks: DrainEvt) => Effect<void, DrainE, DrainR>,
        sessionId?: string
      ) =>
        Effect.gen(function*() {
          const silenceAndReportError = reportNonInterruptedFailure({ name: "MemQueue.drain." + queueDrainName })
          const processMessage = (msg: Drain) =>
            Effect
              .succeed(msg)
              .pipe(Effect
                .flatMap(({ body, meta }) => {
                  let effect = InfraLogger
                    .logInfo(`[${queueDrainName}] Processing incoming message`)
                    .pipe(
                      Effect.annotateLogs({ body: pretty(body), meta: pretty(meta) }),
                      Effect.zipRight(handleEvent(body)),
                      silenceAndReportError,
                      (_) =>
                        setupRequestContext(
                          _,
                          RequestContext.inherit(meta.requestContext, {
                            id: RequestId(body.id),
                            locale: "en" as const,
                            name: NonEmptyString255(`${queueDrainName}.${body._tag}`)
                          })
                        ),
                      Effect
                        .withSpan(`queue.drain: ${queueDrainName}.${body._tag}`, {
                          captureStackTrace: false,
                          kind: "consumer",
                          attributes: {
                            "queue.name": queueDrainName,
                            "queue.sessionId": sessionId,
                            "queue.input": body
                          }
                        })
                    )
                  if (meta.span) {
                    effect = Effect.withParentSpan(effect, Tracer.externalSpan(meta.span))
                  }
                  return effect
                }))

          return yield* q
            .take
            .pipe(
              Effect.flatMap((x) =>
                processMessage(x).pipe(
                  Effect.uninterruptible,
                  Effect.fork,
                  Effect.flatMap(Fiber.join),
                  Effect.tap(q.finish(x))
                )
              ),
              silenceAndReportError,
              Effect.forever,
              Effect.withSpan(`queue.drain: ${queueDrainName}`, {
                attributes: {
                  "queue.type": "sql",
                  "queue.name": queueDrainName,
                  "queue.sessionId": sessionId
                }
              })
            )
        })
    } satisfies QueueBase<Evt, DrainEvt>
  })
}
