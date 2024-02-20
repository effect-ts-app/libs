import cp from "child_process"
import fs from "fs"

const pj = (await import(process.cwd() + "/package.json", { assert: { type: "json" } })).default

pj.resolutions = {
  ...pj.resolutions,
  "@effect-app/core": "file:../../effect-app/libs/packages/core",
  "@effect-app/eslint-codegen-model": "file:../../effect-app/libs/packages/eslint-codegen-model",
  "effect-app": "file:../../effect-app/libs/packages/prelude",
  "@effect-app/fluent-extensions": "file:../../effect-app/libs/packages/fluent-extensions",
  "@effect-app/infra": "file:../../effect-app/libs/packages/infra",
  "@effect-app/infra-adapters": "file:../../effect-app/libs/packages/infra-adapters",
  "@effect-app/schema": "file:../../effect-app/libs/packages/schema",
  "@effect-app/vue": "file:../../effect-app/libs/packages/vue"
}

fs.writeFileSync("./package.json", JSON.stringify(pj, null, 2))

cp.execSync("pnpm i", { stdio: "inherit" })
