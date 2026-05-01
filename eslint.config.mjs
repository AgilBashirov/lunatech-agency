import { defineConfig, globalIgnores } from "eslint/config";
import nextVitals from "eslint-config-next/core-web-vitals";
import nextTs from "eslint-config-next/typescript";

const eslintConfig = defineConfig([
  ...nextVitals,
  ...nextTs,
  // Override default ignores of eslint-config-next.
  globalIgnores([
    // Default ignores of eslint-config-next:
    ".next/**",
    "out/**",
    "build/**",
    "next-env.d.ts",
    // Sandbox worktrees created by the `.claude/` tooling carry their own
    // nested `.next/` and other generated files. The default `.next/**`
    // glob is anchored at the repo root, so without this entry the lint
    // run sweeps in 700+ false errors from `.claude/worktrees/**/.next/**`.
    ".claude/**",
  ]),
]);

export default eslintConfig;
