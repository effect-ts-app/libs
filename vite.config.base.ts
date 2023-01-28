/// <reference types="vitest" />
import { effectPlugin } from "@effect-app/compiler/vitePlugin2"
import path from "path"
import fs from "fs"

const useDist = process.env.TEST_USE_DIST === "true"

export default function makeConfig(dirName?: string) {
  return {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    plugins: useDist ? [] : [effectPlugin({})],
    test: {
      include: useDist ? ["./dist/**/*.test.js"] : ["./_src/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      exclude: ["./_test/**/*"],
      reporters: "verbose",
      globals: true,
      deps: useDist ? { inline: [new RegExp(dirName + "/dist")], } : undefined,
    },
    resolve: dirName
      ? {
        alias: {
          [JSON.parse(fs.readFileSync(dirName + "/package.json", "utf-8")).name]: path.resolve(dirName, useDist ? "/dist" : "/_src")
        } }
      : undefined,
  }
}
