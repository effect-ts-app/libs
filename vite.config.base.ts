/// <reference types="vitest" />
import path from "path"
import fs from "fs"


export default function makeConfig(dirName?: string) {
  const prefix = path.resolve(__dirname, "packages")
  const packages = fs.readdirSync(prefix).map(f => prefix + "/" + f).filter(f => fs.lstatSync(f).isDirectory() )
  return {
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    plugins: [],
    test: {
      include:  ["./src/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      exclude: ["./_test/**/*"],
      reporters: "verbose",
      globals: true
    },
    resolve: packages.reduce((acc, cur) => {
      acc[JSON.parse(fs.readFileSync(cur + "/package.json", "utf-8")).name] = path.resolve(cur, "/src")
      return acc
    }, {})
  }
}
