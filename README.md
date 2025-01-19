# vite-node-preset

Basic preset to run node project with vite-node

- `__dirname` and `__filename` shims
- `node_modules` as externals (not bundled in `vite build` output)
- `tsconfigPaths`

## Example

```ts
// vite.config.ts
import { viteNodePreset } from '@shantry/vite-node-preset';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    viteNodePreset({
      entry: './src/index.ts',
    }),
  ],
});
```

Multiple entrypoints

```ts
// vite.config.ts

import { viteNodePreset } from '@shantry/vite-node-preset';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  plugins: [
    viteNodePreset({
      entry: {
        entry1: './src/entry1.ts',
        entry2: './src/entry2.ts',
      },
    }),
  ],
});
```