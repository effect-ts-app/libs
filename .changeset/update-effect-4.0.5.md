---
"effect-app": patch
"@effect-app/cli": patch
---

Upgrade Effect packages to npm `4.0.5`. `TaggedUnion` and `ExtendTaggedUnion` reject duplicate `_tag` values at compile time, matching `Schema.toTaggedUnion`. JSON Schema for `PositiveInt` and `NonNegativeInt` now includes `Schema.Int`'s safe-integer maximum.
