import { Duration, Effect, pipe, S, Schedule, Stream } from "effect-app"
import { HttpHeaders, HttpServerResponse } from "effect-app/http"
import { reportError } from "../../errorReporter.js"
import { InfraLogger } from "../../logger.js"
import { setupRequestContextFromCurrent } from "../setupRequest.js"

// Tell the client to retry every 10 seconds if connectivity is lost
const setRetry = Stream.succeed("retry: 10000")
const keepAlive = Stream.schedule(Effect.succeed(":keep-alive"), Schedule.fixed(Duration.seconds(15)))

export const makeSSE = <A extends { id: any }, SI, SR>(
  schema: S.Schema<A, SI, SR>
) =>
<E, R>(events: Stream.Stream<{ evt: A; namespace: string }, E, R>) =>
  Effect
    .gen(function*() {
      yield* InfraLogger.logInfo("$ start listening to events")

      const enc = new TextEncoder()

      const encode = S.encode(schema)

      const eventStream = Stream.flatMap(
        events,
        (_) =>
          encode(_.evt)
            .pipe(Effect.andThen((evt) => `id: ${_.evt.id}\ndata: ${JSON.stringify(evt)}`))
      )

      const stream = pipe(
        setRetry,
        Stream.merge(keepAlive),
        Stream.merge(eventStream),
        Stream.map((_) => enc.encode(_ + "\n\n"))
      )

      const ctx = yield* Effect.context<R | SR>()
      const res = HttpServerResponse.stream(
        stream
          .pipe(
            Stream.tapErrorCause(reportError("Request")),
            Stream.provideContext(ctx)
          ),
        {
          contentType: "text/event-stream",
          headers: HttpHeaders.fromInput({
            "content-type": "text/event-stream",
            "cache-control": "no-cache",
            "x-accel-buffering": "no",
            "connection": "keep-alive" // if (req.httpVersion !== "2.0")
          })
        }
      )
      return res
    })
    .pipe(Effect.tapErrorCause(reportError("Request")), setupRequestContextFromCurrent("events"))
