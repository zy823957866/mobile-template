/**
 * 本地存储工具（增强版）
 * - 命名空间隔离（conti: 前缀）
 * - 过期时间（TTL）支持
 * - 类型安全（泛型 + 默认值）
 * - 批量操作
 * - 双端兼容（uni.setStorageSync）
 */

const NAMESPACE = "conti:"

/** 存储条目（带过期时间） */
interface StorageItem<T> {
  value: T
  expireAt?: number // 时间戳（ms），undefined 表示永不过期
}

/** 获取带命名空间的 key */
function getKey(key: string): string {
  return `${NAMESPACE}${key}`
}

// ============================================================
// 基础操作
// ============================================================

/**
 * 获取存储值
 * @param key - 存储键（自动加命名空间前缀）
 * @param defaultValue - 默认值（key 不存在或已过期时返回）
 */
export function getStorage<T = unknown>(key: string, defaultValue?: T): T | undefined {
  try {
    const raw = uni.getStorageSync(getKey(key)) as string
    if (!raw) return defaultValue

    const item = JSON.parse(raw) as StorageItem<T>

    // 检查是否过期
    if (item.expireAt && Date.now() > item.expireAt) {
      removeStorage(key)
      return defaultValue
    }

    return item.value
  } catch {
    return defaultValue
  }
}

/**
 * 设置存储值
 * @param key - 存储键
 * @param value - 存储值
 * @param ttl - 过期时间（毫秒），不传则永不过期
 */
export function setStorage<T>(key: string, value: T, ttl?: number): void {
  const item: StorageItem<T> = {
    value,
    expireAt: ttl ? Date.now() + ttl : undefined,
  }
  uni.setStorageSync(getKey(key), JSON.stringify(item))
}

/**
 * 删除存储值
 */
export function removeStorage(key: string): void {
  uni.removeStorageSync(getKey(key))
}

/**
 * 检查 key 是否存在且未过期
 */
export function hasStorage(key: string): boolean {
  return getStorage(key) !== undefined
}

// ============================================================
// 批量操作
// ============================================================

/**
 * 批量获取
 */
export function getStorageMultiple<T = unknown>(keys: string[]): Record<string, T | undefined> {
  const result: Record<string, T | undefined> = {}
  for (const key of keys) {
    result[key] = getStorage<T>(key)
  }
  return result
}

/**
 * 批量设置
 */
export function setStorageMultiple(items: Record<string, unknown>): void {
  for (const [key, value] of Object.entries(items)) {
    setStorage(key, value)
  }
}

/**
 * 批量删除
 */
export function removeStorageMultiple(keys: string[]): void {
  for (const key of keys) {
    removeStorage(key)
  }
}

// ============================================================
// 命名空间操作
// ============================================================

/**
 * 清除所有本命名空间下的存储
 */
export function clearStorage(): void {
  try {
    const keys: string[] = []
    // #ifdef H5
    const len = localStorage.length
    for (let i = 0; i < len; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(NAMESPACE)) {
        keys.push(key.slice(NAMESPACE.length))
      }
    }
    // #endif
    // #ifndef H5
    // 小程序端：用 getStorageInfoSync 获取所有 key
    const info = uni.getStorageInfoSync()
    for (const key of info.keys) {
      if (key.startsWith(NAMESPACE)) {
        keys.push(key.slice(NAMESPACE.length))
      }
    }
    // #endif

    for (const key of keys) {
      removeStorage(key)
    }
  } catch {
    // 忽略清理错误
  }
}

/**
 * 获取存储信息（本命名空间下）
 */
export function getStorageInfo(): { keys: string[]; currentSize: number } {
  const keys: string[] = []
  let currentSize = 0

  try {
    // #ifdef H5
    const len = localStorage.length
    for (let i = 0; i < len; i++) {
      const key = localStorage.key(i)
      if (key && key.startsWith(NAMESPACE)) {
        keys.push(key.slice(NAMESPACE.length))
        currentSize += (localStorage.getItem(key) || "").length
      }
    }
    // #endif
    // #ifndef H5
    const info = uni.getStorageInfoSync()
    for (const key of info.keys) {
      if (key.startsWith(NAMESPACE)) {
        keys.push(key.slice(NAMESPACE.length))
      }
    }
    currentSize = info.currentSize
    // #endif
  } catch {
    // ignore
  }

  return { keys, currentSize }
}

// ============================================================
// 业务专用封装（向后兼容）
// ============================================================

const TOKEN_KEY = "token"
const ROLE_KEY = "role"
const LOCALE_KEY = "locale"

export type StoredRole = "employee" | "visitor"

export function getToken(): string {
  return getStorage<string>(TOKEN_KEY) || ""
}

export function setToken(token: string): void {
  setStorage(TOKEN_KEY, token)
}

export function removeToken(): void {
  removeStorage(TOKEN_KEY)
}

export function getStoredRole(): StoredRole | "" {
  return (getStorage<StoredRole>(ROLE_KEY) as StoredRole) || ""
}

export function setStoredRole(role: StoredRole): void {
  setStorage(ROLE_KEY, role)
}

export function removeStoredRole(): void {
  removeStorage(ROLE_KEY)
}

export function getStoredLocale(): string {
  return getStorage<string>(LOCALE_KEY) || ""
}

export function setStoredLocale(locale: string): void {
  setStorage(LOCALE_KEY, locale)
}

export function removeStoredLocale(): void {
  removeStorage(LOCALE_KEY)
}
