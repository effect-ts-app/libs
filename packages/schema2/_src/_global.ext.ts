import "./Aspects.js"

import * as AST from "@fp-ts/schema/AST"

/**
 * @tsplus fluent fp-ts/schema/Schema branded
 * @tsplus static fp-ts/schema/Schema.Ops branded
 */
export function branded<A>(s: Schema<any>) {
  return s as Schema<A>
}

/**
 * @tsplus pipeable fp-ts/schema/Schema annotations2
 * @tsplus static fp-ts/schema/Schema.Aspects annotations
 */
export const annotations = <A>(
  fc: (s: Schema<A>) => AST.Annotated["annotations"]
) =>
  (self: Schema<A>): Schema<A> => {
    return Schema.make(AST.annotations(self.ast, fc(self)))
  }
