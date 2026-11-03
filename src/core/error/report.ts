/**
 * 错误上报
 * - 开发环境打印日志
 * - 生产环境上报到监控平台（预留接口）
 */
import type { RequestError } from "@/api/types/request"

export type ErrorType = "api" | "vue" | "global" | "unhandled_rejection" | "custom"

export interface ReportData {
  type: ErrorType
  message?: string
  stack?: string
  code?: number | string
  url?: string
  [key: string]: unknown
}

/**
 * 上报错误
 * - 开发环境：console.error 输出
 * - 生产环境：TODO 接入监控平台（sentry / 小程序后台 / 自建）
 */
export function reportError(data: ReportData): void {
  // 开发环境详细输出
  if (import.meta.env.DEV) {
    console.error("[Error Report]", data)
    return
  }

  // 生产环境：上报到监控平台
  // TODO: 接入实际的监控平台
  try {
    // 示例：uni.reportAnalytics / 自建日志接口
    // uni.request({ url: '/api/log/error', method: 'POST', data })
  } catch {
    // 上报失败静默处理，不能影响业务
  }
}

/**
 * 上报 API 错误
 */
export function reportApiError(error: RequestError, url?: string): void {
  reportError({
    type: "api",
    message: error.message,
    code: error.code || error.statusCode,
    url,
  })
}

/**
 * 埋点上报
 * - 开发环境：console.log
 * - 生产环境：上报到埋点平台
 */
export function trackEvent(event: string, params?: Record<string, unknown>): void {
  if (import.meta.env.DEV) {
    console.log("[Track]", event, params)
    return
  }

  // TODO: 接入埋点系统
  try {
    // uni.reportAnalytics(event, params)
  } catch {
    // silent
  }
}

/**
 * 页面浏览埋点
 */
export function trackPageView(pageUrl: string, params?: Record<string, unknown>): void {
  trackEvent("page_view", { page_url: pageUrl, ...params })
}
