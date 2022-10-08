/* eslint-disable @typescript-eslint/no-explicit-any */
import { flow } from "@effect-ts-app/core/Function"
import * as MO from "@effect-ts-app/schema"

import { NotFoundError, UnauthorizedError } from "./errors.js"

export function handle<
  TModule extends Record<
    string,
    any //{ Model: MO.SchemaAny; new (...args: any[]): any } | MO.SchemaAny
  >
>(
  _: TModule & { ResponseOpenApi?: any },
  adaptResponse?: any
): <R, E>(
  h: (
    r: InstanceType<
      MO.GetRequest<TModule> extends { new (...args: any[]): any }
        ? MO.GetRequest<TModule>
        : never
    >
  ) => Effect<R, E, MO.ParsedShapeOf<Extr<MO.GetResponse<TModule>>>>
) => {
  h: typeof h
  Request: MO.GetRequest<TModule>
  Response: MO.GetResponse<TModule>
  ResponseOpenApi: any
} {
  // TODO: Prevent over providing // no strict/shrink yet.
  const Request = MO.extractRequest(_)
  const Response = MO.extractResponse(_)

  return <R, E>(
    h: (
      r: InstanceType<
        MO.GetRequest<TModule> extends { new (...args: any[]): any }
          ? MO.GetRequest<TModule>
          : never
      >
    ) => Effect<R, E, MO.ParsedShapeOf<Extr<MO.GetResponse<TModule>>>>
  ) =>
    ({
      adaptResponse,
      h,
      Request,
      Response,
      ResponseOpenApi: _.ResponseOpenApi ?? Response,
    } as any)
}

type Extr<T> = T extends { Model: MO.SchemaAny }
  ? T["Model"]
  : T extends MO.SchemaAny
  ? T
  : never

export function accessM_<T, UserId, Err>(
  canAccess: (rsc: T, userId: UserId) => boolean,
  bad: (rsc: T, userId: UserId) => Err
) {
  return <R, E, A>(
    rsc: T,
    userId: UserId,
    ok: (rsc: T) => Effect<R, E, A>
  ): Effect<R, E | Err, A> => {
    if (canAccess(rsc, userId)) {
      return ok(rsc)
    }
    return Effect.fail(bad(rsc, userId))
  }
}

export function access_<T, UserId, Err>(
  canAccess: (rsc: T, userId: UserId) => boolean,
  bad: (rsc: T, userId: UserId) => Err
) {
  const auth = accessM_(canAccess, bad)
  return <A>(rsc: T, userId: UserId, ok: (rsc: T) => A) =>
    auth(rsc, userId, flow(ok, Effect.succeed))
}

export function accessM<T, UserId, Err>(
  canAccess: (rsc: T, userId: UserId) => boolean,
  bad: (rsc: T, userId: UserId) => Err
) {
  return <R, E, A>(userId: UserId, ok: (rsc: T) => Effect<R, E, A>) =>
    (rsc: T): Effect<R, E | Err, A> => {
      if (canAccess(rsc, userId)) {
        return ok(rsc)
      }
      return Effect.fail(bad(rsc, userId))
    }
}

export function access<T, UserId, Err>(
  canAccess: (rsc: T, userId: UserId) => boolean,
  bad: (rsc: T, userId: UserId) => Err
) {
  const auth = accessM(canAccess, bad)
  return <A>(userId: UserId, ok: (rsc: T) => A) =>
    auth(userId, flow(ok, Effect.succeed))
}

export function makeAuthorize<T, UserId>(
  canAccess: (rsc: T, userId: UserId) => boolean,
  type: string,
  getId: (t: T) => string | number
) {
  return {
    access_: access_(canAccess, () => new UnauthorizedError()),
    access: access(canAccess, () => new UnauthorizedError()),
    accessM_: accessM_(canAccess, () => new UnauthorizedError()),
    accessM: accessM(canAccess, () => new UnauthorizedError()),

    accessOrHide_: access_(
      canAccess,
      (r) => new NotFoundError(type, getId(r).toString())
    ),
    accessOrHide: access(
      canAccess,
      (r) => new NotFoundError(type, getId(r).toString())
    ),
    accessOrHideM_: accessM_(
      canAccess,
      (r) => new NotFoundError(type, getId(r).toString())
    ),
    accessOrHideM: accessM(
      canAccess,
      (r) => new NotFoundError(type, getId(r).toString())
    ),
  }
}
