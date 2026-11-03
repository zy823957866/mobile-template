import { createRouter } from "@wot-ui/router"
import { routes } from "./routes"
import { analyticsHook, authGuard, roleGuard, titleHook } from "./guards"

const router = createRouter({ routes })

// 前置守卫：先鉴权，再校验角色
router.beforeEach(authGuard)
router.beforeEach(roleGuard)

// 后置钩子：先设置标题，再上报 PV
router.afterEach(titleHook)
router.afterEach(analyticsHook)

export default router
