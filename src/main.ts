import { createSSRApp } from "vue"
import type { App as VueApp } from "vue"
import * as Pinia from "pinia"
import "uno.css"
import App from "./App.vue"
import { setupI18n } from "./locales"
import { setupRequestInterceptors } from "./api/interceptors"
import { setupErrorHandler } from "./core/error"
import router from "./router"

export function createApp() {
  const app = createSSRApp(App) as VueApp
  const pinia = Pinia.createPinia()
  const i18n = setupI18n()

  app.use(pinia)
  app.use(i18n)
  app.use(router)

  // 注册请求拦截器
  setupRequestInterceptors()

  // 注册全局错误处理
  setupErrorHandler(app)

  return {
    app,
    Pinia,
    i18n,
  }
}
