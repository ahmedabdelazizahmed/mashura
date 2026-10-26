// Bridge: expose the CDN-loaded React (window.React) as an ES module.
// Vite aliases `react` to this file so our app and the design-system bundle
// share ONE React instance (the CDN copy). Otherwise the bundle's React and
// Vite's node_modules React are different objects, and hooks throw
// "Invalid hook call" from cross-instance context.
const React: any = (globalThis as any).React
if (!React) {
  throw new Error(
    'window.React not found — check index.html loads react UMD before /src/main.tsx.'
  )
}
export default React
export const {
  Children,
  Component,
  Fragment,
  PureComponent,
  StrictMode,
  Suspense,
  cloneElement,
  createContext,
  createElement,
  createRef,
  forwardRef,
  isValidElement,
  lazy,
  memo,
  startTransition,
  useCallback,
  useContext,
  useDebugValue,
  useDeferredValue,
  useEffect,
  useId,
  useImperativeHandle,
  useInsertionEffect,
  useLayoutEffect,
  useMemo,
  useReducer,
  useRef,
  useState,
  useSyncExternalStore,
  useTransition,
  version,
} = React
