import { defineConfig } from 'vitest/config';

// Pure-logic unit tests run in Node (no DOM needed — we only test lib functions).
export default defineConfig({
  test: {
    environment: 'node',
    include: ['src/**/*.test.ts'],
  },
});
