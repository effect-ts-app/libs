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
        Request: BuildRequest<
          Fields,
          "/",
          "AUTO",
          M,
          C
        >
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
        Request: BuildRequest<
          Fields,
          "/",
          "AUTO",
          M,
          C
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
          Response: typeof S.Void
        }
      >
      & {
        Request: BuildRequest<
          Fields,
          "/",
          "AUTO",
          M,
          {
            Response: typeof S.Void
          }
        >
      }
  } {
    return <Fields extends S.Struct.Fields, C extends RequestConfig & { success: S.Schema.Any }>(
      fields: Fields,
      config?: C
    ) => {
      const req = config?.success
        ? Req_<C>({ ...config, Response: config.success })<M>()<Fields>(fields)
        : Req_({ ...config, success: S.Void, Response: S.Void })<M>()<Fields>(fields)
      const req2 = Object.assign(req, { Request: req }) // bwc
      return req2
    }
  }

  return Req
}
