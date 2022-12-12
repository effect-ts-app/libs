/// <reference types="vitest" />
import { tsPlugin } from "@effect-ts-app/compiler/vitePlugin"
import path from "path"
import fs from "fs"
export default function makeConfig(dirName?: string) {
  return {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    plugins: [tsPlugin({})],
    test: {
      include: ["./_src/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      exclude: ["./_test/**/*"],
      reporters: "verbose",
      globals: true
    },
    resolve: dirName
      ? {
        alias: {
          [JSON.parse(fs.readFileSync(dirName + "/package.json", "utf-8")).name]: path.resolve(dirName, "/_src")
        } }
      : undefined,
  }
}
