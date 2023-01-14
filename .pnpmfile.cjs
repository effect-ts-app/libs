module.exports = {
    hooks: {
        ...require("./packages/pnpm-singleton/_cjs/index.cjs").makeHooks({ specificPackages: [
            "@tsplus/stdlib",
            "@effect/core",
            "@effect/cache",
            "@effect-ts/core",
            "@effect-ts/system",
            "@effect/io",
            "@fp-ts/core",
            "@fp-ts/codec",
            "@fp-ts/optic",
            "@fp-ts/data",
            "@fp-ts/schema",
            //"vue",
        ]})
    }
}
 