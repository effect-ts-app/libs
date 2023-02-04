// monitor '../resources/dist', '../types/dist', '../ui/dist'
// and spawn the desired command

import cp from "child_process"
import fs from "fs"

import w from "node-watch"

const cmds = process.argv.slice(2)

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
