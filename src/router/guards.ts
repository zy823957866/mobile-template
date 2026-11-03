import type { NavigationGuard, NavigationHookAfter } from "@wot-ui/router"
import type { UserRole } from "@/store/auth"
import { useAuthStore } from "@/store/auth"
import { getComposer } from "@/locales"
import { trackPageView } from "@/core/error/report"

/**
 * 登录守卫
 * 未登录访问受保护页面时，重定向到登录页并携带 redirect。
 */
export const authGuard: NavigationGuard = (to) => {
  if (to.meta.public) {
    return true
  }

  const auth = useAuthStore()
  if (auth.isAuthenticated) {
    return true
  }

  return {
    path: "/pages/login/login",
    query: { redirect: to.fullPath },
  }
}

/**
 * 角色守卫
 * 按 meta.roles 判断当前角色是否有权访问目标页面。
 */
export const roleGuard: NavigationGuard = (to) => {
  const roles = to.meta.roles as UserRole[] | undefined
  if (!roles || roles.length === 0) {
    return true
  }

  const auth = useAuthStore()
  if (auth.role && roles.includes(auth.role)) {
    return true
  }

  const { t } = getComposer()
  uni.showToast({ title: t("common.noPermission"), icon: "none" })
  return false
}

/**
 * 页面进入后设置导航栏标题。
 */
export const titleHook: NavigationHookAfter = (to) => {
  const titleKey = to.meta.titleKey
  if (typeof titleKey !== "string") {
    return
  }

  const { t } = getComposer()
  uni.setNavigationBarTitle({ title: t(titleKey) })
}

/**
 * 页面进入后上报 PV。
 */
export const analyticsHook: NavigationHookAfter = (to) => {
  trackPageView(to.fullPath)
}
