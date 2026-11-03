/**
 * 用户信息状态
 * - 用户资料、权限列表、用户设置
 */
import { defineStore } from "pinia"
import { ref, computed } from "vue"
import { fetchProfile } from "@/api/auth"

export interface UserProfile {
  id: string
  name: string
  avatar?: string
  phone?: string
  email?: string
  department?: string
  position?: string
  company?: string
  [key: string]: unknown
}

export interface UserSettings {
  pushNotification: boolean
  soundEnabled: boolean
  language: string
}

export const useUserStore = defineStore("user", () => {
  // ===== State =====

  /** 用户资料 */
  const profile = ref<UserProfile | null>(null)

  /** 权限码列表 */
  const permissions = ref<string[]>([])

  /** 用户设置 */
  const settings = ref<UserSettings>({
    pushNotification: true,
    soundEnabled: true,
    language: "zh-CN",
  })

  /** 资料是否已加载 */
  const loaded = ref(false)

  // ===== Getters =====

  const userId = computed(() => profile.value?.id || "")
  const userName = computed(() => profile.value?.name || "")
  const userAvatar = computed(() => profile.value?.avatar || "")

  /**
   * 判断是否拥有某个权限
   */
  function hasPermission(code: string): boolean {
    if (!code) return true
    // 空权限列表表示拥有所有权限（开发阶段）
    if (permissions.value.length === 0) return true
    return permissions.value.includes(code)
  }

  /**
   * 判断是否拥有任一权限
   */
  function hasAnyPermission(codes: string[]): boolean {
    if (!codes || codes.length === 0) return true
    return codes.some((code) => hasPermission(code))
  }

  /**
   * 判断是否拥有所有权限
   */
  function hasAllPermissions(codes: string[]): boolean {
    if (!codes || codes.length === 0) return true
    return codes.every((code) => hasPermission(code))
  }

  // ===== Actions =====

  /**
   * 获取用户资料
   */
  async function loadProfile(force = false): Promise<UserProfile | null> {
    if (loaded.value && !force && profile.value) {
      return profile.value
    }

    try {
      const data = await fetchProfile()
      profile.value = data as unknown as UserProfile
      loaded.value = true
      return profile.value
    } catch {
      loaded.value = false
      return null
    }
  }

  /**
   * 设置权限列表
   */
  function setPermissions(list: string[]) {
    permissions.value = list
  }

  /**
   * 更新用户资料
   */
  function updateProfile(data: Partial<UserProfile>) {
    if (profile.value) {
      profile.value = { ...profile.value, ...data }
    } else {
      profile.value = data as UserProfile
    }
  }

  /**
   * 更新用户设置
   */
  function updateSettings(data: Partial<UserSettings>) {
    settings.value = { ...settings.value, ...data }
  }

  /**
   * 重置用户状态（登出时调用）
   */
  function reset() {
    profile.value = null
    permissions.value = []
    loaded.value = false
  }

  return {
    // state
    profile,
    permissions,
    settings,
    loaded,
    // getters
    userId,
    userName,
    userAvatar,
    // actions
    hasPermission,
    hasAnyPermission,
    hasAllPermissions,
    loadProfile,
    setPermissions,
    updateProfile,
    updateSettings,
    reset,
  }
})
