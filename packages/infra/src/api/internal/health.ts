import { HttpMiddleware, HttpServerResponse } from "effect-app/http"

export function serverHealth(version: string) {
  return HttpServerResponse.unsafeJson({ version }).pipe(HttpMiddleware.withLoggerDisabled)
}
