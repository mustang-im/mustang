import eslint from "@eslint/js";
import tseslint from "typescript-eslint";

export default tseslint.config(
  eslint.configs.recommended,
  tseslint.configs.recommendedTypeChecked,
  {
    languageOptions: {
      parserOptions: {
        projectService: true,
      },
    },
  },
  {
    rules: {
      // What we really want to check
      // The one rule that we really need. Almost all of these errors are bugs.
      "@typescript-eslint/no-floating-promises": "error",
      // "Async method '...' has no 'await' expression" is just noise. In most cases, these are intentionally, because the subclasses need the await.
      "require-await": "off",
      "@typescript-eslint/require-await": "off",
      // Allow `any`, using other types as boolean etc.
      "@typescript-eslint/await-thenable": "off",
      "@typescript-eslint/no-misused-promises": "off",
      "@typescript-eslint/restrict-plus-operands": "off",
      "@typescript-eslint/no-explicit-any": "off",
      "@typescript-eslint/no-unsafe-argument": "off",
      "@typescript-eslint/no-unused-vars": "off",
      "@typescript-eslint/no-unsafe-member-access": "off",
      "@typescript-eslint/no-unsafe-assignment": "off",
      "@typescript-eslint/no-unsafe-call": "off",
      "@typescript-eslint/no-unsafe-return": "off",
      "@typescript-eslint/no-unsafe-function-type": "off",
      "@typescript-eslint/no-redundant-type-constituents": "off",
      "no-empty": "off",
      // Now, these rules are just stupid. Disabling them with strong conviction.
      "prefer-const": "off"
    }
  }
);
