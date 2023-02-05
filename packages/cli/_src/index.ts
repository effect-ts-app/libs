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

function monitorIndexes(path: string) {
  return w.default(path, { recursive: true }, (_, path) => {
    const pathParts = path.split("/")
    if (pathParts.length < 3) {
      return
    }
    // const dirName = pathParts[pathParts.length - 2]!
    const indexFileName = pathParts.slice(0, -1).join("/") + ".ts"

    // console.log("change!", evt, path, dirName, indexFileName)
    if (!fs.existsSync(indexFileName)) {
      return
    }
    cp.execSync(`pnpm eslint --fix ./'${indexFileName}'`)
  })
}

// TODO: cache, don't do things when it already existed before, so only file is updated, not created.

const startDir = process.cwd()

function packagejson(p: string, levels = 0) {
  process.chdir(path.resolve(startDir, p))

  const r = cp.execSync("sh ../../scripts/extract.sh", { encoding: "utf-8" })
  const s = r.split("\n").sort((a, b) => a < b ? -1 : 1).join("\n")
  const items = JSON.parse(`{${s.substring(0, s.length - 1)} }`) as Record<string, unknown>

  const pkg = JSON.parse(fs.readFileSync("package.json", "utf-8"))
  const exps = {
    ...fs.existsSync("./_src/index.ts")
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
    ...(levels
      ? Object.keys(items)
        .filter(_ => _.split("/").length <= (levels + 1 /* `./` */))
        .reduce((prev, cur) => {
          prev[cur] = items[cur]
          return prev
        }, {} as Record<string, unknown>)
      : items)
    // ...pkg.name === "@effect-app/core" ? {
    //   "./types/awesome": { "types": "./types/awesome.d.ts" }
    // } : {},
  }
  pkg.exports = exps
  fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2))
}

function monitorPackagejson(path: string, levels = 0) {
  w.default(path + "/_src", { recursive: true }, (_, __) => {
    packagejson(path, levels)
  })
}

let cmds = process.argv.slice(3)
switch (cmd) {
  case "watch": {
    const dirs = ["../resources/dist", "../types/dist", "../ui/dist"]

    dirs.forEach(d => {
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
    ;["./_project/api-api/_src", "./_project/resources/_src", "./_project/models/_src"].forEach(monitorIndexes)
    break
  }

  case "index": {
    monitorIndexes("./_src")
    break
  }

  case "packagejson": {
    monitorPackagejson(".")
    break
  }

  case "packagejson-target": {
    const target = process.argv[3]!
    target.split(",").forEach(_ => monitorPackagejson(_, 1))
    cmds = process.argv.slice(4)
    break
  }

  case "packagejson-packages": {
    fs.readdirSync(startDir + "/packages")
      .map(_ => startDir + "/packages/" + _)
      .filter(_ => fs.existsSync(_ + "/package.json") && fs.existsSync(_ + "/_src")).forEach(_ => monitorPackagejson(_))
    break
  }
}

if (cmds.length) {
  const p = cp.spawn(cmds[0]!, cmds.slice(1), { stdio: "inherit" })
  p.on("close", code => process.exit(code ?? 0))
  p.on("exit", code => process.exit(code ?? 0))
  p.on("disconnect", () => process.exit(1))
}
