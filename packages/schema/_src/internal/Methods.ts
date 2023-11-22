export const GET = "GET"
export type GET = typeof GET

export const POST = "POST"
export type POST = typeof POST

export const PUT = "PUT"
export type PUT = typeof PUT

export const PATCH = "PATCH"
export type PATCH = typeof PATCH

export const DELETE = "DELETE"
export type DELETE = typeof DELETE

export const UPDATE = "UPDATE"
export type UPDATE = typeof UPDATE

export const OPTIONS = "OPTIONS"
export type OPTIONS = typeof OPTIONS

export const HEAD = "HEAD"
export type HEAD = typeof HEAD

export const TRACE = "TRACE"
export type TRACE = typeof TRACE

export type ReadMethods = GET
export type WriteMethods = POST | PUT | PATCH | DELETE

export type Methods = ReadMethods | WriteMethods
