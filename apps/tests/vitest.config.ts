import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    include: ['src/**/*.test.ts'],
    testTimeout: 30000,
    hookTimeout: 30000,
    teardownTimeout: 15000,
    // Add hanging-process reporter to detect stuck resources
    reporters: ['default', 'hanging-process'],
    // Use forks to isolate and avoid hanging worker threads
    pool: 'forks',
    environment: 'node',
    // Force single-threaded execution to avoid race conditions
    maxConcurrency: 1,
    // Disable watch mode explicitly
    watch: false,
    globalSetup: ['src/setup/global.ts'],
  },
});
