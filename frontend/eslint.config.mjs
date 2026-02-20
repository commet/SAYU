import { dirname } from "path";
import { fileURLToPath } from "url";
import { FlatCompat } from "@eslint/eslintrc";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const compat = new FlatCompat({
  baseDirectory: __dirname,
});

const eslintConfig = [
  {
    ignores: [
      "app/page-backup.tsx",
      "app/gallery/page-new.tsx",
      "src/**/*"
    ]
  },
  ...compat.extends("next/core-web-vitals", "next/typescript"),
  {
    rules: {
      "@typescript-eslint/no-unused-vars": "warn",
      "@typescript-eslint/no-explicit-any": "warn",
      "react/no-unescaped-entities": "warn",
      "@next/next/no-img-element": "warn",
      "react-hooks/exhaustive-deps": "warn",
      "@typescript-eslint/no-require-imports": "warn",
      "@next/next/no-assign-module-variable": "warn",
      "@next/next/no-html-link-for-pages": "warn",
      "react-hooks/rules-of-hooks": "warn",
      "prefer-const": "warn",
      "react/jsx-no-undef": "warn",
      "@typescript-eslint/no-empty-object-type": "warn",
      "react/display-name": "warn",
      "@typescript-eslint/ban-ts-comment": "warn",
      "no-var": "warn",
      "@typescript-eslint/no-unused-expressions": "warn",
      "prefer-spread": "warn",
      "@typescript-eslint/no-wrapper-object-types": "warn",
      "@typescript-eslint/no-unsafe-function-type": "warn"
    }
  }
];

export default eslintConfig;
