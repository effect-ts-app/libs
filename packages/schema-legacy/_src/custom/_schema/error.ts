// tracing: off

// based on the work of Giulio Canti in io-ts (3.x poc stage)

export interface Actual<A> {
  readonly actual: A
}

export interface SingleE<E> {
  readonly error: E
}

export interface CompoundE<E> {
  readonly errors: Chunk<E>
}

export type SchemaError<E> =
  | LeafE<E>
  | RefinementE<SchemaError<E>>
  | RequiredKeyE<PropertyKey, SchemaError<E>>
  | OptionalKeyE<PropertyKey, SchemaError<E>>
  | StructE<SchemaError<E>>
  | PrevE<SchemaError<E>>
  | NextE<SchemaError<E>>
  | CompositionE<SchemaError<E>>
  | MissingKeysE<PropertyKey>
  | OptionalIndexE<number, SchemaError<E>>
  | CollectionE<SchemaError<E>>
  | NamedE<string, SchemaError<E>>
  | IntersectionE<SchemaError<E>>
  | UnionE<SchemaError<E>>
  | MemberE<PropertyKey, SchemaError<E>>

export interface LeafErrors {
  ParseStringE: ParseStringE
  ParseNumberE: ParseNumberE
  ParseObjectE: ParseObjectE
  ParseDateE: ParseDateE
  ParseDateMsE: ParseDateMsE
  ParseBoolE: ParseBoolE
  ParseUuidE: ParseUuidE
  InvalidIntegerE: InvalidIntegerE
  PositiveE: PositiveE
  UnknownRecordE: UnknownRecordE
  LiteralE: LiteralE<string[]>
  NonEmptyE: NonEmptyE<unknown>
  UnknownArrayE: UnknownArrayE
  TaggedUnionExtractKeyE: ExtractKeyE
}

export type LeafError = Extract<LeafErrors[keyof LeafErrors], HasDefaultLeafE>

export const defaultLeafSymbol = Symbol.for("../custom/error/defaultLeaf.js")
export const toTreeSymbol = Symbol.for("../custom/error/defaultLeaf/toTree.js")

export interface HasDefaultLeafE {
  readonly [toTreeSymbol]: Tree<string>
}

// export function isDefaultLeaf<T extends object>(t: T): t is Data.TaggedError("Collection")<T> & T {
//   return typeof t === "object" && t != null && defaultLeafSymbol in t
// }

export type AnyError = SchemaError<HasDefaultLeafE>

//
// Schema Errors
//

export class UnionE<E> extends Data.TaggedError("Union")<{ readonly errors: Chunk<E> }> implements CompoundE<E> {}

export function unionE<E>(errors: Chunk<E>): UnionE<E> {
  return new UnionE({ errors })
}

export class ExtractKeyE extends Data.TaggedError("ExtractKey")<{
  readonly field: string
  readonly keys: readonly string[]
  readonly actual: unknown
}> implements HasDefaultLeafE, Actual<unknown> {
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol](): Tree<string> {
    return tree(
      `cannot extract key ${this.field} from ${
        JSON.stringify(
          this.actual
        )
      }, expected one of ${this.keys.join(", ")}`
    )
  }
}

export function extractKeyE(field: string, keys: readonly string[], actual: unknown) {
  return new ExtractKeyE({ actual, field, keys })
}

export class LeafE<E> extends Data.TaggedError("Leaf")<{ readonly error: E }> implements SingleE<E> {
}

export function leafE<E>(e: E): LeafE<E> {
  return new LeafE({ error: e })
}

export class PrevE<E> extends Data.TaggedError("Prev")<{ readonly error: E }> implements SingleE<E> {
}

export function prevE<E>(e: E): PrevE<E> {
  return new PrevE({ error: e })
}

export class NextE<E> extends Data.TaggedError("Next")<{ readonly error: E }> implements SingleE<E> {
}

export function nextE<E>(e: E): NextE<E> {
  return new NextE({ error: e })
}

export class RefinementE<E> extends Data.TaggedError("Refinement")<{ readonly error: E }> implements SingleE<E> {
}

export function refinementE<E>(e: E): RefinementE<E> {
  return new RefinementE({ error: e })
}

export class NamedE<Name extends string, E> extends Data.TaggedError("Named")<{
  readonly name: Name
  readonly error: E
}> implements SingleE<E> {
}

export function namedE<N extends string, E>(name: N, error: E): NamedE<N, E> {
  return new NamedE({ error, name })
}

export class StructE<E> extends Data.TaggedError("Struct")<{ readonly errors: Chunk<E> }> implements CompoundE<E> {
}

export function structE<E>(errors: Chunk<E>): StructE<E> {
  return new StructE({ errors })
}

export class CollectionE<E> extends Data.TaggedError("Collection")<{ readonly errors: Chunk<E> }>
  implements CompoundE<E>
{
}

export function chunkE<E>(errors: Chunk<E>): CollectionE<E> {
  return new CollectionE({ errors })
}

export class UnknownArrayE extends Data.TaggedError("NotArray")<{ readonly actual: unknown }>
  implements HasDefaultLeafE, Actual<unknown>
{
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(`cannot process ${JSON.stringify(this.actual)}, expected an array`)
  }
}

export function unknownArrayE(actual: unknown): UnknownArrayE {
  return new UnknownArrayE({ actual })
}

export class RequiredKeyE<K, E> extends Data.TaggedError("RequiredKey")<{
  readonly error: E
  readonly key: K
}> implements SingleE<E> {
}

export function requiredKeyE<K, E>(key: K, error: E): RequiredKeyE<K, E> {
  return new RequiredKeyE({ error, key })
}

export class OptionalKeyE<K, E> extends Data.TaggedError("OptionalKey")<{
  readonly error: E
  readonly key: K
}> implements SingleE<E> {
}

export function optionalKeyE<K, E>(key: K, error: E): OptionalKeyE<K, E> {
  return new OptionalKeyE({ error, key })
}

export class OptionalIndexE<I, E> extends Data.TaggedError("OptionalIndex")<{
  readonly index: I
  readonly error: E
}> implements SingleE<E> {
}

export function optionalIndexE<K, E>(index: K, error: E): OptionalIndexE<K, E> {
  return new OptionalIndexE({ error, index })
}

export class MissingKeysE<K> extends Data.TaggedError("Missing")<{ readonly keys: Chunk<K> }> {
}

export function missingKeysE<K>(keys: Chunk<K>): MissingKeysE<K> {
  return new MissingKeysE({ keys })
}

export class CompositionE<E> extends Data.TaggedError("Composition")<{
  readonly errors: Chunk<E>
}> implements CompoundE<E> {
}

export function compositionE<E>(errors: Chunk<E>): CompositionE<E> {
  return new CompositionE({ errors })
}

export class UnknownRecordE extends Data.TaggedError("NotRecord")<{ readonly actual: unknown }>
  implements HasDefaultLeafE, Actual<unknown>
{
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(`cannot process ${JSON.stringify(this.actual)}, expected a record`)
  }
}

export function unknownRecordE(actual: unknown): UnknownRecordE {
  return new UnknownRecordE({ actual })
}

export class MemberE<M, E> extends Data.TaggedError("Member")<{
  readonly member: M
  readonly error: E
}> implements SingleE<E> {
}

export function memberE<M, E>(member: M, error: E): MemberE<M, E> {
  return new MemberE({ error, member })
}

export class IntersectionE<E> extends Data.TaggedError("Intersection")<{
  readonly errors: Chunk<E>
}> implements CompoundE<E> {
}

export function intersectionE<E>(errors: Chunk<E>): IntersectionE<E> {
  return new IntersectionE({ errors })
}

//
// Builtin
//

export class ParseDateE extends Data.TaggedError("NotDateString")<{
  readonly actual: unknown
}> implements HasDefaultLeafE, Actual<unknown> {
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(`cannot process ${JSON.stringify(this.actual)}, expected a date string`)
  }
}

export function parseDateE(actual: unknown): ParseDateE {
  return new ParseDateE({ actual })
}

export class ParseDateMsE extends Data.TaggedError("NotDateMs")<{
  readonly actual: unknown
}> implements HasDefaultLeafE, Actual<unknown> {
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(`cannot process ${JSON.stringify(this.actual)}, expected a date in ms`)
  }
}

export function parseDateMsE(actual: unknown): ParseDateMsE {
  return new ParseDateMsE({ actual })
}

export class LiteralE<KS extends readonly string[]> extends Data.TaggedError("Literal")<{
  readonly actual: unknown
  readonly literals: KS
}> implements HasDefaultLeafE, Actual<unknown> {
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(
      `cannot process ${JSON.stringify(this.actual)}, expected one of `
        + this.literals.join(", ")
    )
  }
}

export class LiteralNumberE<KS extends readonly number[]> extends Data.TaggedError("Literal")<{
  readonly actual: unknown
  readonly literals: KS
}> implements HasDefaultLeafE, Actual<unknown> {
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(
      `cannot process ${JSON.stringify(this.actual)}, expected one of `
        + this.literals.join(", ")
    )
  }
}

export function literalE<KS extends readonly string[]>(
  literals: KS,
  actual: unknown
): LiteralE<KS> {
  return new LiteralE({ literals, actual })
}

export function literalNumberE<KS extends readonly number[]>(
  literals: KS,
  actual: unknown
): LiteralNumberE<KS> {
  return new LiteralNumberE({ literals, actual })
}

export class InvalidIntegerE extends Data.TaggedError("NotInteger")<{
  readonly actual: number
}> implements HasDefaultLeafE, Actual<number> {
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(`cannot process ${JSON.stringify(this.actual)}, expected an integer`)
  }
}

export function invalidIntegerE(actual: number): InvalidIntegerE {
  return new InvalidIntegerE({ actual })
}

export class PositiveE extends Data.TaggedError("NotPositive")<{
  readonly actual: number
}> implements HasDefaultLeafE, Actual<number> {
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(
      `cannot process ${JSON.stringify(this.actual)}, expected to be positive`
    )
  }
}

export function positiveE(actual: number): PositiveE {
  return new PositiveE({ actual })
}

export class NonEmptyE<A> extends Data.TaggedError("NonEmpty")<{
  readonly actual: A
}> implements HasDefaultLeafE, Actual<A> {
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(
      `cannot process ${JSON.stringify(this.actual)}, expected to be not empty`
    )
  }
}

export class CustomE<A> extends Data.TaggedError("Custom")<{
  readonly actual: A
  readonly expected: string
}> implements HasDefaultLeafE, Actual<A> {
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(
      `cannot process ${JSON.stringify(this.actual)}, expected ${this.expected}`
    )
  }
}

export function nonEmptyE<A>(actual: A): NonEmptyE<A> {
  return new NonEmptyE({ actual })
}

export function customE<A>(actual: A, expected: string): CustomE<A> {
  return new CustomE({ actual, expected })
}

export class ParseNumberE extends Data.TaggedError("NotNumber")<{
  readonly actual: unknown
}> implements HasDefaultLeafE, Actual<unknown> {
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(`cannot process ${JSON.stringify(this.actual)}, expected a number`)
  }
}

export function parseNumberE(actual: unknown): ParseNumberE {
  return new ParseNumberE({ actual })
}

export class ParseObjectE extends Data.TaggedError("NotObject")<{
  readonly actual: unknown
}> implements HasDefaultLeafE, Actual<unknown> {
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(`cannot process ${JSON.stringify(this.actual)}, expected an object`)
  }
}

export function parseObjectE(actual: unknown): ParseObjectE {
  return new ParseObjectE({ actual })
}

export class ParseStringE extends Data.TaggedError("NotString")<{
  readonly actual: unknown
}> implements HasDefaultLeafE, Actual<unknown> {
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(`cannot process ${JSON.stringify(this.actual)}, expected an string`)
  }
}

export function parseStringE(actual: unknown): ParseStringE {
  return new ParseStringE({ actual })
}

export class ParseBoolE extends Data.TaggedError("NotBool")<{
  readonly actual: unknown
}> implements HasDefaultLeafE, Actual<unknown> {
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(`cannot process ${JSON.stringify(this.actual)}, expected an string`)
  }
}

export function parseBoolE(actual: unknown): ParseBoolE {
  return new ParseBoolE({ actual })
}

export class ParseUuidE extends Data.TaggedError("NotUUID")<{
  readonly actual: unknown
}> implements HasDefaultLeafE, Actual<unknown> {
  readonly [defaultLeafSymbol] = defaultLeafSymbol

  get [toTreeSymbol]() {
    return tree(`cannot process ${JSON.stringify(this.actual)}, expected an UUID`)
  }
}

//
// Draw
//
export type Forest<A> = Chunk<Tree<A>>

export interface Tree<A> {
  readonly value: A
  readonly forest: Forest<A>
}

const empty = Chunk.empty<never>()

export function tree<A>(value: A, forest: Forest<A> = empty): Tree<A> {
  return {
    value,
    forest
  }
}

export function toTreeWith<E>(
  toTree: (e: E) => Tree<string>
): (de: SchemaError<E>) => Tree<string> {
  const go = (de: SchemaError<E>): Tree<string> => {
    switch (de._tag) {
      case "Leaf": {
        return toTree(de.error)
      }
      case "Refinement": {
        return tree(
          `1 error(s) found while processing a refinement`,
          Chunk(go(de.error))
        )
      }
      case "RequiredKey": {
        return tree(
          `1 error(s) found while processing required key ${JSON.stringify(de.key)}`,
          Chunk(go(de.error))
        )
      }
      case "OptionalKey": {
        return tree(
          `1 error(s) found while processing optional key ${JSON.stringify(de.key)}`,
          Chunk(go(de.error))
        )
      }
      case "OptionalIndex":
        return tree(
          `1 error(s) found while processing optional index ${de.index}`,
          Chunk(go(de.error))
        )
      case "Collection":
        return tree(
          `${de.errors.length} error(s) found while processing a collection`,
          de.errors.map(go)
        )
      case "Struct": {
        return tree(
          `${de.errors.length} error(s) found while processing a struct`,
          de.errors.map(go)
        )
      }
      case "Union": {
        return tree(
          `${de.errors.length} error(s) found while processing a union`,
          de.errors.map(go)
        )
      }
      case "Named": {
        return tree(
          `1 error(s) found while processing ${de.name}`,
          Chunk(go(de.error))
        )
      }
      case "Missing": {
        return tree(
          `${de.keys.length} error(s) found while checking keys`,
          de.keys.map((key) => tree(`missing required key ${JSON.stringify(key)}`))
        )
      }
      case "Member":
        return tree(
          `1 error(s) found while processing member ${JSON.stringify(de.member)}`,
          Chunk(go(de.error))
        )
      case "Intersection":
        return tree(
          `${de.errors.length} error(s) found while processing an intersection`,
          de.errors.map(go)
        )
      case "Prev":
        return go(de.error)
      case "Next":
        return go(de.error)
      case "Composition": {
        return de.errors.length === 1
          ? go(de.errors.unsafeGet(0)) // less noise in the output if there's only one error
          : tree(
            `${de.errors.length} error(s) found while processing a composition`,
            de.errors.map(go)
          )
      }
    }
  }
  return go
}

export function drawTree(tree: Tree<string>): string {
  return tree.value + drawForest("\n", tree.forest)
}

function drawForest(indentation: string, forest: Chunk<Tree<string>>): string {
  let r = ""
  const len = forest.length
  let tree: Tree<string>
  for (let i = 0; i < len; i++) {
    tree = forest.unsafeGet(i)
    const isLast = i === len - 1
    r += indentation + (isLast ? "└" : "├") + "─ " + tree.value
    r += drawForest(indentation + (len > 1 && !isLast ? "│  " : "   "), tree.forest)
  }
  return r
}

export const errorToTree = toTreeWith((e: HasDefaultLeafE) => e[toTreeSymbol])

export const drawError = flow(errorToTree, drawTree)
