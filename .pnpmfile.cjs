module.exports = {
    hooks: {
        ...require("@effect-ts-app/pnpm-singleton").makeHooks({ specificPackages: [
            "@tsplus/stdlib",
            "@effect/core",
            "@effect/cache",
            "@effect-ts/core",
            "@effect-ts/system",
            //"vue",
        ]})
    }
}
