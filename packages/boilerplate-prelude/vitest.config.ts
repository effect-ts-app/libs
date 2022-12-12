/// <reference types="vitest" />
import { defineConfig } from "vite"
import makeConfig from "../../vite.config.base"
import path from "path"

export default defineConfig({
  ...makeConfig(__dirname),
})
