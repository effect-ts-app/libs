/* eslint-disable @typescript-eslint/no-explicit-any */
/* eslint-disable @typescript-eslint/no-unsafe-argument */
import cp from "child_process"
import fs from "fs"
import w from "node-watch"

import path from "path"

const _cmd = process.argv[2]
const supportedCommands = [
  "watch",
  "index",
  "index-multi",
  "packagejson",
  "packagejson-target",
  "packagejson-packages"
] as const
if (
  !supportedCommands.includes(_cmd as any)
) {
  console.log("unknown command: ", _cmd)
  process.exit(1)
}

const cmd = _cmd as typeof supportedCommands[number]

function touch(path: string) {
  const time = new Date()
  try {
    fs.utimesSync(path, time, time)
  } catch (err) {
    fs.closeSync(fs.openSync(path, "w"))
  }
}

function* monitorIndexes_(path: string) {
  yield monitorChildIndexes(path)
  const indexFile = path + "/index.ts"
  if (fs.existsSync(indexFile)) {
    yield monitorRootIndexes(path, indexFile)
  }
}

function monitorIndexes(path: string) {
  return [...monitorIndexes_(path)]
}

function monitorChildIndexes(path: string) {
  return w.default(path, { recursive: true }, (_, path) => {
    const pathParts = path.split("/")
    if (pathParts.length < 3) {
      return
    }
    // const dirName = pathParts[pathParts.length - 2]!
    const indexFile = pathParts.slice(0, -1).join("/") + ".ts"

    // console.log("change!", evt, path, dirName, indexFile)
    if (!fs.existsSync(indexFile)) {
      return
    }
    cp.execSync(`pnpm eslint --fix "${indexFile}"`)
  })
}

function monitorRootIndexes(path: string, indexFile: string) {
  return w.default(path, (_, path) => {
    if (path.endsWith(indexFile)) return
    // const dirName = pathParts[pathParts.length - 2]!
    // console.log("change!", evt, path, dirName, indexFile)
    cp.execSync(`pnpm eslint --fix "${indexFile}"`)
  })
}

// TODO: cache, don't do things when it already existed before, so only file is updated, not created.

const startDir = process.cwd()

function packagejson(p: string, levels = 0) {
  const curDir = process.cwd()
  let r = ""
  // TODO: no chdir!
  try {
    process.chdir(path.resolve(startDir, p))
    r = cp.execSync(`sh ${p === "." ? "../.." : startDir}/scripts/extract.sh`, { encoding: "utf-8" })
  } finally {
    process.chdir(curDir)
  }

  const s = r.split("\n").sort((a, b) => a < b ? -1 : 1).join("\n")
  const items = JSON.parse(`{${s.substring(0, s.length - 1)} }`) as Record<string, unknown>

  const pkg = JSON.parse(fs.readFileSync(p + "/package.json", "utf-8"))
  const t = levels
    ? Object
      .keys(items)
      .filter((_) => _.split("/").length <= (levels + 1 /* `./` */))
      .reduce((prev, cur) => {
        prev[cur] = items[cur]
        return prev
      }, {} as Record<string, unknown>)
    : items

  const exps = {
    ...fs.existsSync(p + "/src/index.ts")
      ? {
        ".": {
          "import": {
            "types": "./dist/index.d.ts",
            "default": "./dist/index.js"
          },
          "require": {
            "types": "./dist/index.d.ts",
            "default": "./_cjs/index.cjs"
          }
        }
      }
      : undefined,
    ...Object
      .keys(t)
      .reduce((prev, cur) => {
        if (cur !== "./index" && !cur.includes("/internal/")) prev[cur] = t[cur]
        return prev
      }, {} as Record<string, unknown>)
    // ...pkg.name === "@effect-app/core" ? {
    //   "./types/awesome": { "types": "./types/awesome.d.ts" }
    // } : {},
  }
  pkg.exports = exps
  fs.writeFileSync(p + "/package.json", JSON.stringify(pkg, null, 2))
}

function monitorPackagejson(path: string, levels = 0) {
  packagejson(path, levels)
  w.default(path + "/src", { recursive: true }, (_, __) => {
    packagejson(path, levels)
  })
}

let cmds = process.argv.slice(3)
switch (cmd) {
  case "watch": {
    const dirs = ["../resources/dist", "../types/dist", "../ui/dist"]

    dirs.forEach((d) => {
      if (fs.existsSync(d)) {
        w.default(d, { recursive: true }, () => {
          // console.log("change!", d)
          touch("./tsconfig.json")
        })
      }
    })

    break
  }

  case "index-multi": {
    ;[
      "./_project/api/src",
      "./_project/printworker/src",
      "./_project/api-api/src",
      "./_project/core/src",
      "./_project/resources/src",
      "./_project/models/src",
      "./_project/ui/src",
      "./_project/core/src"
    ]
      .filter(
        (_) => fs.existsSync(_)
      )
      .forEach(monitorIndexes)
    break
  }

  case "index": {
    monitorIndexes("./src")
    break
  }

  case "packagejson": {
    monitorPackagejson(".")
    break
  }

  case "packagejson-target": {
    const target = process.argv[3]!
    target.split(",").forEach((_) => monitorPackagejson(_, 1))
    cmds = process.argv.slice(4)
    break
  }

  case "packagejson-packages": {
    fs
      .readdirSync(startDir + "/packages")
      .map((_) => startDir + "/packages/" + _)
      .filter((_) => fs.existsSync(_ + "/package.json") && fs.existsSync(_ + "/src"))
      .forEach((_) => monitorPackagejson(_))
    break
  }
}

if (cmds.length) {
  const p = cp.spawn(cmds[0]!, cmds.slice(1), { stdio: "inherit" })
  p.on("close", (code) => process.exit(code ?? 0))
  p.on("exit", (code) => process.exit(code ?? 0))
  p.on("disconnect", () => process.exit(1))
}
