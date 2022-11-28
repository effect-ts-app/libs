/// <reference types="vitest" />
import { tsPlugin } from "@effect-ts-app/boilerplate-vue/vitePlugin"
import path from "path"
import { defineConfig } from "vite"

export default function makeConfig() {
  return defineConfig({
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    plugins: [tsPlugin({})],
    test: {
      include: ["./_src/**/*.test.{js,mjs,cjs,ts,mts,cts,jsx,tsx}"],
      exclude: ["./_test/**/*"],
      reporters: "verbose",
      globals: true
    },
    // resolve: {
    //   alias: {
    //     "@effect/io/test": path.resolve(__dirname, "/test"),
    //     "@effect/io": path.resolve(__dirname, "/src")
    //   }
    // }
  })
}
