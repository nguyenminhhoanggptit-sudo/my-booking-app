import { useState } from "react";
import type { FormEvent } from "react";
import { isAxiosError } from "axios";
import { Navigate, useLocation } from "react-router-dom";
import { useAuth } from "../../context/AuthContext";
import type { UserRole } from "../../types/user.types";
import "./Login.css";

// Trang mặc định sau khi đăng nhập, theo vai trò.
// Đổi cho khớp với các route khai báo trong App.tsx.
const DEFAULT_PATH_BY_ROLE: Record<UserRole, string> = {
  admin: "/admin/courts",
  user: "/booking",
};

// Vị trí và tốc độ của những chiếc lá rơi (delay âm để lá đã rơi sẵn khi vừa mở trang).
const LEAVES = [
  { left: "6%", delay: "-2s", duration: "16s" },
  { left: "22%", delay: "-9s", duration: "19s" },
  { left: "41%", delay: "-5s", duration: "15s" },
  { left: "63%", delay: "-12s", duration: "18s" },
  { left: "80%", delay: "-7s", duration: "17s" },
  { left: "92%", delay: "-1s", duration: "21s" },
];

// Chuyển lỗi từ axios thành câu thông báo dễ hiểu cho người dùng.
function getErrorMessage(err: unknown): string {
  if (isAxiosError(err)) {
    // Không có response = không tới được server (server tắt, mất mạng, sai địa chỉ API...)
    if (!err.response) {
      return "Không kết nối được tới máy chủ. Vui lòng kiểm tra mạng và thử lại.";
    }
    const serverMessage = err.response.data?.message;
    if (typeof serverMessage === "string") return serverMessage;
  }
  return "Đăng nhập không thành công. Vui lòng thử lại.";
}

export default function Login() {
  const { user, isLoading, login } = useAuth();
  const location = useLocation();

  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Đang xác minh token cũ: chưa hiển thị form để tránh nháy giao diện
  if (isLoading) return null;

  // Đã đăng nhập (kể cả vừa đăng nhập xong) → chuyển về trang đang định vào,
  // hoặc trang mặc định theo vai trò. Đây là nơi duy nhất xử lý việc chuyển trang.
  if (user) {
    const from = (location.state as { from?: { pathname: string } } | null)
      ?.from?.pathname;
    return <Navigate to={from ?? DEFAULT_PATH_BY_ROLE[user.role]} replace />;
  }

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedUsername = username.trim();
    if (!trimmedUsername || !password) {
      setError("Vui lòng nhập tên đăng nhập và mật khẩu.");
      return;
    }

    setError("");
    setIsSubmitting(true);
    try {
      await login({ username: trimmedUsername, password });
      // Thành công: `user` trong context được cập nhật → component render lại và <Navigate> ở trên chạy.
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="login-page">
      <div className="login-sun" aria-hidden="true" />

      <div className="login-leaves" aria-hidden="true">
        {LEAVES.map((leaf, index) => (
          <span
            key={index}
            className="login-leaf"
            style={{
              left: leaf.left,
              animationDelay: leaf.delay,
              animationDuration: leaf.duration,
            }}
          />
        ))}
      </div>

      <Scenery />

      <main className="login-card">
        <div className="login-brand">
          <svg width="28" height="28" viewBox="0 0 24 24" aria-hidden="true">
            <path d="M4 20C4 11 9 5 20 4C20 14 14 20 4 20Z" fill="#4f8f5a" />
            <path
              d="M4 20L15 9"
              stroke="#fff"
              strokeWidth="1.5"
              strokeLinecap="round"
            />
          </svg>
          <span>Đặt sân</span>
        </div>

        <h1 className="login-title">Chào mừng trở lại</h1>
        <p className="login-subtitle">
          Đăng nhập để đặt sân và xem lịch đặt của bạn.
        </p>

        <form onSubmit={handleSubmit} noValidate>
          <div className="login-field">
            <label htmlFor="login-username">Tên đăng nhập</label>
            <input
              id="login-username"
              name="username"
              type="text"
              autoComplete="username"
              autoFocus
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              disabled={isSubmitting}
            />
          </div>

          <div className="login-field">
            <label htmlFor="login-password">Mật khẩu</label>
            <div className="login-password">
              <input
                id="login-password"
                name="password"
                type={showPassword ? "text" : "password"}
                autoComplete="current-password"
                value={password}
                onChange={(e) => setPassword(e.target.value)}
                disabled={isSubmitting}
              />
              <button
                type="button"
                className="login-password__toggle"
                onClick={() => setShowPassword((prev) => !prev)}
                aria-label={showPassword ? "Ẩn mật khẩu" : "Hiện mật khẩu"}
                aria-pressed={showPassword}
              >
                {showPassword ? "Ẩn" : "Hiện"}
              </button>
            </div>
          </div>

          {error && (
            <p className="login-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="login-submit"
            disabled={isSubmitting}
          >
            {isSubmitting ? "Đang đăng nhập…" : "Đăng nhập"}
          </button>
        </form>
      </main>
    </div>
  );
}

// Phong cảnh đồi thông ở cuối trang, vẽ bằng SVG nên không cần file ảnh.
// Thứ tự vẽ: đồi xa → thông xa → đồi giữa → thông gần → đồi trước (che gốc cây).
function Scenery() {
  return (
    <svg
      className="login-scenery"
      viewBox="0 0 1440 320"
      preserveAspectRatio="xMidYMax slice"
      aria-hidden="true"
      focusable="false"
    >
      <defs>
        {/* Một cây thông, gốc ở (0, 38). Dùng lại nhiều lần qua <use> */}
        <g id="login-pine">
          <polygon points="0,-90 22,-50 10,-50 30,-14 12,-14 36,24 -36,24 -12,-14 -30,-14 -10,-50 -22,-50" />
          <rect x="-5" y="24" width="10" height="14" />
        </g>
      </defs>

      <path
        className="scenery-hill scenery-hill--back"
        d="M0,200 C240,120 480,160 720,190 C960,220 1200,120 1440,170 L1440,320 L0,320 Z"
      />
      <g className="scenery-pine scenery-pine--far">
        <use href="#login-pine" transform="translate(108 149) scale(0.7)" />
        <use href="#login-pine" transform="translate(194 140) scale(0.6)" />
        <use href="#login-pine" transform="translate(288 129) scale(0.75)" />
        <use href="#login-pine" transform="translate(468 139) scale(0.65)" />
        <use href="#login-pine" transform="translate(540 151) scale(0.55)" />
        <use href="#login-pine" transform="translate(1080 149) scale(0.7)" />
        <use href="#login-pine" transform="translate(1150 149) scale(0.55)" />
        <use href="#login-pine" transform="translate(1260 132) scale(0.75)" />
      </g>

      <path
        className="scenery-hill scenery-hill--mid"
        d="M0,240 C300,170 560,260 820,230 C1080,200 1260,230 1440,210 L1440,320 L0,320 Z"
      />
      <g className="scenery-pine scenery-pine--near">
        <use href="#login-pine" transform="translate(60 206) scale(0.75)" />
        <use href="#login-pine" transform="translate(132 184) scale(1)" />
        <use href="#login-pine" transform="translate(505 200) scale(0.8)" />
        <use href="#login-pine" transform="translate(664 215) scale(0.65)" />
        <use href="#login-pine" transform="translate(1160 182) scale(1)" />
        <use href="#login-pine" transform="translate(1230 191) scale(0.8)" />
        <use href="#login-pine" transform="translate(1331 181) scale(1.05)" />
      </g>

      <path
        className="scenery-hill scenery-hill--front"
        d="M0,280 C260,240 520,300 780,275 C1040,250 1240,290 1440,265 L1440,320 L0,320 Z"
      />
    </svg>
  );
}
