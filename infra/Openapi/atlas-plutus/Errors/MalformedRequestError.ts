import * as MO from "@effect-ts/morphic"

const MalformedRequestError_ = MO.make((F) =>
  F.interface(
    {
      _tag: F.stringLiteral("MalformedRequestError"),
      message: F.string(),
    },
    {
      name: "MalformedRequestError",
      extensions: {
        openapiRef: "MalformedRequestError",
      },
    }
  )
)

export interface MalformedRequestError
  extends MO.AType<typeof MalformedRequestError_> {}
export interface MalformedRequestErrorE
  extends MO.EType<typeof MalformedRequestError_> {}
export const MalformedRequestError =
  MO.opaque<MalformedRequestErrorE, MalformedRequestError>()(MalformedRequestError_)

export function malformedRequestError(message: string) {
  return MalformedRequestError.build({ _tag: "MalformedRequestError", message })
}
