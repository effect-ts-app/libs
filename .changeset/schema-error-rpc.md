---
"effect-app": patch
"@effect-app/infra": patch
---

Pass typed SchemaError failures through query, command, and streaming RPCs.
Every request's error contract includes a JSON codec that preserves native
SchemaError identity and its formatted message without serializing schema
ASTs or input. Schema errors raised as defects remain defects.
