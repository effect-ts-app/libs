import type {
  InterfaceLA,
  IntersectionLA,
  TaggedUnionLA,
} from "@effect-ts/morphic/Algebra/Config"

import type { Schema, SchemaURI } from "../base"

declare module "@effect-ts/morphic/Algebra/Intersection" {
  interface IntersectionConfig<
    L extends readonly unknown[],
    A extends readonly unknown[]
  > {
    [SchemaURI]: {
      Schemaes: IntersectionLA<L, A, SchemaURI>
    }
  }
}

declare module "@effect-ts/morphic/Algebra/Newtype" {
  interface IsoConfig<L, A, N> {
    [SchemaURI]: {
      Schema: Schema
    }
  }
  interface PrismConfig<L, A, N> {
    [SchemaURI]: {
      Schema: Schema
    }
  }
}

declare module "@effect-ts/morphic/Algebra/Object" {
  interface InterfaceConfig<Props> {
    [SchemaURI]: {
      Schema: InterfaceLA<Props, SchemaURI>
    }
  }
  interface PartialConfig<Props> {
    [SchemaURI]: {
      Schema: InterfaceLA<Props, SchemaURI>
    }
  }
  interface BothConfig<Props, PropsPartial> {
    [SchemaURI]: {
      Schema: InterfaceLA<Props & PropsPartial, SchemaURI>
      SchemaPartial: InterfaceLA<PropsPartial, SchemaURI>
    }
  }
}

declare module "@effect-ts/morphic/Algebra/Primitives" {
  interface NonEmptyArrayConfig<L, A> {
    [SchemaURI]: {
      Schema: Schema
    }
  }
  interface ArrayConfig<L, A> {
    [SchemaURI]: {
      Schema: Schema
    }
  }
  interface NullableConfig<L, A> {
    [SchemaURI]: {
      Schema: Schema
    }
  }
  interface MutableConfig<L, A> {
    [SchemaURI]: {
      Schema: Schema
    }
  }
  interface OptionalConfig<L, A> {
    [SchemaURI]: {
      Schema: Schema
    }
  }
  interface EitherConfig<EE, EA, AE, AA> {
    [SchemaURI]: {
      left: Schema
      right: Schema
    }
  }
  interface OptionConfig<L, A> {
    [SchemaURI]: {
      Schema: Schema
    }
  }
}

declare module "@effect-ts/morphic/Algebra/Refined" {
  interface RefinedConfig<E, A, B> {
    [SchemaURI]: {
      Schema: Schema
      SchemaRefined: Schema
    }
  }
  interface PredicateConfig<E, A> {
    [SchemaURI]: {
      Schema: Schema
    }
  }
}

declare module "@effect-ts/morphic/Algebra/Set" {
  interface SetConfig<L, A> {
    [SchemaURI]: {
      Schema: Schema
    }
  }
}

declare module "@effect-ts/morphic/Algebra/Record" {
  interface RecordConfig<L, A> {
    [SchemaURI]: {
      Schema: Schema
    }
  }
}

declare module "@effect-ts/morphic/Algebra/TaggedUnion" {
  interface TaggedUnionConfig<Types> {
    [SchemaURI]: {
      Schemaes: TaggedUnionLA<Types, SchemaURI>
    }
  }
}

declare module "@effect-ts/morphic/Algebra/Union" {
  interface UnionConfig<Types> {
    [SchemaURI]: {
      Schemaes: {
        [k in keyof Types]: Schema
      }
    }
  }
}
