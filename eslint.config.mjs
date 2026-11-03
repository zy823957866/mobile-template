import eslint from "@eslint/js"
import tseslint from "typescript-eslint"
import pluginVue from "eslint-plugin-vue"
import prettier from "eslint-config-prettier"
import { createRequire } from "node:module"

const require = createRequire(import.meta.url)

/** @type {Record<string, "readonly">} */
let autoImportGlobals
try {
  autoImportGlobals = require("./.eslintrc-auto-import.json").globals ?? {}
} catch {
  autoImportGlobals = {}
}

export default tseslint.config(
  {
    ignores: [
      "dist/**",
      "unpackage/**",
      "node_modules/**",
      "**/*.d.ts",
      ".eslintrc-auto-import.json",
      "src/uni.scss",
    ],
  },
  eslint.configs.recommended,
  ...tseslint.configs.recommended,
  ...pluginVue.configs["flat/recommended"],
  {
    files: ["**/*.{js,mjs,cjs,ts,vue}"],
    languageOptions: {
      globals: {
        ...autoImportGlobals,
        console: "readonly",
        window: "readonly",
        document: "readonly",
        navigator: "readonly",
        setTimeout: "readonly",
        clearTimeout: "readonly",
        setInterval: "readonly",
        clearInterval: "readonly",
        uni: "readonly",
        wx: "readonly",
        getApp: "readonly",
        getCurrentPages: "readonly",
        UniApp: "readonly",
      },
    },
  },
  {
    files: ["**/*.vue"],
    languageOptions: {
      parserOptions: {
        parser: tseslint.parser,
        extraFileExtensions: [".vue"],
        sourceType: "module",
      },
    },
  },
  {
    rules: {
      "vue/multi-word-component-names": "off",
      "vue/html-self-closing": "off",
      "@typescript-eslint/no-explicit-any": "warn",
      "@typescript-eslint/no-unused-vars": ["warn", { argsIgnorePattern: "^_" }],
    },
  },
  prettier
)
