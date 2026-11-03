import { defineConfig } from "vite"
import uni from "@dcloudio/vite-plugin-uni"
import AutoImport from "unplugin-auto-import/vite"
import { createRequire } from "node:module"
import { dirname } from "node:path"

const require = createRequire(import.meta.url)
const vueI18nDir = dirname(require.resolve("vue-i18n/package.json"))
const intlifySharedV11 = require.resolve("@intlify/shared/dist/shared.mjs", {
  paths: [vueI18nDir],
})

const resolveIntlifySharedV11 = {
  name: "resolve-intlify-shared-v11",
  enforce: "pre" as const,
  resolveId(source: string, importer?: string) {
    if (
      source === "@intlify/shared" &&
      (importer?.includes("@intlify+message-compiler@11.4.17") ||
        importer?.includes(".pnpm/node_modules/@intlify/message-compiler"))
    ) {
      return intlifySharedV11
    }
    return null
  },
}

// https://vitejs.dev/config/
export default defineConfig(async () => {
  // unocss/vite 为 ESM-only，在 CJS 配置下需动态导入
  const { default: UnoCSS } = await import("unocss/vite")

  return {
    css: {
      preprocessorOptions: {
        scss: {
          api: "modern-compiler",
          silenceDeprecations: ["legacy-js-api"],
        },
      },
    },
    plugins: [
      resolveIntlifySharedV11,
      uni(),
      AutoImport({
        imports: ["vue", "pinia", "vue-i18n"],
        dts: "src/auto-imports.d.ts",
        eslintrc: { enabled: true, filepath: "./.eslintrc-auto-import.json" },
      }),
      UnoCSS(),
    ],
  }
})
