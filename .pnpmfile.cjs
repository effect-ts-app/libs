module.exports = {
    hooks: {
        ...require("./packages/pnpm-singleton/_cjs/index.cjs").makeHooks({ specificPackages: [
            "@tsplus/stdlib",
            "@effect/core",
            "@effect/cache",
            "@effect-ts/core",
            "@effect-ts/system",
            //"vue",
        ]})
    }
}
 