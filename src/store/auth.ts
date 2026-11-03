import { defineStore } from "pinia"
import {
  getToken,
  setToken,
  removeToken,
  getStoredRole,
  setStoredRole,
  removeStoredRole,
} from "@/utils/storage"
import { login as loginApi, fetchProfile } from "@/api/auth"
import { useUserStore } from "./user"

export type UserRole = "employee" | "visitor"

export const useAuthStore = defineStore("auth", {
  state: () => ({
    token: getToken(),
    role: (getStoredRole() || null) as UserRole | null,
    profile: null as Record<string, unknown> | null,
  }),
  getters: {
    isAuthenticated: (state) => Boolean(state.token),
    isEmployee: (state) => state.role === "employee",
    isVisitor: (state) => state.role === "visitor",
  },
  actions: {
    restore() {
      this.token = getToken()
      this.role = (getStoredRole() || null) as UserRole | null
    },
    async login(account: string, password: string, role: UserRole) {
      const res = await loginApi({ account, password, role })
      this.token = res.token
      this.role = res.role
      this.profile = res.profile ?? null
      setToken(res.token)
      setStoredRole(res.role)
    },
    async fetchProfile() {
      this.profile = await fetchProfile()
    },
    logout() {
      this.token = ""
      this.role = null
      this.profile = null
      removeToken()
      removeStoredRole()
      // 同步清理用户状态
      const userStore = useUserStore()
      userStore.reset()
    },
  },
})
