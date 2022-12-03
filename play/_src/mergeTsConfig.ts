import fs from "fs"
import json5 from "json5"
import path from "path"
//import ts from "typescript"

const configPath = process.argv[2]!
console.log(configPath)

const rootConfig = json5.parse(fs.readFileSync(configPath, "utf-8").toString())

const configs = [rootConfig]
let currentConfig = rootConfig
let relativeRoot = path.dirname(path.resolve(configPath))
while (currentConfig) {
  if (currentConfig.extends) {
    const extendsPath = path.resolve(relativeRoot, currentConfig.extends)
    const c = json5.parse(fs.readFileSync(extendsPath, "utf-8").toString())
    configs.push(c)
    currentConfig = c
    relativeRoot = path.dirname(path.resolve(extendsPath))
  } else {
    currentConfig = undefined
  }
}

const config = [...configs].reverse().reduce((prev, cur) => {
  const { compilerOptions, ...rest } = cur
  Object.assign(prev, rest)
  Object.assign(prev.compilerOptions, compilerOptions)
  return prev
}, { compilerOptions: {} })

if (config.compilerOptions.tsPlusConfig) {
  fs.cpSync(config.compilerOptions.tsPlusConfig, "./tsplus.config.json")
  Object.assign(config.compilerOptions, {
    tsPlusConfig: "./tsplus.config.json",
  })
}

Object.assign(config, {
  extends: undefined,
  references: []
})
console.log(config)

fs.writeFileSync(configPath, JSON.stringify(config, null, 2))

// const tsconfig = ts.parseJsonConfigFileContent(
//   config,
//   ts.sys,
//   path.dirname(path.resolve(configPath))
// )
