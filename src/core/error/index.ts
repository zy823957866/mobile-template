/**
 * 全局错误处理
 * - Vue 组件错误
 * - 全局 JS 错误
 * - 未捕获的 Promise rejection
 *
 * 在 main.ts 中调用 setupErrorHandler() 注册
 */
import type { App } from "vue"
import { reportError } from "./report"

/**
 * 设置 Vue 应用级错误处理
 */
export function setupVueErrorHandler(app: App): void {
  app.config.errorHandler = (err, instance, info) => {
    console.error("[Vue Error]", err, info)

    reportError({
      type: "vue",
      message: err instanceof Error ? err.message : String(err),
      stack: err instanceof Error ? err.stack : undefined,
      info,
    })

    // 开发环境抛出，便于调试
    if (import.meta.env.DEV) {
      throw err
    }
  }
}

/**
 * 设置全局错误监听
 */
export function setupGlobalErrorHandler(): void {
  // 全局 JS 错误
  if (typeof uni.onError === "function") {
    uni.onError((msg: string) => {
      reportError({
        type: "global",
        message: msg,
      })
    })
  }

  // 未捕获的 Promise rejection
  if (typeof uni.onUnhandledRejection === "function") {
    uni.onUnhandledRejection((res: { reason: unknown }) => {
      const reason = res.reason
      reportError({
        type: "unhandled_rejection",
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
      })
    })
  }

  // H5 端额外的全局错误捕获
  // #ifdef H5
  if (typeof window !== "undefined") {
    window.addEventListener("error", (event) => {
      reportError({
        type: "global",
        message: event.message,
        url: event.filename,
        line: event.lineno,
        column: event.colno,
      })
    })

    window.addEventListener("unhandledrejection", (event) => {
      const reason = event.reason
      reportError({
        type: "unhandled_rejection",
        message: reason instanceof Error ? reason.message : String(reason),
        stack: reason instanceof Error ? reason.stack : undefined,
      })
    })
  }
  // #endif
}

/**
 * 统一设置所有错误处理
 */
export function setupErrorHandler(app: App): void {
  setupVueErrorHandler(app)
  setupGlobalErrorHandler()
}
