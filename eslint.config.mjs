import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettier from "eslint-config-prettier/flat";

const eslintConfig = defineConfig([
  // Configuración base de Next.js con Core Web Vitals (warnings → errors para métricas web)
  ...nextVitals,

  // Reglas de TypeScript de @typescript-eslint/recommended
  ...nextTs,

  // Desactiva reglas de ESLint que conflictan con Prettier (DEBE ir después de las demás configs)
  prettier,

  // Reglas personalizadas del proyecto
  {
    rules: {
      // Variables no usadas solo como warning (para no bloquear desarrollo)
      "@typescript-eslint/no-unused-vars": "warn",

      // 'any' solo como warning (para migración gradual a tipos estrictos)
      "@typescript-eslint/no-explicit-any": "warn",

      // Permite require() en archivos de configuración (.js)
      "@typescript-eslint/no-require-imports": "off",
    },
  },

  // Ignorar directorios que no deben ser analizados
  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
