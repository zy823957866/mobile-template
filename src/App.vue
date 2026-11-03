<script setup lang="ts">
import { onLaunch } from "@dcloudio/uni-app"
import { useAuthStore } from "./store/auth"
import { useAppStore } from "./store/app"
import { updateService } from "./services/update.service"
import { versionService } from "./services/version.service"
import { analytics } from "./services/analytics.service"
import router from "./router"

onLaunch(() => {
  const auth = useAuthStore()
  const app = useAppStore()

  // 1. 初始化应用全局状态（设备信息、网络状态等）
  app.init()

  // 2. 从本地 storage 恢复登录态
  auth.restore()

  // 3. 已登录则跳转到首页 tab（登录页是启动页，未登录直接停留即可，无 tabBar）
  if (auth.isAuthenticated) {
    router.pushTab({ name: "home" })
  }

  // 4. 初始化埋点服务
  analytics.init({
    enabled: !import.meta.env.DEV,
  })

  // 5. 初始化版本管理服务
  versionService.init()

  // 6. 检查小程序更新
  updateService.checkUpdate({ silent: true })
})
</script>

<style lang="scss">
@import url("./styles/tokens/color.css");
@import url("./styles/tokens/typography.css");
@import url("./styles/tokens/spacing.css");
@import url("./styles/tokens/motion.css");

page {
  /* wot-ui v2 主题定制（品牌色 #F5A800），主色第 6 档为默认主色 */
  --wot-primary-1: #fff7e0;
  --wot-primary-2: #ffecb3;
  --wot-primary-3: #ffdf80;
  --wot-primary-4: #ffd14d;
  --wot-primary-5: #ffc41a;
  --wot-primary-6: #f5a800;
  --wot-primary-7: #d98f00;
  --wot-primary-8: #b07300;
  --wot-primary-9: #875800;
  --wot-primary-10: #5e3d00;
  --wot-text-main: #1a1a1a;
  --wot-text-secondary: #6b6b6b;

  background-color: #f5f6f7;
}
</style>
