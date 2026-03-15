import { resolve } from "path";
import swc from "unplugin-swc";
import { defineConfig } from "vitest/config";

export default defineConfig({
  test: {
    globals: true,
    include: ["test/**/*.e2e-spec.ts"],
    environment: "node",
  },
  plugins: [
    swc.vite({
      module: { type: "es6" },
    }),
  ],
  resolve: {
    alias: {
      "@config": resolve(__dirname, "./src/config"),
      "@modules": resolve(__dirname, "./src/modules"),
      "@shared": resolve(__dirname, "./src/shared"),
    },
  },
});
