import type { RouteRecordRaw } from "@wot-ui/router"

/**
 * 显式路由表
 * 需与 pages.json 中的页面声明保持一致。
 *
 * meta 约定：
 * - public: 无需登录即可访问
 * - roles: 允许访问的角色，缺省表示不限制
 * - tab: tabBar 页面，跳转需使用 pushTab
 * - titleKey: 导航栏标题的 i18n key
 */
export const routes: RouteRecordRaw[] = [
  {
    path: "/pages/login/login",
    name: "login",
    meta: {
      public: true,
      titleKey: "login.pageTitle",
    },
  },
  {
    path: "/pages/index/index",
    name: "home",
    meta: {
      tab: true,
      titleKey: "tabs.home",
    },
  },
]
