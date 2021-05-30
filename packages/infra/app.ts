/* eslint-disable @typescript-eslint/no-explicit-any */
import * as T from "@effect-ts/core/Effect"
import { flow } from "@effect-ts-app/core/ext/Function"
import * as S from "@effect-ts-app/core/ext/Schema"

import { NotFoundError, UnauthorizedError } from "./errors"

export function handle<
  TModule extends Record<
    string,
    any //{ Model: S.SchemaAny; new (...args: any[]): any } | S.SchemaAny
  >,
  TRes extends { Model: S.SchemaAny } | S.SchemaAny = typeof S.Void
>(
  _: TModule & { Response?: TRes; ResponseOpenApi?: any },
  adaptResponse?: any
): <R, E>(
  h: (
    r: InstanceType<
      S.GetRequest<TModule> extends { new (...args: any[]): any }
        ? S.GetRequest<TModule>
        : never
    >
  ) => T.Effect<R, E, S.ParsedShapeOf<Extr<TRes>>>
) => {
  h: typeof h
  Request: S.GetRequest<TModule>
  Response: TRes
  ResponseOpenApi: any
} {
  // TODO: Prevent over providing // no strict/shrink yet.
  const Request = S.extractRequest(_)
  const Response = (_.Response ?? S.Void) as TRes

  return <R, E>(
    h: (
      r: InstanceType<
        S.GetRequest<TModule> extends { new (...args: any[]): any }
          ? S.GetRequest<TModule>
          : never
      >
    ) => T.Effect<R, E, S.ParsedShapeOf<Extr<TRes>>>
  ) =>
    ({
      adaptResponse,
      h,
      Request,
      Response,
      ResponseOpenApi: _.ResponseOpenApi ?? Response,
    } as any)
}

type Extr<T> = T extends { Model: S.SchemaAny }
  ? T["Model"]
  : T extends S.SchemaAny
  ? T
  : never

export function accessM_<T, UserId, Err>(
  canAccess: (rsc: T, userId: UserId) => boolean,
  bad: (rsc: T, userId: UserId) => Err
) {
  return <R, E, A>(
    rsc: T,
    userId: UserId,
    ok: (rsc: T) => T.Effect<R, E, A>
  ): T.Effect<R, E | Err, A> => {
    if (canAccess(rsc, userId)) {
      return ok(rsc)
    }
    return T.fail(bad(rsc, userId))
  }
}

export function access_<T, UserId, Err>(
  canAccess: (rsc: T, userId: UserId) => boolean,
  bad: (rsc: T, userId: UserId) => Err
) {
  const auth = accessM_(canAccess, bad)
  return <A>(rsc: T, userId: UserId, ok: (rsc: T) => A) =>
    auth(rsc, userId, flow(ok, T.succeed))
}

export function accessM<T, UserId, Err>(
  canAccess: (rsc: T, userId: UserId) => boolean,
  bad: (rsc: T, userId: UserId) => Err
) {
  return <R, E, A>(userId: UserId, ok: (rsc: T) => T.Effect<R, E, A>) =>
    (rsc: T): T.Effect<R, E | Err, A> => {
      if (canAccess(rsc, userId)) {
        return ok(rsc)
      }
      return T.fail(bad(rsc, userId))
    }
}

export function access<T, UserId, Err>(
  canAccess: (rsc: T, userId: UserId) => boolean,
  bad: (rsc: T, userId: UserId) => Err
) {
  const auth = accessM(canAccess, bad)
  return <A>(userId: UserId, ok: (rsc: T) => A) => auth(userId, flow(ok, T.succeed))
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
