---
"effect-app": patch
"@effect-app/infra": patch
---

Adopt effect's `Rpc.ParseOptions` for RPC encode and decode concurrency, and drop the per-schema `parseOptions` concurrency annotations.

Effect 4 ignores `parseOptions` annotations on schemas. Client and server RPC groups now carry `DefaultParseOptions` (unbounded unless `SCHEMA_CONCURRENCY` is set) via `annotateRpcParseOptions`, applied after prefix and middleware. `decodeEffectConcurrently` is unchanged for call sites that pass parse options themselves.

Dependencies are on `effect@4.0.6`, which includes `Rpc.ParseOptions`. Peers require `effect@^4.0.6`.
