module.exports = {
    hooks: {
        ...require("./packages/pnpm-singleton/_cjs/index.cjs").makeHooks({ specificPackages: [
            "@tsplus/stdlib",
            "@effect/core",
            "@effect/cache",
            "@effect/io",
            "@fp-ts/codec",
            "@effect/data",
            "@fp-ts/schema",
            "date-fns"
            //"vue",
        ]})
    }
}
 