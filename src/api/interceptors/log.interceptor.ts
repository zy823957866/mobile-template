/**
 * 日志拦截器
 * - 开发环境打印请求/响应日志
 * - 生产环境不上报（预留上报接口）
 */
import type { RequestInterceptor } from "../types/request"

const isDev = import.meta.env.DEV

export const logInterceptor: RequestInterceptor = {
  request(config) {
    if (!isDev) return config

    console.log(
      `%c[REQ] ${config.method} ${config.url}`,
      "color: #3b82f6; font-weight: bold;",
      config.data || ""
    )
    return config
  },
  response(data, config) {
    if (!isDev) return data

    console.log(
      `%c[RES] ${config.method} ${config.url}`,
      "color: #10b981; font-weight: bold;",
      data
    )
    return data
  },
  error(error, config) {
    if (!isDev) return false

    console.error(
      `%c[ERR] ${config.method} ${config.url}`,
      "color: #ef4444; font-weight: bold;",
      error.message
    )
    return false
  },
}
