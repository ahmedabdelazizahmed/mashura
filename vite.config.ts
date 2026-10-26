import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import path from 'node:path'
import { fileURLToPath } from 'node:url'

const __dirname = path.dirname(fileURLToPath(import.meta.url))

// The MashuraUI design-system bundle in /public/_ds/ was compiled with React as
// an *external*: it reads bare `React` / `ReactDOM` globals at runtime.
// So index.html loads the react/react-dom UMD bundles from unpkg BEFORE the
// design-system bundle, and Vite aliases the `react`/`react-dom` imports to
// tiny shims that re-export from `window.React` / `window.ReactDOM`.
// Result: one React instance shared between our app and the bundle — no
// "Invalid hook call" from mismatched copies.
const shim = (name: string) =>
  path.resolve(__dirname, `./src/shims/${name}.ts`)

export default defineConfig({
  // Classic JSX runtime → components compile to `React.createElement(...)`
  // instead of importing from `react/jsx-runtime`. Keeps everything on the
  // single `window.React` instance we bridge via the shim below.
  plugins: [react({ jsxRuntime: 'classic' })],
  esbuild: {
    // Auto-inject `import React from 'react'` in every .jsx/.tsx so the
    // React.createElement calls resolve without hand-adding an import.
    jsxInject: `import React from 'react'`,
  },
  resolve: {
    // Array form: order matters — most-specific `react-dom/client` first so it
    // matches before the broader `react-dom` alias.
    alias: [
      { find: '@', replacement: path.resolve(__dirname, './src') },
      { find: /^react-dom\/client$/, replacement: shim('react-dom-client') },
      { find: /^react-dom$/, replacement: shim('react-dom') },
      { find: /^react$/, replacement: shim('react') },
    ],
    dedupe: ['react', 'react-dom'],
  },
  server: {
    port: 5173,
    open: false,
  },
})
