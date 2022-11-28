import { createFilter } from "@rollup/pluginutils"
import fs from "fs"
import path from "path"
import ts from "typescript"
import type * as V from "vite"

import json5 from "json5"

function tsPlugin(options?: { include?: Array<string>; exclude?: Array<string> }): V.Plugin {
  const filter = createFilter(options?.include, options?.exclude)

  const configPath = ts.findConfigFile(
    "./",
    ts.sys.fileExists.bind(ts.sys),
    "tsconfig.json" // "tsconfig.test.json"
  )

  if (!configPath) {
    throw new Error("Could not find a valid \"tsconfig.test.json\".")
  }

  const files: Record<string, { version: number }> = {}
  const registry = ts.createDocumentRegistry()

  let services: ts.LanguageService
  let program: ts.Program

  const initTS = () => {
    const config = json5.parse(fs.readFileSync(configPath).toString())

    Object.assign(config.compilerOptions, {
      sourceMap: false,
      inlineSourceMap: true,
      inlineSources: true,
      noEmit: false,
      // should mean faster tests, but requires a background compiler for the dependencies
      "disableSourceOfProjectReferenceRedirect": true
      // declaration: false,
      // declarationMap: false,
      // module: "ESNext",
      // target: "ES2022",
      // moduleResolution: "node16"
    })

    const tsconfig = ts.parseJsonConfigFileContent(
      config,
      ts.sys,
      path.dirname(path.resolve(configPath))
    )

    if (!tsconfig.options) tsconfig.options = {}
    // fix tsplus not initialising
    const opts = (tsconfig.options as any)
    opts.configFilePath = configPath

    tsconfig.fileNames.forEach(fileName => {
      if (!(fileName in files)) {
        files[fileName] = { version: 0 }
      }
    })

    const servicesHost: ts.LanguageServiceHost = {
      getScriptFileNames: () => tsconfig.fileNames,
      getScriptVersion: fileName => files[fileName]! && files[fileName]!.version.toString(),
      getScriptSnapshot: fileName => {
        if (!fs.existsSync(fileName)) {
          return undefined
        }
        return ts.ScriptSnapshot.fromString(fs.readFileSync(fileName).toString())
      },
      getCurrentDirectory: () => process.cwd(),
      getCompilationSettings: () => tsconfig.options,
      getDefaultLibFileName: options => ts.getDefaultLibFilePath(options),
      fileExists: fileName => fs.existsSync(fileName),
      readFile: fileName => fs.readFileSync(fileName).toString()
    }

    services = ts.createLanguageService(servicesHost, registry)
    program = services.getProgram()!
  }

  initTS()

  return {
    name: "ts-plugin",
    // Vitest Specific Watch
    configureServer(dev) {
      dev.watcher.on("all", (event, path) => {
        if (filter(path)) {
          if (/\.tsx?/.test(path)) {
            switch (event) {
              case "add": {
                if (!program.getSourceFile(path)) {
                  initTS()
                }
                break
              }
              case "change": {
                if (!program.getSourceFile(path)) {
                  initTS()
                } else {
                  files[path]!.version = files[path]!.version + 1
                }
                break
              }
              case "unlink": {
                if (program.getSourceFile(path)) {
                  initTS()
                }
                break
              }
            }
          }
        }
      })
    },
    // Rollup Generic Watch
    watchChange(id, change) {
      if (filter(id)) {
        if (/\.tsx?/.test(id)) {
          switch (change.event) {
            case "create": {
              if (!program.getSourceFile(id)) {
                initTS()
              }
              break
            }
            case "update": {
              if (!program.getSourceFile(id)) {
                initTS()
              } else {
                files[id]!.version = files[id]!.version + 1
              }
              break
            }
            case "delete": {
              if (program.getSourceFile(id)) {
                initTS()
              }
              break
            }
          }
        }
      }
    },
    transform(code, id) {
      const split = id.split("?")
      id = split[0]

      if (filter(id)) {
        if (/\.tsx?/.test(id)) {
          // TODO: wallaby may run code from the editor buffer,
          // so we need a way to check ts files that live in buffer, or write them to disk?
          // remove ?wallaby etc
          // const wallabyId = split[1]
          // const fn = id + "_" + wallabyId + ".tmp" + ".ts"
          // if (wallabyId) {
          //   fs.writeFileSync(fn, code, "utf-8")
          //   id = fn
          //   initTS()
          // }
          // wallaby workaround
          const f = files[id]
          if (f) {
            f.version = f.version + 1
          } else files[id] = { version: 0 }

          const syntactic = services.getSyntacticDiagnostics(id)
          if (syntactic.length > 0) {
            throw new Error(syntactic.map(_ => ts.flattenDiagnosticMessageText(_.messageText, "\n")).join("\n"))
          }
          const semantic = services.getSemanticDiagnostics(id)
          services.cleanupSemanticCache()
          if (semantic.length > 0) {
            throw new Error(semantic.map(_ => ts.flattenDiagnosticMessageText(_.messageText, "\n")).join("\n"))
          }
          const out = services.getEmitOutput(id).outputFiles
          if (out.length === 0) {
            throw new Error("typescript output files is empty")
          }
          code = out[0]!.text
        }
        return {
          code
        }
      }
    }
  }
}

export { tsPlugin }
