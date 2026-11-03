/**
 * 版本管理服务
 *
 * 提供完整的版本管理能力：
 * - 语义化版本比较
 * - 强制更新判断
 * - 版本兼容检测
 * - 变更日志
 * - 灰度发布（按用户百分比）
 *
 * 用法：
 * import { versionService } from '@/services/version.service'
 *
 * // 检查是否需要更新
 * const result = await versionService.checkVersion()
 *
 * // 版本比较
 * versionService.compare('1.2.0', '1.1.0') // 1
 */

import { toastError } from "./toast.service"
import { deviceService } from "./device.service"

export interface VersionInfo {
  /** 最新版本号 */
  latestVersion: string
  /** 最低兼容版本（低于此版本强制更新） */
  minVersion: string
  /** 当前版本是否需要更新 */
  needUpdate: boolean
  /** 是否强制更新 */
  forceUpdate: boolean
  /** 更新内容 */
  changelog?: string
  /** 更新包大小（字节） */
  packageSize?: number
  /** 下载地址（H5 端） */
  downloadUrl?: string
}

export type VersionCompareResult = -1 | 0 | 1

class VersionService {
  /** 当前应用版本 */
  private currentVersion = "0.1.0"

  /** 后端版本接口地址 */
  private checkUrl = "/api/version/check"

  /** 缓存的版本信息 */
  private cachedVersionInfo: VersionInfo | null = null

  /**
   * 初始化（从本地读取版本号）
   */
  init(options?: { currentVersion?: string; checkUrl?: string }): void {
    if (options?.currentVersion) {
      this.currentVersion = options.currentVersion
    } else {
      // 尝试从 deviceService 获取
      const v = deviceService.getAppVersion()
      if (v && v !== "0.0.0") {
        this.currentVersion = v
      }
    }

    if (options?.checkUrl) {
      this.checkUrl = options.checkUrl
    }
  }

  /**
   * 获取当前版本号
   */
  getCurrentVersion(): string {
    return this.currentVersion
  }

  /**
   * 语义化版本比较
   * @returns 1: v1 > v2, 0: v1 === v2, -1: v1 < v2
   */
  compare(v1: string, v2: string): VersionCompareResult {
    const arr1 = this.parseVersion(v1)
    const arr2 = this.parseVersion(v2)

    for (let i = 0; i < Math.max(arr1.length, arr2.length); i++) {
      const n1 = arr1[i] || 0
      const n2 = arr2[i] || 0
      if (n1 > n2) return 1
      if (n1 < n2) return -1
    }
    return 0
  }

  /**
   * 判断 v1 是否大于 v2
   */
  greaterThan(v1: string, v2: string): boolean {
    return this.compare(v1, v2) === 1
  }

  /**
   * 判断 v1 是否大于等于 v2
   */
  greaterThanOrEqual(v1: string, v2: string): boolean {
    return this.compare(v1, v2) >= 0
  }

  /**
   * 判断 v1 是否小于 v2
   */
  lessThan(v1: string, v2: string): boolean {
    return this.compare(v1, v2) === -1
  }

  /**
   * 判断 v1 是否小于等于 v2
   */
  lessThanOrEqual(v1: string, v2: string): boolean {
    return this.compare(v1, v2) <= 0
  }

  /**
   * 检查版本更新（从后端接口获取）
   *
   * 返回 null 表示当前已是最新版本或检查失败
   */
  async checkVersion(): Promise<VersionInfo | null> {
    try {
      // TODO: 替换为实际的接口调用
      // const data = await request<VersionInfo>({ url: this.checkUrl, method: 'GET' })

      // 模拟数据（实际开发中从后端获取）
      const mockData: VersionInfo = {
        latestVersion: "0.2.0",
        minVersion: "0.1.0",
        needUpdate: this.lessThan(this.currentVersion, "0.2.0"),
        forceUpdate: this.lessThan(this.currentVersion, "0.1.0"),
        changelog: "1. 优化用户体验\n2. 修复已知问题",
      }

      this.cachedVersionInfo = mockData
      return mockData
    } catch {
      toastError("版本检查失败")
      return null
    }
  }

  /**
   * 检查并提示更新（带弹窗）
   */
  async checkAndPromptUpdate(): Promise<void> {
    const info = await this.checkVersion()
    if (!info || !info.needUpdate) return

    if (info.forceUpdate) {
      // 强制更新：不能关闭，必须更新
      uni.showModal({
        title: "发现新版本",
        content: info.changelog || "检测到新版本，为了不影响您的使用，请立即更新",
        showCancel: false,
        confirmText: "立即更新",
        success: () => {
          this.doUpdate()
        },
      })
    } else {
      // 普通更新：可以跳过
      uni.showModal({
        title: "发现新版本",
        content: info.changelog || "检测到新版本，是否更新？",
        confirmText: "立即更新",
        cancelText: "稍后再说",
        success: (res) => {
          if (res.confirm) {
            this.doUpdate()
          }
        },
      })
    }
  }

  /**
   * 执行更新
   */
  doUpdate(): void {
    // #ifdef MP-WEIXIN
    // 小程序端：直接使用小程序更新能力
    const updateManager = uni.getUpdateManager()
    updateManager.onUpdateReady(() => {
      updateManager.applyUpdate()
    })
    // #endif

    // #ifdef H5
    // H5 端：刷新页面或跳转到下载页
    uni.showLoading({ title: "正在更新..." })
    setTimeout(() => {
      uni.hideLoading()
      window.location.reload()
    }, 1000)
    // #endif
  }

  /**
   * 判断是否在灰度发布范围内（按用户 ID 百分比）
   *
   * @param userId - 用户 ID
   * @param percentage - 灰度百分比 0-100
   */
  isInGrayRelease(userId: string, percentage: number): boolean {
    if (percentage <= 0) return false
    if (percentage >= 100) return true

    // 简单的 hash 取模算法
    let hash = 0
    for (let i = 0; i < userId.length; i++) {
      hash = (hash * 31 + userId.charCodeAt(i)) >>> 0
    }
    return hash % 100 < percentage
  }

  /**
   * 获取缓存的版本信息
   */
  getCachedVersionInfo(): VersionInfo | null {
    return this.cachedVersionInfo
  }

  /**
   * 解析版本号为数字数组
   */
  private parseVersion(version: string): number[] {
    return version
      .split(".")
      .map((v) => parseInt(v, 10))
      .filter((v) => !isNaN(v))
  }

  /**
   * 格式化版本号（补齐为 x.y.z 格式）
   */
  formatVersion(version: string): string {
    const parts = this.parseVersion(version)
    while (parts.length < 3) {
      parts.push(0)
    }
    return parts.join(".")
  }

  /**
   * 版本号升级（major/minor/patch）
   */
  bumpVersion(version: string, type: "major" | "minor" | "patch"): string {
    const parts = this.parseVersion(version)
    while (parts.length < 3) parts.push(0)

    if (type === "major") {
      parts[0]++
      parts[1] = 0
      parts[2] = 0
    } else if (type === "minor") {
      parts[1]++
      parts[2] = 0
    } else {
      parts[2]++
    }

    return parts.join(".")
  }
}

/** 单例实例 */
export const versionService = new VersionService()
