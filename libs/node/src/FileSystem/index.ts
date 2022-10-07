// ets_tracing: off

import * as fs from "fs"

/**
 * @tsplus type effect/node/NodeFS.Ops
 */
export interface NodeFSOps {
  Tag: Tag<NodeFS>
}
export const NodeFS: NodeFSOps = {
  Tag: Service.Tag<NodeFS>()
}

// LEGACY:begin
export type Flat<A> = { readonly [k in keyof A]: A[k] } extends infer X ? X : never
function makeCase<K extends string>(k: K) {
  const c = Case.tagged(tagName(k))
  return class Base<A> implements Equals, Copy {
    constructor(args: A) {
      Object.assign(this, c(args as any))
    }
    [Equals.sym](this: this, other: unknown): boolean {
      throw new Error("Method not implemented.")
    }
    [Hash.sym](this: this): number {
      throw new Error("Method not implemented.")
    }
    [Copy.sym](this: this, that: Partial<this>): this {
      throw new Error("Method not implemented.")
    }
  }
}
// LEGACY:end

export const tagName = <K extends string>(k: K) =>
  `@effect-ts/node/FileSystem/${k}` as const

export const FSError = <K extends string>(k: K) => makeCase(k)

export class WriteFileError extends FSError("WriteFileError")<{
  readonly error: NodeJS.ErrnoException
  readonly file: fs.PathOrFileDescriptor
  readonly data: string | NodeJS.ArrayBufferView
  readonly options: WriteFileOptions
}> {}

export class ReadFileError extends FSError("ReadFileError")<{
  readonly error: NodeJS.ErrnoException
  readonly path: fs.PathOrFileDescriptor
  readonly flag: string | undefined
}> {}

export class StatError extends FSError("StatError")<{
  readonly error: NodeJS.ErrnoException
  readonly path: fs.PathLike
}> {}

export class AccessError extends FSError("AccessError")<{
  readonly error: NodeJS.ErrnoException
  readonly path: fs.PathLike
  readonly mode: number | undefined
}> {}

export class RmError extends FSError("RmError")<{
  readonly error: NodeJS.ErrnoException
  readonly path: fs.PathLike
  readonly options: fs.RmOptions | undefined
}> {}

export class RmDirError extends FSError("RmDirError")<{
  readonly error: NodeJS.ErrnoException
  readonly path: fs.PathLike
  readonly options: fs.RmDirOptions | undefined
}> {}

export class FileExistsError extends FSError("FileExistsError")<{
  readonly error: AccessError
}> {}

export const FSSymbol = Symbol.for(tagName("FSSymbol"))

export interface WriteFileOptions
  extends Flat<
    fs.ObjectEncodingOptions & {
      mode?: fs.Mode | undefined
      flag?: string | undefined
    }
  > {}

export const makeLiveFS = Effect.succeedWith(() => {
  const writeFile = (
    file: fs.PathOrFileDescriptor,
    data: string | NodeJS.ArrayBufferView,
    options: WriteFileOptions
  ) =>
    Effect.asyncInterrupt<never, WriteFileError, void>((resume) => {
      const controller = new AbortController()
      fs.writeFile(file, data, { ...options, signal: controller.signal }, (error) => {
        if (error) {
          resume(Effect.fail(new WriteFileError({ error, file, data, options })))
        } else {
          resume(Effect.unit)
        }
      })
      return Either.left(
        Effect.succeedWith(() => {
          controller.abort()
        })
      )
    })

  const readFile = (path: fs.PathOrFileDescriptor, flag?: string) =>
    Effect.asyncInterrupt<never, ReadFileError, Buffer>((resume) => {
      const controller = new AbortController()
      fs.readFile(
        path,
        { signal: controller.signal, flag },
        (error: NodeJS.ErrnoException | null, data: Buffer) => {
          if (error) {
            resume(Effect.fail(new ReadFileError({ error, path, flag })))
          } else {
            resume(Effect.succeed(data))
          }
        }
      )
      return Either.left(
        Effect.succeedWith(() => {
          controller.abort()
        })
      )
    })

  const rm = (path: fs.PathLike, options?: fs.RmOptions) =>
    Effect.async<never, RmError, void>((resume) => {
      fs.rm(path, options ?? {}, (error) => {
        if (error) {
          resume(Effect.fail(new RmError({ error, path, options })))
        } else {
          resume(Effect.unit)
        }
      })
    })

  const rmDir = (path: fs.PathLike, options?: fs.RmDirOptions) =>
    Effect.async<never, RmDirError, void>((resume) => {
      fs.rmdir(path, options ?? {}, (error) => {
        if (error) {
          resume(Effect.fail(new RmDirError({ error, path, options })))
        } else {
          resume(Effect.unit)
        }
      })
    })

  const stat = (path: fs.PathLike) =>
    Effect.async<never, StatError, fs.Stats>((resume) => {
      fs.stat(path, (error, stats) => {
        if (error) {
          resume(Effect.fail(new StatError({ error, path })))
        } else {
          resume(Effect.succeed(stats))
        }
      })
    })

  const access = (path: fs.PathLike, mode?: number) =>
    Effect.async<never, AccessError, void>((resume) => {
      fs.access(path, mode, (error) => {
        if (error) {
          resume(Effect.fail(new AccessError({ error, path, mode })))
        } else {
          resume(Effect.unit)
        }
      })
    })

  const fileExists = (path: fs.PathLike) =>
    access(path, fs.constants.F_OK).fold(
      () => false,
      () => true
    )

  return {
    serviceId: FSSymbol,
    writeFile,
    readFile,
    stat,
    access,
    fileExists,
    rm,
    rmDir
  } as const
})

export interface NodeFS extends Effect.Success<typeof makeLiveFS> {}

export const accessors = Effect.deriveLifted(NodeFS.Tag)(
  ["writeFile", "readFile", "stat", "access", "fileExists", "rm", "rmDir"],
  [],
  []
)
/**
 * @tsplus static effect/node/NodeFS.Ops access
 */
export const access = accessors.access
/**
 * @tsplus static effect/node/NodeFS.Ops fileExists
 */
export const fileExists = accessors.fileExists
/**
 * @tsplus static effect/node/NodeFS.Ops readFile
 */
export const readFile = accessors.readFile
/**
 * @tsplus static effect/node/NodeFS.Ops rm
 */
export const rm = accessors.rm
/**
 * @tsplus static effect/node/NodeFS.Ops rmDir
 */
export const rmDir = accessors.rmDir
/**
 * @tsplus static effect/node/NodeFS.Ops stat
 */
export const stat = accessors.stat
/**
 * @tsplus static effect/node/NodeFS.Ops writeFile
 */
export const writeFile = accessors.writeFile

/**
 * @tsplus static effect/node/NodeFS.Ops LiveFS
 */
export const LiveFS = Layer.fromEffect(NodeFS.Tag, makeLiveFS)
