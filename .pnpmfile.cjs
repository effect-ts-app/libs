module.exports = {
    hooks: {
        ...require("./packages/pnpm-singleton/_cjs/index.cjs").makeHooks({ specificPackages: [
            "@tsplus/stdlib",
            "@effect/cache",
            "@effect/data",
            "@effect/io",
            "@fp-ts/schema",
            "date-fns"
            //"vue",
        ]})
    }
}
 