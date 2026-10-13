---
"effect-app": patch
"@effect-app/vue": patch
---

Add `suspendWaiting` so a command can park on a dialog without the spinner or the waiting toast. The button stays disabled. Both come back when the effect finishes and the rest of the command runs.
