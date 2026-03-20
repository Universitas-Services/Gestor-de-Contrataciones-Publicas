import "@testing-library/jest-dom/vitest";
import { vi } from "vitest";

// 1. Mock para process.env (Soluciona el ReferenceError de Next.js)
vi.stubGlobal("process", {
  ...process,
  env: {
    ...process.env,
    NEXT_PUBLIC_API_URL: "http://localhost:3000/api", // Valor simulado para los tests
  },
});

// 2. Mock para window.matchMedia (Soluciona el TypeError de jsdom / shadcn ui)
Object.defineProperty(window, "matchMedia", {
  writable: true,
  value: vi.fn().mockImplementation((query) => ({
    matches: false,
    media: query,
    onchange: null,
    addListener: vi.fn(), // Deprecated pero requerido por librerías antiguas
    removeListener: vi.fn(), // Deprecated
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  })),
});
