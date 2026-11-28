import api from "./api";
import type { AuthResponse, LoginPayload, User } from "../types/user.types";

// POST /api/auth/login → { token, user }
export const login = async (payload: LoginPayload): Promise<AuthResponse> => {
  const { data } = await api.post<AuthResponse>("/auth/login", payload);
  return data;
};

// GET /api/auth/me → { user }
// Dùng để khôi phục phiên đăng nhập khi người dùng tải lại trang.
export const getCurrentUser = async (): Promise<User> => {
  const { data } = await api.get<{ user: User }>("/auth/me");
  return data.user;
};
