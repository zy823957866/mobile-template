/**
 * Toast 消息提示服务
 * 统一封装 uni.showToast，提供更语义化的 API
 */

export interface ToastOptions {
  duration?: number
  position?: "top" | "center" | "bottom"
  icon?: "success" | "error" | "loading" | "none"
}

/** 成功提示 */
export function toastSuccess(title: string, options?: ToastOptions): void {
  uni.showToast({
    title,
    icon: "success",
    duration: options?.duration ?? 1500,
    position: options?.position,
    ...options,
  })
}

/** 错误提示 */
export function toastError(title: string, options?: ToastOptions): void {
  uni.showToast({
    title,
    icon: "none",
    duration: options?.duration ?? 2000,
    position: options?.position || "center",
    ...options,
  })
}

/** 警告提示 */
export function toastWarning(title: string, options?: ToastOptions): void {
  uni.showToast({
    title,
    icon: "none",
    duration: options?.duration ?? 2000,
    ...options,
  })
}

/** 信息提示 */
export function toastInfo(title: string, options?: ToastOptions): void {
  uni.showToast({
    title,
    icon: "none",
    duration: options?.duration ?? 1500,
    ...options,
  })
}

/** 加载中提示（需手动调用 hideLoading 关闭） */
export function toastLoading(title: string = "加载中..."): void {
  uni.showLoading({
    title,
    mask: true,
  })
}

/** 隐藏加载提示 */
export function hideLoading(): void {
  uni.hideLoading()
}

// 导出默认对象，方便统一使用
export const Toast = {
  success: toastSuccess,
  error: toastError,
  warning: toastWarning,
  info: toastInfo,
  loading: toastLoading,
  hide: hideLoading,
}
