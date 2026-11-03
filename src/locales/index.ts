import { createI18n, type Composer } from "vue-i18n"
import zhCN from "./zh-CN"
import en from "./en"
import de from "./de"
import {
  getStoredLocale as readStoredLocale,
  setStoredLocale as persistLocale,
} from "@/utils/storage"

export type LocaleCode = "zh-CN" | "en" | "de"
export type LocaleRole = "employee" | "visitor" | null

export const localeOptions: Array<{ code: LocaleCode; label: string }> = [
  { code: "zh-CN", label: "简体中文" },
  { code: "en", label: "English" },
  { code: "de", label: "Deutsch" },
]

const SUPPORTED: LocaleCode[] = ["zh-CN", "en", "de"]

let composer: Composer | null = null

/** 按角色返回可用语言：德文仅访客端（员工端仅 中文/English） */
export function getSupportedLocales(role: LocaleRole): LocaleCode[] {
  return role === "employee" ? ["zh-CN", "en"] : SUPPORTED
}

export function resolveLocale(candidate?: string): LocaleCode {
  if (candidate && SUPPORTED.includes(candidate as LocaleCode)) {
    return candidate as LocaleCode
  }
  const fallback = (import.meta.env.VITE_DEFAULT_LOCALE as LocaleCode) || "zh-CN"
  return SUPPORTED.includes(fallback) ? fallback : "zh-CN"
}

export function getStoredLocale(): LocaleCode {
  return resolveLocale(readStoredLocale())
}

export function setupI18n() {
  const i18n = createI18n({
    legacy: false,
    locale: getStoredLocale(),
    fallbackLocale: "zh-CN",
    messages: {
      "zh-CN": zhCN,
      en,
      de,
    },
  })
  composer = i18n.global as Composer
  return i18n
}

/** 获取已初始化的全局 i18n composer，供非组件层（路由守卫等）使用 */
export function getComposer(): Composer {
  if (!composer) {
    throw new Error("i18n has not been initialized, call setupI18n() first")
  }
  return composer
}

/** 切换全局语言并持久化（供“我的”页语言切换调用） */
export function setAppLocale(locale: LocaleCode): void {
  if (composer) {
    composer.locale.value = locale
  }
  persistLocale(locale)
}
