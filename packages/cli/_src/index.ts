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
  "packagejson-multi",
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

function packagejson(p: string) {
  process.chdir(path.resolve(startDir, p))

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
    ...items
    // ...pkg.name === "@effect-app/core" ? {
    //   "./types/awesome": { "types": "./types/awesome.d.ts" }
    // } : {},
  }
  pkg.exports = exps
  fs.writeFileSync("package.json", JSON.stringify(pkg, null, 2))
}

function monitorPackagejson(path: string) {
  w.default(path + "/_src", { recursive: true }, (_, __) => {
    packagejson(path)
  })
}

const cmds = process.argv.slice(3)
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

  case "packagejson-multi": {
    ;["./_project/resources", "./_project/models"].forEach(monitorPackagejson)
    break
  }

  case "packagejson-packages": {
    fs.readdirSync("./packages")
      .map(_ => "./packages/" + _)
      .filter(_ => fs.existsSync(_ + "/package.json") && fs.existsSync(_ + "/_src")).forEach(monitorPackagejson)
    break
  }
}

if (cmds.length) {
  const p = cp.spawn(cmds[0]!, cmds.slice(1), { stdio: "inherit" })
  p.on("close", code => process.exit(code ?? 0))
  p.on("exit", code => process.exit(code ?? 0))
  p.on("disconnect", () => process.exit(1))
}
