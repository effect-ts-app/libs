const makeBase = require("./.eslintrc.base");

module.exports = function(dir, forceTS) {
  const base = makeBase(dir, forceTS);
  const rules = Object.keys(base.rules).reduce((prev, cur) => {
    // TODO
    if (cur !== "codegen/codegen" && cur !== "@phaphoso/dprint/dprint" && cur !== "eslint:recommended") {
      prev[cur] = base.rules[cur];
    }
    return prev;
  }, {});
  
  const ext = base.extends.filter(
    (cur) =>
      // TODO
      cur !== "plugin:@phaphoso/dprint/recommended"
  );
  return {
    ...base,
    parser: "vue-eslint-parser",
    extends: [
      'eslint:recommended',
      'plugin:vue/vue3-essential',
      ...ext,
      'plugin:prettier-vue/recommended'
    ],
    // plugins: base.plugins.concat(["formatjs"]),
    rules: {
      ...rules,
      'no-undef': 'off',
      'vue/multi-word-component-names': 'warn',
      "vue/valid-v-slot": [
        "error",
        {
          allowModifiers: true,
        },
      ],
    },
  };
  }

// module.exports = {
//   root: true,
//   env: {
//     node: true,
//   },
//   extends: [
//     'plugin:vue/essential',
//     'eslint:recommended',
//     '@vue/typescript/recommended',
//     '@vue/prettier',
//     '@vue/prettier/@typescript-eslint',
//   ],
//   parserOptions: {
//     ecmaVersion: 2020,
//   },
//   rules: {
//     'no-console': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
//     'no-debugger': process.env.NODE_ENV === 'production' ? 'warn' : 'off',
//     '@typescript-eslint/no-var-requires': 0,
//     '@typescript-eslint/explicit-module-boundary-types': 0,
//   },
// }
