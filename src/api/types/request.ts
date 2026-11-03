/**
 * 请求相关类型定义
 */

// ====== 请求方法 ======
export type HttpMethod = "GET" | "POST" | "PUT" | "DELETE" | "PATCH" | "HEAD" | "OPTIONS"

// ====== 基础响应结构 ======
export interface ApiResponse<T = unknown> {
  code: number
  message: string
  data: T
}

// ====== 分页响应 ======
export interface PageResponse<T> {
  list: T[]
  total: number
  page: number
  pageSize: number
}

// ====== 请求配置 ======
export interface RequestOptions {
  /** 请求地址（完整 URL 或路径） */
  url: string
  /** HTTP 方法 */
  method?: HttpMethod
  /** 请求参数（GET 拼 URL，其他放 body） */
  data?: Record<string, unknown>
  /** 请求头 */
  header?: Record<string, string>
  /** 超时时间（ms），默认 10000 */
  timeout?: number
  /** 是否显示全局 loading，默认 false */
  loading?: boolean
  /** loading 提示文字 */
  loadingText?: string
  /** 是否显示错误提示，默认 true */
  showError?: boolean
  /** 是否需要 token，默认 true */
  needToken?: boolean
  /** 重试次数，默认 0（不重试） */
  retry?: number
  /** 重试延迟（ms），默认 1000 */
  retryDelay?: number
  /** 自定义成功判断，默认 code === 0 */
  isSuccess?: (res: ApiResponse) => boolean
  /** 返回原始响应（包含 code/message），默认 false，只返回 data */
  rawResponse?: boolean
}

// ====== 拦截器 ======
export interface RequestInterceptor {
  /** 请求前拦截，返回修改后的 config，返回 false 取消请求 */
  request?: (config: RequestOptions) => RequestOptions | false | Promise<RequestOptions | false>
  /** 响应成功拦截（HTTP 2xx + 业务成功），返回修改后的数据 */
  response?: (data: unknown, config: RequestOptions) => unknown | Promise<unknown>
  /** 响应错误拦截（HTTP 错误或业务错误），返回 true 表示已处理，不再向上抛出 */
  error?: (error: RequestError, config: RequestOptions) => boolean | Promise<boolean>
  /** 请求完成（无论成功失败） */
  finally?: (config: RequestOptions) => void
}

// ====== 错误类型 ======
export interface RequestError extends Error {
  code?: number
  statusCode?: number
  data?: unknown
  config?: RequestOptions
}

// ====== 请求任务（用于取消） ======
export interface RequestTask {
  abort: () => void
}
