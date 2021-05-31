import * as MO from "@effect-ts/morphic"

const NotFoundError_ = MO.make((F) =>
  F.interface(
    {
      _tag: F.stringLiteral("NotFoundError"),
      message: F.string(),
    },
    {
      name: "NotFoundError",
      extensions: {
        openapiRef: "NotFoundError",
      },
    }
  )
)

export interface NotFoundError extends MO.AType<typeof NotFoundError_> {}
export interface NotFoundErrorE extends MO.EType<typeof NotFoundError_> {}
export const NotFoundError = MO.opaque<NotFoundErrorE, NotFoundError>()(NotFoundError_)

export function notFoundError(message: string) {
  return NotFoundError.build({ _tag: "NotFoundError", message })
}
