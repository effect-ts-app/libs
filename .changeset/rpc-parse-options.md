---
"effect-app": patch
"@effect-app/infra": patch
---

Adopt effect's `Rpc.ParseOptions` for RPC encode and decode concurrency, and drop the per-schema `parseOptions` concurrency annotations.

Effect 4 ignores `parseOptions` annotations on schemas. Client and server RPC groups now carry `DefaultParseOptions` (unbounded unless `SCHEMA_CONCURRENCY` is set) via `annotateRpcParseOptions`, applied after prefix and middleware. `decodeEffectConcurrently` is unchanged for call sites that pass parse options themselves.

`effect@4.0.6` is not on npm yet, so this repo temporarily patches `effect@4.0.5` with the `Rpc.ParseOptions` backport from Effect-TS/effect#9665. Drop `patches/effect@4.0.5.patch` once `effect@4.0.6` can be installed. Published packages call `Rpc.ParseOptions` directly, so a consumer still on stock `effect@4.0.5` without that patch cannot import them.
