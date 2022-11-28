import generate from '@babel/generator';
import { parse } from '@babel/parser';
import type { Preset } from 'eslint-plugin-codegen';
import * as glob from 'glob';
import { match } from 'io-ts-extra';
import * as lodash from 'lodash';
import * as path from 'path';

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
export const barrel: Preset<{
  include?: string;
  exclude?: string | string[];
  import?: 'default' | 'star';
  export?:
    | string
    | { name: string; keys: 'path' | 'camelCase' }
    | { as: 'PascalCase', postfix?: string };
  nodir?: boolean;
}> = ({ meta, options: opts }) => {
  const cwd = path.dirname(meta.filename);
  const nodir = opts.nodir ?? true;

  const ext = meta.filename.split('.').slice(-1)[0];
  const pattern = opts.include || `*.${ext}`;

  const relativeFiles = glob
    .sync(pattern, { cwd, ignore: opts.exclude, nodir })
    .filter((f) => path.resolve(cwd, f) !== path.resolve(meta.filename))
    .map((f) => `./${f}`.replace(/(\.\/)+\./g, '.'))
    .filter((file) =>
      nodir
        ? ['.js', '.mjs', '.ts', '.tsx'].includes(path.extname(file))
        : true,
    )
    .map((f) => f.replace(/\.\w+$/, '').replace(/\/$/, ''));
  
  function last<T>(list: readonly T[]) {
    return list[list.length - 1]
  }

  const expectedContent = match(opts.import)
    .case(undefined, () =>
      match(opts.export)
        .case({ as: 'PascalCase' as const }, (v) =>
          lodash
            .chain(relativeFiles)
            .map(
              (f) =>
                `export * as ${lodash
                  .startCase(lodash.camelCase(last(f.split("/"))))
                  .replace(/ /g, "") // why?
                  .replace(/\//, '')}${"postfix" in v ? v.postfix : ''} from '${f}.js'`,
            )
            .value()
            .join('\n'),
        )
        .default(() => {
          return relativeFiles.map((f) => `export * from '${f}.js'`).join('\n');
        })
        .get(),
    )
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
        .flatMap((group) =>
          group.length === 1
            ? group
            : group.map((info, i) => ({
                ...info,
                identifier: `${info.identifier}_${i + 1}`,
              })),
        )
        .value();

      const imports = withIdentifiers
        .map((i) => `import ${importPrefix}${i.identifier} from '${i.file}.js'`)
        .join('\n');
      const exportProps = match(opts.export)
        .case({ name: String, keys: 'path' }, () =>
          withIdentifiers.map(
            (i) => `${JSON.stringify(i.file)}: ${i.identifier}`,
          ),
        )
        .default(() => withIdentifiers.map((i) => i.identifier))
        .get();

      const exportPrefix = match(opts.export)
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
  const normalise = (str: string) =>
    generate(
      parse(str, { sourceType: 'module', plugins: ['typescript'] }) as any,
    )
      .code.replace(/'/g, `"`)
      .replace(/\/index/g, '');

  try {
    if (normalise(expectedContent) === normalise(meta.existingContent)) {
      return meta.existingContent;
    }
  } catch {}

  return expectedContent;
};
