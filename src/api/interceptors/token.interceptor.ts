/**
 * Token 拦截器
 * - 请求前自动注入 Authorization header
 */
import type { RequestInterceptor } from "../types/request"
import { getToken } from "@/utils/storage"

export const tokenInterceptor: RequestInterceptor = {
  request(config) {
    if (config.needToken === false) return config

    const token = getToken()
    if (token) {
      config.header = {
        ...config.header,
        Authorization: `Bearer ${token}`,
      }
    }
    return config
  },
}
