import cp from "child_process"
import fs from "fs"

import w from "node-watch"

const cmd = process.argv[2]
if (cmd !== "watch") {
  console.log("unknown command: ", cmd)
  process.exit(1)
}

const cmds = process.argv.slice(3)

const dirs = ["../resources/dist", "../types/dist", "../ui/dist"]

const touch = (path: string) => {
  const time = new Date()
  try {
    fs.utimesSync(path, time, time)
  } catch (err) {
    fs.closeSync(fs.openSync(path, "w"))
  }
}

dirs.forEach(d => {
  if (fs.existsSync(d)) {
    w.default(d, { recursive: true }, () => {
      // console.log("change!", d)
      touch("./tsconfig.json")
    })
  }
})

cp.spawn(cmds[0]!, cmds.slice(1), { stdio: "inherit" })
