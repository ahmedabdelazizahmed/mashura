// Bridge for react/jsx-runtime (used by Vite's automatic JSX transform).
// The UMD build exposes React.createElement/Fragment; we synthesize jsx/jsxs from it.
const React: any = (globalThis as any).React
if (!React) throw new Error('window.React not found for jsx-runtime shim.')

export const Fragment = React.Fragment

const _jsx = (type: any, props: any, key: any) => {
  const { children, ...rest } = props ?? {}
  if (key !== undefined) rest.key = key
  const childArray = Array.isArray(children) ? children : children === undefined ? [] : [children]
  return React.createElement(type, rest, ...childArray)
}

export const jsx = _jsx
export const jsxs = _jsx
export const jsxDEV = _jsx
