export class Annotation<A> {
  readonly _tag = "Annotation"
  readonly _A!: () => A
}

export function makeAnnotation<A>(): Annotation<A> {
  return new Annotation()
}
