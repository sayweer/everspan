import { defineConfig } from 'vitest/config'

// Standalone Vitest config (decoupled from vite.config.ts). The suite covers
// the pure, framework-agnostic modules under src/lib and the relay's admission
// gate under api/_lib, so a node environment with no jsdom is all that's
// needed. The gate lives beside its function because the serverless bundler
// only resolves what sits under api/ — it is still pure, and still tested.
export default defineConfig({
  test: {
    include: ['src/**/*.test.ts', 'api/**/*.test.ts'],
    environment: 'node',
  },
})
