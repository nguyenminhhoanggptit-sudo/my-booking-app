// Vai trò của người dùng trong hệ thống.
// Dùng union type thay cho enum vì tsconfig đang bật "erasableSyntaxOnly".
export type UserRole = "admin" | "user";

// Thông tin người dùng do server trả về (KHÔNG bao gồm mật khẩu).
export interface User {
  id: number;
  username: string;
  fullName: string;
  role: UserRole;
}

// Dữ liệu gửi lên server khi đăng nhập.
export interface LoginPayload {
  username: string;
  password: string;
}

// Dữ liệu server trả về khi đăng nhập thành công.
export interface AuthResponse {
  token: string;
  user: User;
}
