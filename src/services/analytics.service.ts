/**
 * 埋点/分析服务
 *
 * 统一封装埋点上报，支持批量上报、失败缓存、开发环境调试
 *
 * 用法：
 * import { analytics } from '@/services/analytics.service'
 *
 * // 页面浏览
 * analytics.pageView('/pages/index/index')
 *
 * // 自定义事件
 * analytics.track('button_click', { button: 'submit' })
 */

import { useAppStore } from "@/store/app"
import { useUserStore } from "@/store/user"

export interface TrackEvent {
  /** 事件名 */
  event: string
  /** 事件参数 */
  params?: Record<string, unknown>
  /** 发生时间 */
  timestamp: number
  /** 页面路径 */
  pagePath?: string
}

export interface AnalyticsOptions {
  /** 上报接口地址 */
  reportUrl?: string
  /** 批量上报阈值（条），默认 10 */
  batchSize?: number
  /** 上报间隔（ms），默认 5000 */
  flushInterval?: number
  /** 最大缓存数，默认 100 */
  maxCacheSize?: number
  /** 是否启用（生产环境） */
  enabled?: boolean
}

class AnalyticsService {
  private options: Required<
    Pick<AnalyticsOptions, "batchSize" | "flushInterval" | "maxCacheSize" | "enabled">
  > = {
    batchSize: 10,
    flushInterval: 5000,
    maxCacheSize: 100,
    enabled: false,
  }

  private queue: TrackEvent[] = []
  private timer: ReturnType<typeof setTimeout> | null = null

  /**
   * 初始化
   */
  init(options: AnalyticsOptions = {}): void {
    this.options = { ...this.options, ...options }

    if (!this.options.enabled) return

    // 启动定时上报
    this.startInterval()
  }

  /**
   * 追踪自定义事件
   */
  track(event: string, params?: Record<string, unknown>): void {
    if (!this.options.enabled && !import.meta.env.DEV) return

    const eventData: TrackEvent = {
      event,
      params,
      timestamp: Date.now(),
      pagePath: this.getCurrentPagePath(),
    }

    // 开发环境直接打印
    if (import.meta.env.DEV) {
      console.log(`%c[Track] ${event}`, "color: #8b5cf6; font-weight: bold;", params || "")
      return
    }

    // 加入队列
    this.queue.push(eventData)

    // 达到批量阈值立即上报
    if (this.queue.length >= this.options.batchSize) {
      this.flush()
    }
  }

  /**
   * 页面浏览埋点
   */
  pageView(pagePath: string, params?: Record<string, unknown>): void {
    this.track("page_view", { path: pagePath, ...params })
  }

  /**
   * 用户属性设置
   */
  setUserProperties(properties: Record<string, unknown>): void {
    this.track("user_properties", properties)
  }

  /**
   * 手动触发上报
   */
  async flush(): Promise<void> {
    if (this.queue.length === 0) return

    const events = this.queue.splice(0, this.options.batchSize)

    try {
      await this.report(events)
    } catch {
      // 上报失败，放回队列头部（最多缓存 maxCacheSize 条）
      this.queue.unshift(...events)
      if (this.queue.length > this.options.maxCacheSize) {
        this.queue = this.queue.slice(-this.options.maxCacheSize)
      }
    }
  }

  /**
   * 立即上报所有缓存
   */
  async flushAll(): Promise<void> {
    while (this.queue.length > 0) {
      await this.flush()
    }
  }

  /**
   * 清空队列
   */
  clear(): void {
    this.queue = []
  }

  // ============================================================
  // 内部方法
  // ============================================================

  private startInterval(): void {
    if (this.timer) clearInterval(this.timer)
    this.timer = setInterval(() => {
      if (this.queue.length > 0) {
        this.flush()
      }
    }, this.options.flushInterval)
  }

  private async report(_events: TrackEvent[]): Promise<void> {
    if (!this.options.enabled) return

    // TODO: 替换为实际的上报接口
    // await uni.request({
    //   url: this.options.reportUrl || '/api/analytics',
    //   method: 'POST',
    //   data: { events },
    // })
  }

  private getCurrentPagePath(): string {
    try {
      const pages = getCurrentPages()
      if (pages.length > 0) {
        const currentPage = pages[pages.length - 1]
        return (currentPage as { route?: string }).route || ""
      }
    } catch {
      // ignore
    }
    return ""
  }

  /**
   * 获取公共参数（每次上报都带上）
   */
  private getCommonParams(): Record<string, unknown> {
    const appStore = useAppStore()
    const userStore = useUserStore()

    return {
      app_version: appStore.appVersion,
      platform: uni.getSystemInfoSync().platform,
      os_version: uni.getSystemInfoSync().system,
      user_id: userStore.userId,
      // 网络类型等
    }
  }
}

/** 单例实例 */
export const analytics = new AnalyticsService()
