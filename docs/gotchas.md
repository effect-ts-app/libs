# Gotchas

## Function suffixes

- `_`: These are the uncurried versions of the function with the same name.
- `_M`: Monadically. Meaning the passed mapper function is applied with `chain` instead of `map`.
- `unsaf

## Importing types

Generally it is advised to import types like `import { Option } from "@effect-ts/core/Option"`,
even if you import the rest of the module like `import * as "@effect-ts/core/Option"`.
It keeps the type signatures leaner.

## When to use Fully Qualified Module names when accessing functions

e.g `S.props` over `props`:

Whenever the majority purpose of the module, is not to work with the imported module `S`.
Aka. if a module is all about defining Schema types, you would not `import * as S` but `import { props }`

## When to use inline pipe `["|>"]` over multi-line `pipe`

Basically as the title says: for quick, often short, inline pipes, use `["|>]`,
but for longer more steps, multi-line pipes, prefer `pipe`

## Data Types

### Chunk

A more performant version of Immutable Array, most of the library returns Chunk in place of Array.


## TODOS

- `All` vs `Index` vs `Search`