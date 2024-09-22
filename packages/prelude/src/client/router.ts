import type { BuildRequest } from "@effect-app/schema/REST"
import { Req as Req_ } from "@effect-app/schema/REST"
import { S } from "../lib.js"

// TODO: get rid of Request in Request and Response in C
export const makeClientRouter = <RequestConfig extends object>() => {
  // Long way around Context/C extends etc to support actual jsdoc from passed in RequestConfig etc...
  type Context = { success: S.Schema.Any }
  function Req<M>(): {
    <Fields extends S.Struct.Fields, C extends Context>(
      fields: Fields,
      config: RequestConfig & C
    ):
      & BuildRequest<
        Fields,
        "/",
        "AUTO",
        M,
        C & { Response: C["success"] }
      >
      & {
        Request: BuildRequest<
          Fields,
          "/",
          "AUTO",
          M,
          C & { Response: C["success"] }
        >
      }
    <Fields extends S.Struct.Fields>(
      fields: Fields,
      config: RequestConfig
    ):
      & BuildRequest<
        Fields,
        "/",
        "AUTO",
        M,
        { success: typeof S.Void; Response: typeof S.Void }
      >
      & {
        Request: BuildRequest<
          Fields,
          "/",
          "AUTO",
          M,
          { success: typeof S.Void; Response: typeof S.Void }
        >
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
          success: typeof S.Void
          Response: typeof S.Void
        }
      >
      & {
        Request: BuildRequest<
          Fields,
          "/",
          "AUTO",
          M,
          { success: typeof S.Void; Response: typeof S.Void }
        >
      }
  } {
    return (<Fields extends S.Struct.Fields, C extends Context>(
      fields: Fields,
      config?: C
    ) => {
      // TODO: get rid of Response, just use success (only all legacy migrated)
      const req = config?.success
        ? Req_<C>({ ...config, Response: config.success })<M>()<Fields>(fields)
        : Req_({ ...config, success: S.Void, Response: S.Void })<M>()<Fields>(fields)
      const req2 = Object.assign(req, { Request: req }) // bwc
      return req2
    }) as any
  }

  return Req
}
