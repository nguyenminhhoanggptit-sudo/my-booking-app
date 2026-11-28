import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from "react";
import type { ReactNode } from "react";
import { TOKEN_KEY } from "../services/api";
import * as authService from "../services/authService";
import type { LoginPayload, User } from "../types/user.types";

interface AuthContextValue {
  user: User | null;
  isAuthenticated: boolean;
  // true trong lúc đang xác minh token cũ khi mới mở/tải lại trang
  isLoading: boolean;
  login: (payload: LoginPayload) => Promise<void>;
  logout: () => void;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(null);

  // Nếu localStorage đang có token thì phải chờ server xác minh xong
  // mới biết người dùng đã đăng nhập hay chưa → bắt đầu ở trạng thái "đang tải".
  const [isLoading, setIsLoading] = useState<boolean>(
    () => localStorage.getItem(TOKEN_KEY) !== null,
  );

  // Khôi phục phiên đăng nhập khi tải lại trang.
  useEffect(() => {
    if (!localStorage.getItem(TOKEN_KEY)) return;

    let ignore = false; // tránh cập nhật state nếu component đã bị hủy (StrictMode chạy effect 2 lần)

    authService
      .getCurrentUser()
      .then((currentUser) => {
        if (!ignore) setUser(currentUser);
      })
      .catch(() => {
        // Token hỏng hoặc hết hạn → bỏ đi, người dùng sẽ phải đăng nhập lại
        localStorage.removeItem(TOKEN_KEY);
      })
      .finally(() => {
        if (!ignore) setIsLoading(false);
      });

    return () => {
      ignore = true;
    };
  }, []);

  const login = useCallback(async (payload: LoginPayload) => {
    const { token, user: loggedInUser } = await authService.login(payload);
    localStorage.setItem(TOKEN_KEY, token);
    setUser(loggedInUser);
  }, []);

  const logout = useCallback(() => {
    localStorage.removeItem(TOKEN_KEY);
    setUser(null);
  }, []);

  const value = useMemo<AuthContextValue>(
    () => ({ user, isAuthenticated: user !== null, isLoading, login, logout }),
    [user, isLoading, login, logout],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

// Hook để các component khác lấy thông tin đăng nhập: const { user, logout } = useAuth();
// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error("useAuth phải được dùng bên trong <AuthProvider>");
  }
  return context;
}
