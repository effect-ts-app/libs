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
var __importStar = (this && this.__importStar) || function (mod) {
    if (mod && mod.__esModule) return mod;
    var result = {};
    if (mod != null) for (var k in mod) if (k !== "default" && Object.prototype.hasOwnProperty.call(mod, k)) __createBinding(result, mod, k);
    __setModuleDefault(result, mod);
    return result;
};
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
    var _a;
    const cwd = path.dirname(meta.filename);
    const nodir = (_a = opts.nodir) !== null && _a !== void 0 ? _a : true;
    const ext = meta.filename.split('.').slice(-1)[0];
    const pattern = opts.include || `*.${ext}`;
    const relativeFiles = glob
        .sync(pattern, { cwd, ignore: opts.exclude, nodir })
        .filter((f) => path.resolve(cwd, f) !== path.resolve(meta.filename))
        .map((f) => `./${f}`.replace(/(\.\/)+\./g, '.'))
        .filter((file) => nodir
        ? ['.js', '.mjs', '.ts', '.tsx'].includes(path.extname(file))
        : true)
        .map((f) => f.replace(/\.\w+$/, '').replace(/\/$/, ''));
    function last(list) {
        return list[list.length - 1];
    }
    const expectedContent = (0, io_ts_extra_1.match)(opts.import)
        .case(undefined, () => (0, io_ts_extra_1.match)(opts.export)
        .case({ as: 'PascalCase' }, (v) => lodash
        .chain(relativeFiles)
        .map((f) => `export * as ${lodash
        .startCase(lodash.camelCase(last(f.split("/"))))
        .replace(/ /g, "") // why?
        .replace(/\//, '')}${"postfix" in v ? v.postfix : ''} from '${f}.js'`)
        .value()
        .join('\n'))
        .default(() => {
        return relativeFiles.map((f) => `export * from '${f}.js'`).join('\n');
    })
        .get())
        .case(String, (s) => {
        const importPrefix = s === 'default' ? '' : '* as ';
        const withIdentifiers = lodash
            .chain(relativeFiles)
            .map((f) => ({
            file: f,
            identifier: lodash
                .camelCase(f)
                .replace(/^([^a-z])/, '_$1')
                .replace(/Index$/, ''),
        }))
            .groupBy((info) => info.identifier)
            .values()
            .flatMap((group) => group.length === 1
            ? group
            : group.map((info, i) => ({
                ...info,
                identifier: `${info.identifier}_${i + 1}`,
            })))
            .value();
        const imports = withIdentifiers
            .map((i) => `import ${importPrefix}${i.identifier} from '${i.file}.js'`)
            .join('\n');
        const exportProps = (0, io_ts_extra_1.match)(opts.export)
            .case({ name: String, keys: 'path' }, () => withIdentifiers.map((i) => `${JSON.stringify(i.file)}: ${i.identifier}`))
            .default(() => withIdentifiers.map((i) => i.identifier))
            .get();
        const exportPrefix = (0, io_ts_extra_1.match)(opts.export)
            .case(undefined, () => 'export')
            .case('default', () => 'export default')
            .case({ name: 'default' }, () => 'export default')
            .case(String, (name) => `export const ${name} =`)
            .case({ name: String }, ({ name }) => `export const ${name} =`)
            .default(() => '')
            .get();
        const exports = exportProps.join(',\n ');
        return `${imports}\n\n${exportPrefix} {\n ${exports}\n}\n`;
    })
        .get();
    // ignore stylistic differences. babel generate deals with most
    const normalise = (str) => (0, generator_1.default)((0, parser_1.parse)(str, { sourceType: 'module', plugins: ['typescript'] }))
        .code.replace(/'/g, `"`)
        .replace(/\/index/g, '');
    try {
        if (normalise(expectedContent) === normalise(meta.existingContent)) {
            return meta.existingContent;
        }
    }
    catch (_b) { }
    return expectedContent;
};
exports.barrel = barrel;
//# sourceMappingURL=data:application/json;base64,eyJ2ZXJzaW9uIjozLCJmaWxlIjoiYmFycmVsLmpzIiwic291cmNlUm9vdCI6IiIsInNvdXJjZXMiOlsiLi4vLi4vc3JjL3ByZXNldHMvYmFycmVsLnRzIl0sIm5hbWVzIjpbXSwibWFwcGluZ3MiOiI7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0FBQUEsaUVBQXdDO0FBQ3hDLDBDQUFzQztBQUV0QywyQ0FBNkI7QUFDN0IsNkNBQW9DO0FBQ3BDLCtDQUFpQztBQUNqQywyQ0FBNkI7QUFFN0I7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7Ozs7O0dBdUJHO0FBQ0ksTUFBTSxNQUFNLEdBU2QsQ0FBQyxFQUFFLElBQUksRUFBRSxPQUFPLEVBQUUsSUFBSSxFQUFFLEVBQUUsRUFBRTs7SUFDL0IsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLE9BQU8sQ0FBQyxJQUFJLENBQUMsUUFBUSxDQUFDLENBQUM7SUFDeEMsTUFBTSxLQUFLLEdBQUcsTUFBQSxJQUFJLENBQUMsS0FBSyxtQ0FBSSxJQUFJLENBQUM7SUFFakMsTUFBTSxHQUFHLEdBQUcsSUFBSSxDQUFDLFFBQVEsQ0FBQyxLQUFLLENBQUMsR0FBRyxDQUFDLENBQUMsS0FBSyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUMsQ0FBQyxDQUFDLENBQUM7SUFDbEQsTUFBTSxPQUFPLEdBQUcsSUFBSSxDQUFDLE9BQU8sSUFBSSxLQUFLLEdBQUcsRUFBRSxDQUFDO0lBRTNDLE1BQU0sYUFBYSxHQUFHLElBQUk7U0FDdkIsSUFBSSxDQUFDLE9BQU8sRUFBRSxFQUFFLEdBQUcsRUFBRSxNQUFNLEVBQUUsSUFBSSxDQUFDLE9BQU8sRUFBRSxLQUFLLEVBQUUsQ0FBQztTQUNuRCxNQUFNLENBQUMsQ0FBQyxDQUFDLEVBQUUsRUFBRSxDQUFDLElBQUksQ0FBQyxPQUFPLENBQUMsR0FBRyxFQUFFLENBQUMsQ0FBQyxLQUFLLElBQUksQ0FBQyxPQUFPLENBQUMsSUFBSSxDQUFDLFFBQVEsQ0FBQyxDQUFDO1NBQ25FLEdBQUcsQ0FBQyxDQUFDLENBQUMsRUFBRSxFQUFFLENB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