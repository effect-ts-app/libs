module.exports = {
    hooks: {
        ...require("./packages/pnpm-singleton/_cjs/index.cjs").makeHooks({ specificPackages: [
            "effect",
            "date-fns"
            //"vue",
        ]})
    }
}
 