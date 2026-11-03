/**
 * 小程序更新检测服务
 *
 * 检测小程序是否有新版本，提示用户更新
 *
 * 用法：
 * import { updateService } from '@/services/update.service'
 *
 * // 在 App.vue onLaunch 中调用
 * updateService.checkUpdate()
 */

import { toastInfo } from "./toast.service"

class UpdateService {
  private updateManager: UniApp.UpdateManager | null = null
  private checking = false

  /**
   * 检查更新（在 App 启动时调用）
   */
  checkUpdate(options?: {
    /** 是否显示更新中提示，默认 true */
    showUpdating?: boolean
    /** 是否静默检测（无新版本不提示），默认 true */
    silent?: boolean
  }): void {
    // #ifndef MP-WEIXIN
    // 非小程序端不支持
    return
    // #endif

    // #ifdef MP-WEIXIN
    if (this.checking) return
    this.checking = true

    const { showUpdating = true, silent = true } = options || {}

    if (!this.updateManager) {
      this.updateManager = uni.getUpdateManager()
    }

    const manager = this.updateManager!

    // 检查到新版本
    manager.onCheckForUpdate((res) => {
      this.checking = false
      if (res.hasUpdate && !silent) {
        toastInfo("发现新版本，正在下载...")
      }
    })

    // 新版本下载完成
    manager.onUpdateReady(() => {
      this.checking = false

      if (showUpdating) {
        uni.showModal({
          title: "更新提示",
          content: "新版本已准备好，是否立即重启？",
          confirmText: "立即更新",
          cancelText: "稍后更新",
          success: (res) => {
            if (res.confirm) {
              // 应用新版本并重启
              manager.applyUpdate()
            }
          },
        })
      } else {
        // 静默更新，直接应用
        manager.applyUpdate()
      }
    })

    // 新版本下载失败
    manager.onUpdateFailed(() => {
      this.checking = false
      if (!silent) {
        uni.showModal({
          title: "更新失败",
          content: "新版本下载失败，请检查网络后重试",
          showCancel: false,
        })
      }
    })
    // #endif
  }

  /**
   * 应用更新（下载完成后调用）
   */
  applyUpdate(): void {
    if (this.updateManager) {
      this.updateManager.applyUpdate()
    }
  }
}

/** 单例实例 */
export const updateService = new UpdateService()
