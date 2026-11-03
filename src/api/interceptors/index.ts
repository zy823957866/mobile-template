/**
 * 拦截器统一注册入口
 */
import { addInterceptor } from "../request"
import { tokenInterceptor } from "./token.interceptor"
import { apiVersionInterceptor } from "./apiversion.interceptor"
import { loadingInterceptor } from "./loading.interceptor"
import { errorInterceptor } from "./error.interceptor"
import { logInterceptor } from "./log.interceptor"

/**
 * 注册所有内置拦截器
 * 执行顺序：token → apiVersion → loading → log → error
 * 请求时从上到下，响应/错误时从下到上（洋葱模型）
 */
export function setupRequestInterceptors(): void {
  // 注意：拦截器注册顺序决定了执行顺序
  // request 阶段按注册顺序执行，response/error 按逆序执行
  addInterceptor(tokenInterceptor)
  addInterceptor(apiVersionInterceptor)
  addInterceptor(loadingInterceptor)
  addInterceptor(logInterceptor)
  addInterceptor(errorInterceptor) // error 放最后，最先捕获错误
}
