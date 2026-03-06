import { resolve } from 'path';
import swc from 'unplugin-swc';
import { defineConfig } from 'vitest/config';

export default defineConfig({
  test: {
    globals: true,
    root: './',
    coverage: {
      provider: 'v8',
      reporter: ['text', 'lcov', 'html'],
      exclude: [
        // Modules are pure DI wiring — no logic to cover
        '**/*.module.ts',
        // Health check is infrastructure-only
        'src/modules/health/**',
        // Database config, migrations, schema, seed — not application logic
        'src/config/**',
        // Application entry point
        'src/main.ts',
        // Barrel re-exports
        '**/index.ts',
        // Type-only artifacts
        '**/*.dto.ts',
        '**/*.enum.ts',
        '**/*.interface.ts',
        '**/*.decorator.ts',
        // External service providers tested via integration
        'src/shared/providers/drizzle.service.ts',
        'src/shared/providers/s3.provider.ts',
        'src/shared/providers/resend.provider.ts',
        'src/shared/providers/LogBuilder.service.ts',
        // Test files themselves
        '**/*.spec.ts',
      ],
    },
  },
  plugins: [
    // This is required to build the test files with SWC
    swc.vite({
      // Explicitly set the module type to avoid inheriting this value from a `.swcrc` config file
      module: { type: 'es6' },
    }),
  ],
  resolve: {
    alias: {
      '@config': resolve(__dirname, './src/config'),
      '@modules': resolve(__dirname, './src/modules'),
      '@shared': resolve(__dirname, './src/shared'),
    },
  },
});
