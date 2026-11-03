/**
 * 设备服务
 *
 * 设备信息、系统信息、网络状态、剪贴板等设备能力封装
 *
 * 用法：
 * import { deviceService } from '@/services/device.service'
 *
 * const info = deviceService.getSystemInfo()
 */

import { toastSuccess, toastError } from "./toast.service"

class DeviceService {
  private systemInfo: UniApp.GetSystemInfoResult | null = null

  /**
   * 获取系统信息（带缓存）
   */
  getSystemInfo(): UniApp.GetSystemInfoResult {
    if (this.systemInfo) return this.systemInfo

    try {
      this.systemInfo = uni.getSystemInfoSync()
    } catch {
      this.systemInfo = {
        platform: "unknown",
        system: "unknown",
        windowWidth: 375,
        windowHeight: 667,
        screenWidth: 375,
        screenHeight: 667,
        statusBarHeight: 20,
        safeArea: { top: 20, bottom: 0, left: 0, right: 0 },
      } as UniApp.GetSystemInfoResult
    }

    return this.systemInfo
  }

  /**
   * 获取状态栏高度
   */
  getStatusBarHeight(): number {
    return this.getSystemInfo().statusBarHeight || 20
  }

  /**
   * 获取底部安全区高度
   */
  getSafeAreaBottom(): number {
    const info = this.getSystemInfo()
    return info.safeAreaInsets?.bottom || 0
  }

  /**
   * 获取平台
   */
  getPlatform(): "ios" | "android" | "devtools" | "unknown" {
    const platform = this.getSystemInfo().platform?.toLowerCase()
    if (platform === "ios") return "ios"
    if (platform === "android") return "android"
    if (platform === "devtools") return "devtools"
    return "unknown"
  }

  /**
   * 是否 iOS
   */
  isIOS(): boolean {
    return this.getPlatform() === "ios"
  }

  /**
   * 是否 Android
   */
  isAndroid(): boolean {
    return this.getPlatform() === "android"
  }

  /**
   * 是否小程序开发工具
   */
  isDevTools(): boolean {
    return this.getPlatform() === "devtools"
  }

  /**
   * 复制到剪贴板
   */
  async copyToClipboard(text: string, showToast: boolean = true): Promise<boolean> {
    try {
      // #ifdef H5
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(text)
      } else {
        const textarea = document.createElement("textarea")
        textarea.value = text
        textarea.style.position = "fixed"
        textarea.style.opacity = "0"
        document.body.appendChild(textarea)
        textarea.select()
        document.execCommand("copy")
        document.body.removeChild(textarea)
      }
      // #endif

      // #ifndef H5
      await uni.setClipboardData({ data: text })
      // #endif

      if (showToast) toastSuccess("复制成功")
      return true
    } catch {
      if (showToast) toastError("复制失败")
      return false
    }
  }

  /**
   * 获取剪贴板内容
   */
  async getClipboardData(): Promise<string> {
    try {
      // #ifdef H5
      if (navigator.clipboard) {
        return await navigator.clipboard.readText()
      }
      return ""
      // #endif

      // #ifndef H5
      const res = await uni.getClipboardData()
      return res.data
      // #endif
    } catch {
      return ""
    }
  }

  /**
   * 拨打电话
   */
  makePhoneCall(phoneNumber: string): void {
    uni.makePhoneCall({
      phoneNumber,
      fail: () => {
        toastError("拨号失败")
      },
    })
  }

  /**
   * 震动反馈
   */
  vibrate(type: "short" | "long" = "short"): void {
    if (type === "short") {
      uni.vibrateShort({ type: "medium" })
    } else {
      uni.vibrateLong()
    }
  }

  /**
   * 打开系统设置
   */
  openSettings(): Promise<void> {
    return new Promise((resolve, reject) => {
      uni.openSetting({
        success: () => resolve(),
        fail: reject,
      })
    })
  }

  /**
   * 获取 App 版本号（小程序版本）
   */
  getAppVersion(): string {
    try {
      // #ifdef MP-WEIXIN
      const accountInfo = uni.getAccountInfoSync()
      return accountInfo.miniProgram.version || "0.0.0"
      // #endif
    } catch {
      // ignore
    }
    return "0.0.0"
  }

  /**
   * 获取胶囊按钮位置（小程序）
   */
  getMenuButtonBoundingClientRect(): UniApp.GetMenuButtonBoundingClientRectRes | null {
    try {
      // #ifdef MP-WEIXIN
      return uni.getMenuButtonBoundingClientRect()
      // #endif
    } catch {
      return null
    }
    return null
  }
}

/** 单例实例 */
export const deviceService = new DeviceService()
