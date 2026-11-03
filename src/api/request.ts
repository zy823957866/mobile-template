/**
 * 网络请求封装（拦截器架构）
 *
 * 基于 uni.request 封装，提供可插拔的拦截器体系。
 * 内置拦截器：token 注入、loading、错误处理、重试、日志。
 *
 * 用法：
 *   import { request } from '@/api/request'
 *   const data = await request<UserInfo>({ url: '/user/info' })
 */

import type {
  RequestOptions,
  RequestInterceptor,
  ApiResponse,
  RequestError,
  RequestTask,
} from "./types/request"

const BASE_URL: string = import.meta.env.VITE_API_BASE_URL || "/api"

/** 拦截器列表 */
const interceptors: RequestInterceptor[] = []

/** 进行中的请求 map（用于取消重复请求） */
const pendingRequests = new Map<string, RequestTask>()

// ============================================================
// 拦截器注册
// ============================================================

/**
 * 添加拦截器
 */
export function addInterceptor(interceptor: RequestInterceptor): void {
  interceptors.push(interceptor)
}

/**
 * 移除拦截器
 */
export function removeInterceptor(interceptor: RequestInterceptor): void {
  const idx = interceptors.indexOf(interceptor)
  if (idx > -1) interceptors.splice(idx, 1)
}

/**
 * 清空所有拦截器
 */
export function clearInterceptors(): void {
  interceptors.length = 0
}

// ============================================================
// 内部方法
// ============================================================

/** 生成请求 key（用于去重和取消） */
function getRequestKey(config: RequestOptions): string {
  return `${config.method || "GET"}_${config.url}_${JSON.stringify(config.data || {})}`
}

/** 拼接完整 URL */
function buildUrl(url: string): string {
  if (/^https?:\/\//.test(url)) return url
  return `${BASE_URL}${url.startsWith("/") ? url : `/${url}`}`
}

/** 依次执行 request 拦截器 */
async function runRequestInterceptors(config: RequestOptions): Promise<RequestOptions | false> {
  let cfg = config
  for (const interceptor of interceptors) {
    if (!interceptor.request) continue
    const result = await interceptor.request(cfg)
    if (result === false) return false
    cfg = result
  }
  return cfg
}

/** 依次执行 response 拦截器（成功） */
async function runResponseInterceptors(data: unknown, config: RequestOptions): Promise<unknown> {
  let result = data
  for (const interceptor of interceptors) {
    if (!interceptor.response) continue
    result = await interceptor.response(result, config)
  }
  return result
}

/** 依次执行 error 拦截器，有一个返回 true 就停止 */
async function runErrorInterceptors(error: RequestError, config: RequestOptions): Promise<boolean> {
  for (const interceptor of interceptors) {
    if (!interceptor.error) continue
    const handled = await interceptor.error(error, config)
    if (handled) return true
  }
  return false
}

/** 执行 finally 拦截器 */
function runFinallyInterceptors(config: RequestOptions): void {
  for (const interceptor of interceptors) {
    if (interceptor.finally) interceptor.finally(config)
  }
}

// ============================================================
// 主函数
// ============================================================

/**
 * 发起网络请求
 * @template T - 返回的数据类型（默认只返回 data 部分）
 */
export function request<T = unknown>(options: RequestOptions): Promise<T> {
  // 默认配置
  const config: RequestOptions = {
    method: "GET",
    timeout: 10000,
    loading: false,
    showError: true,
    needToken: true,
    retry: 0,
    retryDelay: 1000,
    rawResponse: false,
    ...options,
  }

  // 用 async IIFE 避免 async promise executor
  return (async (): Promise<T> => {
    // 1. 执行 request 拦截器
    const interceptedConfig = await runRequestInterceptors(config)
    if (interceptedConfig === false) {
      throw new Error("Request cancelled by interceptor")
    }
    const finalConfig = interceptedConfig

    const fullUrl = buildUrl(finalConfig.url!)
    const reqKey = getRequestKey(finalConfig)

    // 2. 发起请求
    return new Promise<T>((resolve, reject) => {
      const task = uni.request({
        url: fullUrl,
        method: (finalConfig.method || "GET") as "GET" | "POST" | "PUT" | "DELETE",
        data: finalConfig.data,
        header: finalConfig.header,
        timeout: finalConfig.timeout,
        success: async (res) => {
          pendingRequests.delete(reqKey)
          runFinallyInterceptors(finalConfig)

          const body = res.data as ApiResponse<T>
          const isSuccess = finalConfig.isSuccess
            ? finalConfig.isSuccess(body)
            : res.statusCode >= 200 && res.statusCode < 300 && body && body.code === 0

          if (isSuccess) {
            // 业务成功
            try {
              const processedData = await runResponseInterceptors(
                finalConfig.rawResponse ? body : body.data,
                finalConfig
              )
              resolve(processedData as T)
            } catch (err) {
              reject(err as Error)
            }
          } else {
            // 业务错误
            const error: RequestError = new Error(body?.message || "Request failed")
            error.code = body?.code
            error.statusCode = res.statusCode
            error.data = body?.data
            error.config = finalConfig

            const handled = await runErrorInterceptors(error, finalConfig)
            reject(error)
            // handled 仅表示是否展示了提示，依然 reject 让调用方知道失败了
            void handled
          }
        },
        fail: async (err) => {
          pendingRequests.delete(reqKey)
          runFinallyInterceptors(finalConfig)

          // 网络错误
          const error: RequestError = new Error(err.errMsg || "Network error")
          error.statusCode = 0
          error.config = finalConfig

          // 重试逻辑
          if ((finalConfig.retry || 0) > 0) {
            const retryConfig = { ...finalConfig, retry: (finalConfig.retry || 0) - 1 }
            setTimeout(() => {
              request<T>(retryConfig).then(resolve).catch(reject)
            }, finalConfig.retryDelay)
            return
          }

          await runErrorInterceptors(error, finalConfig)
          reject(error)
        },
      })

      // 记录 pending 请求
      pendingRequests.set(reqKey, { abort: () => task.abort() })
    })
  })()
}

// ============================================================
// 便捷方法
// ============================================================

/** GET 请求 */
export function httpGet<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  options?: Partial<RequestOptions>
): Promise<T> {
  return request<T>({ ...options, url, method: "GET", data })
}

/** POST 请求 */
export function httpPost<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  options?: Partial<RequestOptions>
): Promise<T> {
  return request<T>({ ...options, url, method: "POST", data })
}

/** PUT 请求 */
export function httpPut<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  options?: Partial<RequestOptions>
): Promise<T> {
  return request<T>({ ...options, url, method: "PUT", data })
}

/** DELETE 请求 */
export function httpDelete<T = unknown>(
  url: string,
  data?: Record<string, unknown>,
  options?: Partial<RequestOptions>
): Promise<T> {
  return request<T>({ ...options, url, method: "DELETE", data })
}

/** 取消指定请求 */
export function cancelRequest(url: string, method: string = "GET"): void {
  const key = `${method}_${url}`
  for (const [k, task] of pendingRequests.entries()) {
    if (k.startsWith(key)) {
      task.abort()
      pendingRequests.delete(k)
    }
  }
}

/** 取消所有请求 */
export function cancelAllRequests(): void {
  for (const [, task] of pendingRequests.entries()) {
    task.abort()
  }
  pendingRequests.clear()
}
