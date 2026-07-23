import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";
import prettierRecommended from "eslint-plugin-prettier/recommended";
import globals from "globals";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Prettier integration
  prettierRecommended,
  // Custom rules for your project
  {
    files: ["**/*.{ts,tsx,js}"], // Only TypeScript and javascript files
    parser: "@typescript-eslint/parser",
    parserOptions: {
      project: "./tsconfig.json", // 👈 points to your tsconfig
      tsconfigRootDir: __dirname, // ensures relative paths work
    },
    languageOptions: {
      ecmaVersion: 2022,
      sourceType: "module",
      globals: {
        ...globals.browser,
        ...globals.node,
        ...globals.jest,
      },
    },
    rules: {
      // Prettier formatting issues = errors
      "prettier/prettier": [
        "warn",
        {
          singleQuote: true,
          semi: true,
          endOfLine: "lf",
          trailingComma: "es5",
          tabWidth: 2,
          printWidth: 100,
        },
      ],

      // TypeScript rules
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/consistent-type-imports": "error",
      "@typescript-eslint/no-floating-promises": "error",

      // General rules
      "no-console": "warn", // Warn on console logs
      eqeqeq: ["error", "always"], // Enforce strict equality
    },
  },
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    "node_modules/**",
    "dist/**",
    "coverage/**",
  ]),
]);

export default eslintConfig;
