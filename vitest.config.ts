import { defineConfig } from 'vitest/config'

export default defineConfig({
  test: {
    // Several tests run a lesson on large generated data, and the C++ tests compile in parallel beside them.
    // On a slow or busy machine the default 5 seconds is too tight; each such test has its own explicit budget where one matters.
    testTimeout: 60000,
  },
})
