const fs = require("fs")
const cp = require("child_process")


const r = cp.execSync("sh ../../scripts/extract.sh", { encoding: "utf-8" })
const s = r.split("\n").sort((a, b) => a < b ? -1 : 1).join("\n")
const items = JSON.parse(`{${s.substring(0, s.length - 1)} }`)
console.log(items)

const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"))
pkg.exports = {
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
  ...items
}
fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2))
