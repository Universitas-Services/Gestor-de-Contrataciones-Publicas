import { defineConfig } from "vitest/config";
import react from "@vitejs/plugin-react";
import tsconfigPaths from "vite-tsconfig-paths";

export default defineConfig({
  plugins: [
    // Resuelve los path aliases de tsconfig.json (@/ → ./src/)
    tsconfigPaths(),

    // Transforma JSX/TSX de React
    react(),
  ],
  test: {
    // Simula el DOM del navegador (equivalente a jest-environment-jsdom)
    environment: "jsdom",

    // Archivos de setup que se ejecutan antes de cada test
    setupFiles: ["./vitest.setup.ts"],

    // Patrón de archivos de test
    include: ["src/**/*.{test,spec}.{ts,tsx}"],

    // Excluir directorios
    exclude: ["node_modules", ".next", "out", "build"],

    // Reporteros de resultados
    reporters: ["default"],

    // Habilitar globals (describe, it, expect) sin necesidad de importar
    globals: true,
  },
});
