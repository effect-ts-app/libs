module.exports = {
    hooks: {
        ...require("@effect-ts-app/pnpm-singleton").makeHooks({ specificPackages: [
            "@tsplus/stdlib",
            "@effect/core",
            "@effect/cache",
            "@effect-ts/core",
            "@effect-ts/system",
            "@effect/io",
            "@fp-ts/core",
            "@fp-ts/codec",
            "@fp-ts/data",
            "@fp-ts/schema",
            //"vue",
        ]})
    }
}
