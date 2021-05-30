import * as MO from "@effect-ts/morphic"

const InternalServerError_ = MO.make((F) =>
  F.interface(
    {
      _tag: F.stringLiteral("InternalServerError"),
      message: F.string(),
    },
    {
      name: "InternalServerError",
      extensions: {
        openapiRef: "InternalServerError",
      },
    }
  )
)

export interface InternalServerError extends MO.AType<typeof InternalServerError_> {}
export interface InternalServerErrorE extends MO.EType<typeof InternalServerError_> {}
export const InternalServerError =
  MO.opaque<InternalServerErrorE, InternalServerError>()(InternalServerError_)

export function internalServerError(message: string) {
  return InternalServerError.build({ _tag: "InternalServerError", message })
}
