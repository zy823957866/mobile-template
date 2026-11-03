/**
 * Loading 拦截器
 * - 请求开始时显示 loading，结束时关闭
 * - 多个请求同时 loading 时不闪烁（计数机制）
 */
import type { RequestInterceptor } from "../types/request"
import { useAppStore } from "@/store/app"

let loadingCount = 0

function showLoading(text: string) {
  loadingCount++
  if (loadingCount === 1) {
    const appStore = useAppStore()
    appStore.pushLoading()
    uni.showLoading({ title: text || "加载中...", mask: true })
  }
}

function hideLoading() {
  if (loadingCount > 0) {
    loadingCount--
  }
  if (loadingCount === 0) {
    const appStore = useAppStore()
    appStore.popLoading()
    uni.hideLoading()
  }
}

export const loadingInterceptor: RequestInterceptor = {
  request(config) {
    if (config.loading) {
      showLoading(config.loadingText || "")
    }
    return config
  },
  finally(config) {
    if (config.loading) {
      hideLoading()
    }
  },
}
