import * as MO from "@effect-ts/morphic"

const UnauthorizedError_ = MO.make((F) =>
  F.interface(
    {
      _tag: F.stringLiteral("UnauthorizedError"),
      message: F.string(),
    },
    {
      name: "UnauthorizedError",
      extensions: {
        openapiRef: "UnauthorizedError",
      },
    }
  )
)

export interface UnauthorizedError extends MO.AType<typeof UnauthorizedError_> {}
export interface UnauthorizedErrorE extends MO.EType<typeof UnauthorizedError_> {}
export const UnauthorizedError =
  MO.opaque<UnauthorizedErrorE, UnauthorizedError>()(UnauthorizedError_)

export function unauthorizedError(message: string) {
  return UnauthorizedError.build({ _tag: "UnauthorizedError", message })
}
