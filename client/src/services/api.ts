import axios from "axios";

// Khóa lưu JWT trong localStorage. Dùng chung cho AuthContext và interceptor bên dưới.
export const TOKEN_KEY = "token";

// Axios instance DÙNG CHUNG cho cả nhóm.
// courtService, bookingService, historyService nên `import api from './api'`
// để tự động được gắn token vào mọi request.
const api = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? "http://localhost:5000/api",
});

// Trước mỗi request: nếu đã đăng nhập thì gắn "Authorization: Bearer <token>".
api.interceptors.request.use((config) => {
  const token = localStorage.getItem(TOKEN_KEY);
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Sau mỗi response: nếu server báo 401 khi ta đang có token
// (token hết hạn hoặc không hợp lệ) thì xóa token và đưa về trang đăng nhập.
// Lỗi 401 do sai mật khẩu sẽ KHÔNG vào nhánh này vì lúc đó chưa có token.
api.interceptors.response.use(
  (response) => response,
  (error) => {
    const isUnauthorized = error.response?.status === 401;
    if (isUnauthorized && localStorage.getItem(TOKEN_KEY)) {
      localStorage.removeItem(TOKEN_KEY);
      if (window.location.pathname !== "/login") {
        window.location.href = "/login";
      }
    }
    return Promise.reject(error);
  },
);

export default api;
