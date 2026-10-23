---
"effect-app": patch
---

Re-export `HttpMiddleware` from `effect-app/http` with `xForwardedHeaders` keeping the app's error and `HttpServerRequest` requirement.

Effect 4.0.6 types that factory as `HttpMiddleware`, so the result is `Effect<HttpServerResponse, any, any>`. Import `HttpMiddleware` from `effect-app/http`. The copy from `effect/http` is unchanged.
