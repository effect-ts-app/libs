const fs = require("fs")
const cp = require("child_process")


const r = cp.execSync("sh ../../scripts/extract.sh", { encoding: "utf-8" })
const s = r.split("\n").sort((a, b) => a < b ? -1 : 1).join("\n")
const items = JSON.parse(`{${s.substring(0, s.length - 1)} }`)

const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"))
const exps = {
  ".": {
    "import": {
      "types": "./dist/index.d.ts",
      "default": "./dist/index.js"
    },
    "require": {
      "types": "./dist/index.d.ts",
      "default": "./_cjs/index.cjs"
    }
  },
  ...items,
  ...pkg.name === "@effect-ts-app/core" ? {
    "./types/awesome": { "types": "./types/awesome.d.ts" }
  } : {},
}
console.log(exps)
pkg.exports = exps
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2))
