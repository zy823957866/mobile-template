/**
 * API 版本拦截器
 *
 * 在请求 header 中注入 API 版本号和 App 版本号
 * 后端可根据版本号做兼容处理
 *
 * 用法：
 * import { apiVersionInterceptor } from '@/api/interceptors/apiversion.interceptor'
 * addInterceptor(apiVersionInterceptor)
 */

import type { RequestInterceptor } from "../types/request"
import { versionService } from "@/services/version.service"
import { deviceService } from "@/services/device.service"

/** API 版本号 */
export const API_VERSION = "v1"

export const apiVersionInterceptor: RequestInterceptor = {
  request(config) {
    const headers = config.header || {}

    // 注入 API 版本
    headers["X-API-Version"] = API_VERSION

    // 注入 App 版本
    headers["X-App-Version"] = versionService.getCurrentVersion()

    // 注入平台信息
    headers["X-Platform"] = deviceService.getPlatform()

    // 注入设备信息
    const sysInfo = deviceService.getSystemInfo()
    headers["X-OS"] = sysInfo.system || ""
    headers["X-Device"] = sysInfo.model || ""

    return {
      ...config,
      header: headers,
    }
  },
}
