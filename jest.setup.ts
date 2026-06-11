const originalConsoleError = console.error.bind(console)

// react-test-renderer ships its own react-reconciler copy which warns about
// act() on every async state update regardless of RNTL's internal act() usage.
// This is a known React 19 + RNTL v14 compatibility noise — filter it out so
// real console.error calls (actual component errors) still surface.
console.error = (...args: Parameters<typeof console.error>) => {
  if (typeof args[0] === 'string' && args[0].includes('not configured to support act')) return
  if (typeof args[0] === 'string' && args[0].includes('overlapping act() calls')) return
  originalConsoleError(...args)
}
