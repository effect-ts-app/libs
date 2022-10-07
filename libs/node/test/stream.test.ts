import * as fs from "fs"
import * as path from "path"
import * as zlib from "zlib"

import { Byte } from "../src/Byte/index.js"
import { NodeStream } from "../src/Stream/index.js"

describe("Node Stream", () => {
  it("build from readable", async () => {
    const res = await pipe(
      NodeStream.streamFromReadable(() =>
        fs.createReadStream(path.join(__dirname, "fix/data.txt"))
      ),
      NodeStream.runBuffer
    ).unsafeRunPromise()

    expect(res.toString("utf-8")).toEqual("a, b, c")
  })
  it("transform (gzip/gunzip)", async () => {
    const res = await pipe(
      NodeStream.streamFromReadable(() =>
        fs.createReadStream(path.join(__dirname, "fix/data.txt"))
      ),
      NodeStream.transform(zlib.createGzip),
      NodeStream.runBuffer
    )
      .flatMap((x) =>
        pipe(
          Stream.fromChunk(Byte.chunk(x)),
          NodeStream.transform(zlib.createGunzip),
          NodeStream.runBuffer
        )
      )
      .unsafeRunPromise()

    expect(res.toString("utf-8")).toEqual("a, b, c")
  })
})
