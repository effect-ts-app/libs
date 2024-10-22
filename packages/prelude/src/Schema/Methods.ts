export type ReadMethods = "GET"
export type WriteMethods = "POST" | "PUT" | "PATCH" | "DELETE"

export type Rest = ReadMethods | WriteMethods

export type System = "OPTIONS" | "HEAD" | "TRACE"

export type All = Rest | System
