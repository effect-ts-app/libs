const makeBase = require("../../.eslintrc.base")
const base = makeBase(__dirname, true)

module.exports = {
  ...base,
  rules: {
    ...base.rules,
    'codegen/codegen': ['error', { presets: require('@effect-app/eslint-codegen-model') }],
    "@typescript-eslint/no-empty-interface": "off"
  }
}
