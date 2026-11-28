import type { ReactNode } from "react";
import { BrowserRouter, Navigate, Route, Routes } from "react-router-dom";
import ProtectedRoute from "./components/ProtectedRoute/ProtectedRoute";
import { AuthProvider, useAuth } from "./context/AuthContext";
import Login from "./pages/Login/Login";
import AdminCourts from "./pages/AdminCourts/AdminCourts";
import type { UserRole } from "./types/user.types";
import "./App.css";

// Khi các bạn trong nhóm làm xong trang của mình, import vào đây rồi thay <PagePlaceholder /> tương ứng:
//   import AdminCourts from './pages/AdminCourts/AdminCourts';          (Duy)
//   import Booking from './pages/Booking/Booking';                      (Kiên)
//   import BookingHistory from './pages/BookingHistory/BookingHistory'; (Chuẩn)

const ROLE_LABEL: Record<UserRole, string> = {
  admin: "Quản trị viên",
  user: "Người dùng",
};

// Trang tạm để thử luồng đăng nhập/đăng xuất khi các trang thật chưa có.
function PagePlaceholder({
  title,
  children,
}: {
  title?: string;
  children?: ReactNode;
}) {  const { user, logout } = useAuth();

  return (
    <div className="app-shell">
      <header className="app-header">
        <div className="app-header__brand">
          <svg width="24" height="24" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20C4 11 9 5 20 4C20 14 14 20 4 20Z" fill="#8dbf8a" />
            <path
              d="M4 20L15 9"
              stroke="#1f4d3a"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span>Đặt sân</span>
        </div>

        <div className="app-header__user">
          <span>{user?.fullName}</span>
          {user && (
            <span className="app-header__role">{ROLE_LABEL[user.role]}</span>
          )}
          <button type="button" className="app-logout" onClick={logout}>
            Đăng xuất
          </button>
        </div>
      </header>

 <main className="app-main">
        {children ? (
          children
        ) : (
          <section className="app-card">
            <h1>{title}</h1>
            <p>
              Đăng nhập thành công với tài khoản “{user?.username}”. Trang này
              đang được các thành viên khác phát triển.
            </p>
          </section>
        )}
      </main>
    </div>
  );
}

export default function App() {
  return (
    <BrowserRouter>
      {/* Nếu Kiên dùng Redux cho giỏ đặt sân, bọc thêm <Provider store={store}> ở đây (ngoài hoặc trong AuthProvider đều được). */}
      <AuthProvider>
        <Routes>
          {/* Trang công khai */}
          <Route path="/login" element={<Login />} />

          {/* Cần đăng nhập (user và admin đều vào được) */}
          <Route element={<ProtectedRoute />}>
            <Route
              path="/booking"
              element={<PagePlaceholder title="Đặt sân (Kiên)" />}
            />
            <Route
              path="/history"
              element={<PagePlaceholder title="Lịch sử đặt sân (Chuẩn)" />}
            />
          </Route>

{/* Chỉ admin */}
          <Route element={<ProtectedRoute allowedRoles={["admin"]} />}>
            <Route
              path="/admin/courts"
              element={
                <PagePlaceholder>
                  <AdminCourts />
                </PagePlaceholder>
              }
            />
          </Route>
          {/* Mọi đường dẫn còn lại → /login. Nếu đã đăng nhập, trang Login sẽ tự chuyển đến trang mặc định theo vai trò.
              LƯU Ý: các đường dẫn mặc định đó (/booking, /admin/courts) bắt buộc phải có route ở trên,
              nếu không sẽ bị chuyển hướng lặp vô tận. */}
          <Route path="*" element={<Navigate to="/login" replace />} />
        </Routes>
      </AuthProvider>
    </BrowserRouter>
  );
}
