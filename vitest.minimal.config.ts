/// <reference types="vitest" />
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  test: {
    globals: true,
    environment: 'jsdom',
    setupFiles: [], // Empty array to skip setup files
    testTimeout: 10000,
    include: ['src/test/standalone.test.tsx'],
  },
});
