import { defineConfig, globalIgnores } from "eslint/config";
import nextCoreWebVitals from "eslint-config-next/core-web-vitals";
import nextTypeScript from "eslint-config-next/typescript";

export default defineConfig([
  ...nextCoreWebVitals,
  ...nextTypeScript,
  {
    rules: {
      "@typescript-eslint/no-unused-vars": [
        "warn",
        {
          argsIgnorePattern: "^_",
          varsIgnorePattern: "^_",
        },
      ],
    },
  },
  // Netlify e CMake geram código de terceiros localmente. Esses artefatos não
  // pertencem ao projeto e não devem mascarar problemas no código-fonte Guido.
  globalIgnores([
    ".next/**",
    ".netlify/**",
    "backend/build*/**",
    "coverage/**",
    "next-env.d.ts",
    "scripts/**",
  ]),
]);
