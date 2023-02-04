import cp from "child_process"
import fs from "fs"

import w from "node-watch"

const cmd = process.argv[2]
if (cmd !== "watch" && cmd !== "index" && cmd !== "index-multi") {
  console.log("unknown command: ", cmd)
  process.exit(1)
}

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
}

if (cmds.length) {
  const p = cp.spawn(cmds[0]!, cmds.slice(1), { stdio: "inherit" })
  p.on("close", code => process.exit(code ?? 0))
  p.on("exit", code => process.exit(code ?? 0))
  p.on("disconnect", () => process.exit(1))
}
