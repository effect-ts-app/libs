import "./Aspects.js"

/**
 * @tsplus fluent fp-ts/schema/Schema branded
 * @tsplus static fp-ts/schema/Schema.Ops branded
 */
export function branded<A>(s: Schema<any>) {
  return s as Schema<A>
}
