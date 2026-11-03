import { request } from "./request"
import type { UserRole } from "@/store/auth"

export interface LoginPayload {
  account: string
  password: string
  role: UserRole
}

export interface LoginResult {
  token: string
  role: UserRole
  profile?: Record<string, unknown>
}

export function login(data: LoginPayload): Promise<LoginResult> {
  return request<LoginResult>({ url: "/auth/login", method: "POST", data: { ...data } })
}

export function fetchProfile(): Promise<Record<string, unknown>> {
  return request<Record<string, unknown>>({ url: "/auth/profile", method: "GET" })
}
