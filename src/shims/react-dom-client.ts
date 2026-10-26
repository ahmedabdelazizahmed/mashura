// Bridge for react-dom/client — createRoot lives on window.ReactDOM in the UMD build.
const ReactDOM: any = (globalThis as any).ReactDOM
if (!ReactDOM || !ReactDOM.createRoot) {
  throw new Error(
    'window.ReactDOM.createRoot missing — need react-dom@18 UMD loaded in index.html.'
  )
}
export const createRoot = ReactDOM.createRoot
export const hydrateRoot = ReactDOM.hydrateRoot
