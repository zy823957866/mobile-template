/**
 * 应用全局状态
 * - 语言、主题、设备信息、网络状态、版本号
 */
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { getStoredLocale, setStoredLocale } from "@/utils/storage"

export type ThemeMode = "light" | "dark"
export type NetworkType = "wifi" | "2g" | "3g" | "4g" | "5g" | "unknown" | "none"

export const useAppStore = defineStore("app", () => {
  // ===== State =====

  /** 语言 */
  const locale = ref<string>(getStoredLocale() || "zh-CN")

  /** 主题模式（预留暗黑模式） */
  const theme = ref<ThemeMode>("light")

  /** 设备信息 */
  const deviceInfo = ref<UniApp.GetSystemInfoResult | null>(null)

  /** 网络状态 */
  const networkType = ref<NetworkType>("unknown")
  const isOnline = computed(() => networkType.value !== "none")

  /** App 版本号（从 manifest 读取） */
  const appVersion = ref<string>("0.1.0")

  /** 全局 loading 计数（多个请求同时 loading 时不闪烁） */
  const loadingCount = ref(0)
  const isGlobalLoading = computed(() => loadingCount.value > 0)

  // ===== Actions =====

  /**
   * 初始化：获取设备信息、网络状态
   */
  function init() {
    // 设备信息
    try {
      deviceInfo.value = uni.getSystemInfoSync()
    } catch {
      deviceInfo.value = null
    }

    // 网络状态
    updateNetworkStatus()

    // 监听网络变化
    uni.onNetworkStatusChange((res) => {
      networkType.value = (res.networkType as NetworkType) || "unknown"
    })
  }

  /**
   * 更新网络状态
   */
  function updateNetworkStatus() {
    uni.getNetworkType({
      success: (res) => {
        networkType.value = (res.networkType as NetworkType) || "unknown"
      },
    })
  }

  /**
   * 设置语言
   */
  function setLocale(lang: string) {
    locale.value = lang
    setStoredLocale(lang)
  }

  /**
   * 增加全局 loading 计数
   */
  function pushLoading() {
    loadingCount.value++
  }

  /**
   * 减少全局 loading 计数
   */
  function popLoading() {
    if (loadingCount.value > 0) {
      loadingCount.value--
    }
  }

  /**
   * 重置全局 loading
   */
  function resetLoading() {
    loadingCount.value = 0
  }

  return {
    // state
    locale,
    theme,
    deviceInfo,
    networkType,
    appVersion,
    loadingCount,
    // getters
    isOnline,
    isGlobalLoading,
    // actions
    init,
    updateNetworkStatus,
    setLocale,
    pushLoading,
    popLoading,
    resetLoading,
  }
})
