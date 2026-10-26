// Bridge for react-dom — same rationale as ./react.ts.
const ReactDOM: any = (globalThis as any).ReactDOM
if (!ReactDOM) {
  throw new Error(
    'window.ReactDOM not found — check index.html loads react-dom UMD before /src/main.tsx.'
  )
}
export default ReactDOM
export const {
  render,
  hydrate,
  unmountComponentAtNode,
  findDOMNode,
  createPortal,
  flushSync,
  version,
} = ReactDOM
