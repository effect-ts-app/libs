import type { BuildRequest } from "@effect-app/schema/REST"
import { Req as Req_ } from "@effect-app/schema/REST"
import { S } from "../lib.js"

export const makeClientRouter = <RequestConfig extends object>() => {
  function Req<M>(): {
    <Fields extends S.Struct.Fields, C extends RequestConfig & { success: S.Schema.Any }>(
      fields: Fields,
      config: C
    ):
      & BuildRequest<
        Fields,
        "/",
        "AUTO",
        M,
        C & {
          Response: C["success"]
        }
      >
      & {
        Request: M
      }
    <Fields extends S.Struct.Fields, C extends RequestConfig>(
      fields: Fields,
      config: C
    ):
      & BuildRequest<
        Fields,
        "/",
        "AUTO",
        M,
        C & {
          Response: typeof S.Void
        }
      >
      & {
        Request: M
      }
    <Fields extends S.Struct.Fields>(
      fields: Fields
    ):
      & BuildRequest<
        Fields,
        "/",
        "AUTO",
        M,
        {
          Response: typeof S.Void
        }
      >
      & {
        Request: M
      }
  } {
    return <Fields extends S.Struct.Fields, C extends RequestConfig & { success: S.Schema.Any }>(
      fields: Fields,
      config?: C
    ) => {
      // TODO: get rid of Response, just use success (only all legacy migrated)
      const req = config?.success
        ? Req_<C>({ ...config, Response: config.success })<M>()<Fields>(fields)
        : Req_({ ...config, success: S.Void, Response: S.Void })<M>()<Fields>(fields)
      const req2 = Object.assign(req, { Request: req }) // bwc
      return req2
    }
  }

  return Req
}
