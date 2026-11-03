/**
 * 错误处理拦截器
 * - 401：清除登录态，跳登录页
 * - 网络错误：统一提示
 * - 业务错误：统一 Toast 提示
 */
import type { RequestInterceptor } from "../types/request"
import { removeToken, removeStoredRole } from "@/utils/storage"

/** HTTP 状态码映射 */
const STATUS_ERRORS: Record<number, string> = {
  400: "请求参数错误",
  401: "登录已过期，请重新登录",
  403: "无权限访问",
  404: "请求的资源不存在",
  408: "请求超时",
  429: "请求过于频繁，请稍后再试",
  500: "服务器内部错误",
  502: "网关错误",
  503: "服务不可用",
  504: "网关超时",
}

function handle401() {
  // 清除登录态
  removeToken()
  removeStoredRole()
  // 跳登录页
  uni.reLaunch({ url: "/pages/login/login" })
}

function showError(message: string) {
  uni.showToast({
    title: message,
    icon: "none",
    duration: 2000,
  })
}

export const errorInterceptor: RequestInterceptor = {
  error(error, config) {
    if (config.showError === false) return false

    const statusCode = error.statusCode || 0
    let message = error.message || "请求失败，请稍后重试"

    // 网络错误（statusCode 为 0 或无状态码）
    if (statusCode === 0) {
      message = "网络异常，请检查网络连接"
      showError(message)
      return false
    }

    // 401 特殊处理
    if (statusCode === 401 || error.code === 401) {
      message = STATUS_ERRORS[401]
      handle401()
      showError(message)
      return true // 已处理
    }

    // HTTP 状态码错误
    if (statusCode >= 400) {
      message = STATUS_ERRORS[statusCode] || message
      showError(message)
      return false
    }

    // 业务错误（code 非 0）
    if (error.code && error.code !== 0) {
      message = error.message || "操作失败"
      showError(message)
      return false
    }

    showError(message)
    return false
  },
}
