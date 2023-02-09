const { readFileSync, writeFileSync } = require("fs")

const file = process.argv[2]
const root = JSON.parse(readFileSync(file, "utf-8"))

const sorted = Object.keys(root)
.sort((a, b) => a.localeCompare(b))
.reduce((acc, key) => ({
  ...acc,
  [key]: root[key].sort((a, b) => a.definitionName.localeCompare(b.definitionName))
}), {})

writeFileSync(file, JSON.stringify(sorted, undefined, 2), "utf-8")
