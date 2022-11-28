module.exports = (dirName, forceTS = false) => {
  const enableTS = !!dirName && (forceTS || process.env.ESLINT_TS || process.env.GITHUB_ACTIONS)
  return {
    parser: "@typescript-eslint/parser", // Specifies the ESLint parser
    parserOptions: {
      // https://github.com/typescript-eslint/typescript-eslint/issues/2094
      EXPERIMENTAL_useSourceOfProjectReferenceRedirect: true,
      enableTS,
      parser: "@typescript-eslint/parser",
      ecmaVersion: 2020, // Allows for the parsing of modern ECMAScript features
      sourceType: "module", // Allows for the use of imports
      ...(enableTS ? { 
        tsconfigRootDir: dirName,
        project: ['./tsconfig.json'],
      } : undefined)
    },
    settings: {
      "import/parsers": {
        "@typescript-eslint/parser": [".ts", ".tsx"],
      },
      "import/resolver": {
        typescript: {
          alwaysTryTypes: true,
        }, // this loads <rootdir>/tsconfig.json to eslint
      },
    },
    extends: [
      "eslint:recommended",
      "plugin:@typescript-eslint/eslint-recommended",
      "plugin:@typescript-eslint/recommended",
      enableTS ? "plugin:@typescript-eslint/recommended-requiring-type-checking" : null,
      //"plugin:jest/recommended",
     // "plugin:prettier/recommended", // Enables eslint-plugin-prettier and displays prettier errors as ESLint errors. Make sure this is always the last configuration in the extends array.
     "plugin:@phaphoso/dprint/recommended"
    ].filter(x => x !== null),
    plugins: ["import", "codegen", "sort-destructure-keys", "simple-import-sort",  "unused-imports"],
    rules: {
      "@phaphoso/dprint/dprint": [
        "error",
        {
          config: {
            // The TypeScript configuration of dprint
            // See also https://dprint.dev/plugins/typescript/config/,
            "indentWidth": 2,
            "semiColons": "asi",
            "quoteStyle": "alwaysDouble",
            "trailingCommas": "never",
            "operatorPosition": "maintain",
            "useParentheses": "preferNone"
          }
        }
      ],
      "no-unexpected-multiline": "off",
      "arrow-parens": [2, "as-needed"],
      "no-restricted-imports": ["error", { "paths": [
        { name: ".", "message": "Please import from the specific file instead. Imports from index in the same directory are almost always wrong (circular)."},
        { name: "./", "message": "Please import from the specific file instead. Imports from index in the same directory are almost always wrong (circular)."},
        { name: "./index", "message": "Please import from the specific file instead. Imports from index in the same directory are almost always wrong (circular)."}
      ] }],

      "@typescript-eslint/consistent-type-imports": "error",

      'codegen/codegen': ['error', { presets: require('@effect-ts-app/boilerplate-eslint/dist/presets/barrel') }],

      // We like namespaces, where ES modules cannot compete (augmenting existing types)
      "@typescript-eslint/no-namespace": "off",

      // "@typescript-eslint/no-unused-vars": [
      //   "error",
      //   { argsIgnorePattern: "^_", ignoreRestSiblings: true },
      // ],
      "no-unused-vars": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "unused-imports/no-unused-imports": "error",
      "unused-imports/no-unused-vars": [
        "warn",
        { "vars": "all", "varsIgnorePattern": "^_", "args": "after-used", "argsIgnorePattern": "^_", "ignoreRestSiblings": true }
      ],
      // functions are alright, the problem is however that the functions may depend on classes or variables defined later...
      "@typescript-eslint/no-use-before-define": ["warn", { functions: false, classes: true, variables: true}],
      "@typescript-eslint/explicit-function-return-type": "off",
      "@typescript-eslint/interface-name-prefix": "off",
      "@typescript-eslint/no-empty-interface": [
        "error",
        {
          allowSingleExtends: true,
        },
      ],
      // Place to specify ESLint rules. Can be used to overwrite rules specified from the extended configs
      // e.g. "@typescript-eslint/explicit-function-return-type": "off",
      "sort-destructure-keys/sort-destructure-keys": "error", // Mainly to sort render props

      "sort-imports": "off",
      "import/first": "error",
      //"import/no-cycle": "error",
      "import/newline-after-import": "error",
      "import/no-duplicates": "error",
      // eslint don't understand some imports very well
      "import/no-unresolved": "off",
      "import/order": "off",
      //"simple-import-sort/imports": "error",
      "simple-import-sort/imports": "off", // problem with dprint?

      "object-shorthand": "error",

      // a nice idea for some parts of the code, but definitely not all.
      //"@typescript-eslint/explicit-module-boundary-types": "off",

      ...(enableTS ? {
        "@typescript-eslint/restrict-template-expressions": "warn",
        "@typescript-eslint/restrict-plus-operands": "off",
        "@typescript-eslint/no-unsafe-assignment": "warn",
        "@typescript-eslint/no-unsafe-call": "warn",
        "@typescript-eslint/no-unsafe-return": "warn",
        "@typescript-eslint/no-unsafe-argument": "warn",
        "@typescript-eslint/no-unsafe-member-access": "warn",
        "@typescript-eslint/no-misused-promises": "warn"
      }: undefined)
    },
  }
}
