import * as path from "path"

import { NodeFS } from "../src/FileSystem/index.js"

describe("FS", () => {
  it("test file system access to files", () =>
    Effect.gen(function* (_) {
      const filePath = path.join(process.cwd(), "./log.txt")

      const exists = yield* _(NodeFS.fileExists(filePath))

      expect(exists).toBeFalsy()
    })
      .provideSomeLayer(NodeFS.LiveFS)
      .unsafeRunPromise())
})
