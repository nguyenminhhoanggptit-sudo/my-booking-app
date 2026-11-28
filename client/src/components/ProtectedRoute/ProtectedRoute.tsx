import { Navigate, Outlet, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../types/user.types";
import "./ProtectedRoute.css";

interface ProtectedRouteProps {
  // Nếu truyền vào, chỉ các vai trò này mới được vào. Bỏ trống = chỉ cần đã đăng nhập.
  allowedRoles?: UserRole[];
}

// Cách dùng trong App.tsx (layout route):
//   <Route element={<ProtectedRoute />}>                           ← cần đăng nhập
//   <Route element={<ProtectedRoute allowedRoles={['admin']} />}>  ← chỉ admin
export default function ProtectedRoute({ allowedRoles }: ProtectedRouteProps) {
  const { user, isAuthenticated, isLoading } = useAuth();
  const location = useLocation();

  // Đang xác minh token → chưa vội chuyển trang, tránh bị đá về /login oan khi F5
  if (isLoading) {
    return (
      <div className="protected-route__loading" role="status">
        <span className="protected-route__spinner" aria-hidden="true" />
        <p>Đang kiểm tra phiên đăng nhập…</p>
      </div>
    );
  }

  // Chưa đăng nhập → về /login, nhớ trang đang định vào để quay lại sau khi đăng nhập
  if (!isAuthenticated) {
    return <Navigate to="/login" replace state={{ from: location }} />;
  }

  // Đã đăng nhập nhưng sai vai trò → đưa về "/" (App sẽ điều hướng tiếp theo vai trò)
  if (allowedRoles && user && !allowedRoles.includes(user.role)) {
    return <Navigate to="/" replace />;
  }

  // Hợp lệ → hiển thị các route con
  return <Outlet />;
}
