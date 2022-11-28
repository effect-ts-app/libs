const makeBase = require("../../.eslintrc.base")
const base = makeBase(__dirname, true)

module.exports = {
  ...base,
  extends: [
    ...base.extends,
    "plugin:react/recommended",
    "plugin:react-hooks/recommended",
  ],
  settings: {
    ...base.settings,
    react: {
      version: "detect", // Tells eslint-plugin-react to automatically detect the version of React to use
    },
  },
  rules: {
    ...base.rules,
    "react/prop-types": "off",
    "react/display-name": "off",
  },
}
