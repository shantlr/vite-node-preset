import MagicString from 'magic-string';
import type { Plugin } from 'vite';
import { nodeExternals } from 'rollup-plugin-node-externals';
import path from 'path';
import tsconfigPaths from 'vite-tsconfig-paths';

function shims() {
  // https://dev.to/rxliuli/developing-and-building-nodejs-applications-with-vite-311n
  return {
    name: 'node-shims',
    renderChunk(code, chunk) {
      if (!chunk.fileName.endsWith('.js')) {
        return null;
      }

      const s = new MagicString(code);
      s.prepend(`
import __path from 'path';
import { fileURLToPath as __fileURLToPath } from 'url';
import { createRequire as __createRequire } from 'module';

const __getFilename = () => __fileURLToPath(import.meta.url);
const __getDirname = () => __path.dirname(__getFilename());
const __dirname = __getDirname();
const __filename = __getFilename();
const self = globalThis;
const require = __createRequire(import.meta.url);
`);
      return {
        code: s.toString(),
        map: s.generateMap({ hires: true }),
      };
    },
    apply: 'build',
  } satisfies Plugin;
}

function externals() {
  return {
    ...nodeExternals({
      // Options here if needed
    }),
    name: 'node-externals',
    enforce: 'pre', // The key is to run it before Vite's default dependency resolution plugin
    apply: 'build',
  } satisfies Plugin;
}

function config(options?: {
  entry?: string | string[] | Record<string, string>;
}) {
  const entry = options?.entry ?? 'src/main.ts';
  return {
    name: 'node-config',
    config(conf) {
      return {
        build: {
          outDir: conf?.build?.outDir ?? 'dist',
          lib: {
            entry:
              typeof entry === 'string'
                ? path.resolve(entry)
                : Array.isArray(entry)
                  ? entry.map((e) => path.resolve(e))
                  : Object.fromEntries(
                      Object.entries(entry).map(([k, v]) => [
                        k,
                        path.resolve(v),
                      ]),
                    ),
            formats: ['es'],
            fileName: (format, entryName) =>
              `${path.basename(entryName, path.extname(entryName))}.${format}.js`,
          },
          rollupOptions: {
            external: ['dependencies-to-exclude'],
            // Additional Rollup options here
          },
        },
        resolve: {
          // Change default resolution to node rather than browser
          mainFields: ['module', 'jsnext:main', 'jsnext'],
          conditions: ['node'],
        },
      };
    },
    apply: 'build',
  } satisfies Plugin;
}

/**
 * @example
 */
export const viteNodePreset = (configOptions?: {
  entry?: string | string[] | Record<string, string>;
}): Plugin[] => {
  return [shims(), externals(), config(configOptions), tsconfigPaths()];
};
