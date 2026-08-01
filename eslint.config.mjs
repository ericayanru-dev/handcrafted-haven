// eslint.config.mjs

import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";
import tseslint from "typescript-eslint";

export default defineConfig([
  ...nextVitals,
  ...nextTs,

  prettierRecommended,

  {
    files: ["**/*.{js,mjs,cjs,ts,tsx}"],

    languageOptions: {
      parserOptions: {
        projectService: {
          allowDefaultProject: ["*.mjs", "*.js"],
        },
        tsconfigRootDir: import.meta.dirname,
      },
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },

    rules: {
      // Prettier
      "prettier/prettier": [
        "warn",
        {
          singleQuote: false,
          semi: true,
          trailingComma: "es5",
          printWidth: 100,
          tabWidth: 2,
          endOfLine: "auto", // Better for Windows
        },
      ],

      // TypeScript
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-floating-promises": "error",

      // General
      "no-console": "warn",
      eqeqeq: ["error", "always"],
    },
  },

  globalIgnores([
    ".next/**",
    "out/**",
    "build/**",
    "dist/**",
    "coverage/**",
    "node_modules/**",
    "next-env.d.ts",
  ]),
]);
