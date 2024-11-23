"use strict";
var __createBinding = (this && this.__createBinding) || (Object.create ? (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    var desc = Object.getOwnPropertyDescriptor(m, k);
    if (!desc || ("get" in desc ? !m.__esModule : desc.writable || desc.configurable)) {
      desc = { enumerable: true, get: function() { return m[k]; } };
    }
    Object.defineProperty(o, k2, desc);
}) : (function(o, m, k, k2) {
    if (k2 === undefined) k2 = k;
    o[k2] = m[k];
}));
var __setModuleDefault = (this && this.__setModuleDefault) || (Object.create ? (function(o, v) {
    Object.defineProperty(o, "default", { enumerable: true, value: v });
}) : function(o, v) {
    o["default"] = v;
});
var __importStar = (this && this.__importStar) || (function () {
    var ownKeys = function(o) {
        ownKeys = Object.getOwnPropertyNames || function (o) {
            var ar = [];
            for (var k in o) if (Object.prototype.hasOwnProperty.call(o, k)) ar[ar.length] = k;
            return ar;
        };
        return ownKeys(o);
    };
    return function (mod) {
        if (mod && mod.__esModule) return mod;
        var result = {};
        if (mod != null) for (var k = ownKeys(mod), i = 0; i < k.length; i++) if (k[i] !== "default") __createBinding(result, mod, k[i]);
        __setModuleDefault(result, mod);
        return result;
    };
})();
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.barrel = void 0;
const generator_1 = __importDefault(require("@babel/generator"));
const parser_1 = require("@babel/parser");
const glob = __importStar(require("glob"));
const io_ts_extra_1 = require("io-ts-extra");
const lodash = __importStar(require("lodash"));
const path = __importStar(require("path"));
/**
 * Bundle several modules into a single convenient one.
 *
 * @example
 * // codegen:start {preset: barrel, include: some/path/*.ts, exclude: some/path/*util.ts}
 * export * from './some/path/module-a'
 * export * from './some/path/module-b'
 * export * from './some/path/module-c'
 * // codegen:end
 *
 * @param include
 * [optional] If specified, the barrel will only include file paths that match this glob pattern
 * @param exclude
 * [optional] If specified, the barrel will exclude file paths that match these glob patterns
 * @param import
 * [optional] If specified, matching files will be imported and re-exported rather than directly exported
 * with `export * from './xyz'`. Use `import: star` for `import * as xyz from './xyz'` style imports.
 * Use `import: default` for `import xyz from './xyz'` style imports.
 * @param export
 * [optional] Only valid if the import style has been specified (either `import: star` or `import: default`).
 * If specified, matching modules will be bundled into a const or default export based on this name. If set
 * to `{name: someName, keys: path}` the relative file paths will be used as keys. Otherwise the file paths
 * will be camel-cased to make them valid js identifiers.
 */
const barrel = ({ meta, options: opts }) => {
    var _a, _b;
    const cwd = path.dirname(meta.filename);
    const nodir = (_a = opts.nodir) !== null && _a !== void 0 ? _a : true;
    const modulegen = (_b = opts.modulegen) !== null && _b !== void 0 ? _b : false;
    const ext = meta.filename.split(".").slice(-1)[0];
    const pattern = opts.include || `*.${ext}`;
    const relativeFiles = glob
        .sync(pattern, { cwd, ignore: opts.exclude, nodir })
        .filter((f) => path.resolve(cwd, f) !== path.resolve(meta.filename))
        .map((f) => `./${f}`.replace(/(\.\/)+\./g, "."))
        .filter((file) => nodir
        ? [".js", ".mjs", ".ts", ".tsx"].includes(path.extname(file))
        : true)
        .map((f) => f.replace(/\.\w+$/, "").replace(/\/$/, ""));
    function last(list) {
        return list[list.length - 1];
    }
    const expectedContent = (0, io_ts_extra_1.match)(opts.import)
        .case(undefined, () => (0, io_ts_extra_1.match)(opts.export)
        .case({ as: "PascalCase" }, (v) => lodash
        .chain(relativeFiles)
        .map((f) => `export * as ${lodash
        .startCase(lodash.camelCase(last(f.split("/"))))
        .replace(/ /g, "") // why?
        .replace(/\//, "")}${"postfix" in v ? v.postfix : ""} from "${f}.js"`)
        .value()
        .join("\n"))
        .default(() => {
        return relativeFiles.map((f) => `export * from "${f}.js"`).join("\n");
    })
        .get())
        .case(String, (s) => {
        const importPrefix = s === "default" ? "" : "* as ";
        const withIdentifiers = lodash
            .chain(relativeFiles)
            .map((f) => ({
            file: f,
            identifier: lodash
                .camelCase(modulegen ? last(f.split("/")) : f)
                .replace(/^([^a-z])/, "_$1")
                .replace(/([\^/])Index$/, "$1")
        }))
            .groupBy((info) => info.identifier)
            .values()
            .flatMap((group) => group.length === 1
            ? group
            : group.map((info, i) => ({
                ...info,
                identifier: `${info.identifier}_${i + 1}`
            })))
            .value();
        const imports = withIdentifiers
            .map((i) => `import ${importPrefix}${i.identifier} from "${i.file}.js"`)
            .join("\n");
        const exportProps = modulegen ? [] : (0, io_ts_extra_1.match)(opts.export)
            .case({ name: String, keys: "path" }, () => withIdentifiers.map((i) => `${JSON.stringify(i.file)}: ${i.identifier}`))
            .default(() => withIdentifiers.map((i) => i.identifier))
            .get();
        const exportPrefix = (0, io_ts_extra_1.match)(opts.export)
            .case(undefined, () => "export")
            .case("default", () => "export default")
            .case({ name: "default" }, () => "export default")
            .case(String, (name) => `export const ${name} =`)
            .case({ name: String }, ({ name }) => `export const ${name} =`)
            .default(() => "")
            .get();
        const exports = exportProps.join(",\n ");
        const moduleGen = withIdentifiers
            .map((i) => {
            const up = `${i.identifier[0].toUpperCase()}${i.identifier.slice(1)}`;
            return `export interface ${up} extends Id<typeof ${i.identifier}> {}
export const ${up}: ${up} = ${i.identifier}`;
        })
            .join("\n");
        const exportss = modulegen ? "" : `\n${exportPrefix} {\n ${exports}\n}`;
        return `${imports}\n${exportss}\n${modulegen && moduleGen
            ? "type Id<T> = T\n/* eslint-disable @typescript-eslint/no-empty-object-type */\n\n" + moduleGen
            : ""}`;
    })
        .get();
    // ignore stylistic differences. babel generate deals with most
    const normalise = (str) => (0, generator_1.default)((0, parser_1.parse)(str, { sourceType: "module", plugins: ["typescript"] }))
        .code
        .replace(/'/g, `"`)
        .replace(/\/index/g, "");
    try {
        if (normalise(expectedContent) === normalise(meta.existingContent)) {
            return meta.existingContent;
        }
    }
    catch (_c) { }
    return expectedContent;
};
exports.barrel = barrel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFycmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3ByZXNldHMvYmFycmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztBQUFBLGlFQUF1QztBQUN2QywwQ0FBcUM7QUFFckMsMkNBQTRCO0FBQzVCLDZDQUFtQztBQUNuQywrQ0FBZ0M7QUFDaEMsMkNBQTRCO0FBRTVCOzs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7OztHQXVCRztBQUNJLE1BQU0sTUFBTSxHQVVkLENBQUMsRUFBRSxJQUFJLEVBQUUsT0FBTyxFQUFFLElBQUksRUFBRSxFQUFFLEVBQUU7O0lBQy9CLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFBO0lBQ3ZDLE1BQU0sS0FBSyxHQUFHLE1BQUEsSUFBSSxDQUFDLEtBQUssbUNBQUksSUFBSSxDQUFBO0lBQ2hDLE1BQU0sU0FBUyxHQUFHLE1BQUEsSUFBSSxDQUFDLFNBQVMsbUNBQUksS0FBSyxDQUFBO0lBRXpDLE1BQU0sR0FBRyxHQUFHLElBQUksQ0FBQyxRQUFRLENBQUMsS0FBSyxDQUFDLEdBQUcsQ0FBQyxDQUFDLEtBQUssQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFBO0lBQ2pELE1BQU0sT0FBTyxHQUFHLElBQUksQ0FBQyxPQUFPLElBQUksS0FBSyxHQUFHLEVBQUUsQ0FBQTtJQUUxQyxNQUFNLGFBQWEsR0FBRyxJQUFJO1NBQ3ZCLElBQUksQ0FBQyxPQUFPLEVBQUUsRUFBRSxHQUFHLEVBQUUsTUFBTSxFQUFFLElBQUksQ0FBQyxPQUFPLEVBQUUsS0FBSyxFQUFFLENBQUM7U0FDbkQsTUFBTSxDQUFDLENBQUMsQ0FBQyxFQUFFLEVBQUUsQ0FBQyxJQUFJLENBQUMsT0FBTyxDQUFDLEdBQUcsRUFBRSxDQUFDLENBQUMsS0FBSyxJQUFJLENBQUMsT0FBTyxD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