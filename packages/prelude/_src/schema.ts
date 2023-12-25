// // codegen:start {preset: barrel, include: ./schema/*, exclude: [./schema/events.ts, ./schema/overrides.ts]}
// export * from "./schema/_schema.js"
// export * from "./schema/api.js"
// export * from "./schema/shared.js"
// // codegen:end

// export { Email, PhoneNumber } from "./schema/shared.js"
export * from "@effect-app/schema"
export * from "@effect-app/schema/email"
export * from "@effect-app/schema/moreStrings"
export * from "@effect-app/schema/phoneNumber"
export * from "@effect-app/schema/schema"
export * from "@effect-app/schema/strings"

export { void as void_ } from "@effect-app/schema"
