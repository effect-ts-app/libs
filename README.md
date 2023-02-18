# Practical use of Effect-TS

This is an opinionated library for full-stack [Effect-TS](https://github.com/Effect-TS/core).
(See repositories for more info and discord link, articles, youtube videos, etc).

WIP [docs](https://github.com/effect-ts-app/docs)

See https://github.com/effect-ts-app/boilerplate for a sample app use.

## Deployment

Uses [Changesets](https://github.com/changesets/changesets/blob/main/README.md)

1. make changes
2. generate and include changeset `pnpm changeset`
3. wait for build which creates a PR
4. inspect the PR, merge when alright
5. await new build and new package deployments

## Thanks

- All contributors
- Michael Arnaldi, Max Brown and the Effect-TS contributors for Effect
  - ZIO Contributors for the excellent ZIO
- 0x706b for the amazing tsplus
- timsmart for excellent tsplus-gen and tsplus-json projects
- Anyone else we're forgetting..
