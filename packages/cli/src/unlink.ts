import cp from "child_process"
import fs from "fs"

const pj = (await import(process.cwd() + "/package.json", { assert: { type: "json" } })).default
pj.resolutions = Object.entries(pj.resolutions as Record<string, string>).reduce((acc, [k, v]) => {
  if (k.startsWith("@effect-app/") || k === "effect-app") return acc
  acc[k] = v
  return acc
}, {} as Record<string, string>)

fs.writeFileSync("./package.json", JSON.stringify(pj, null, 2))

cp.execSync("pnpm i", { stdio: "inherit" })
