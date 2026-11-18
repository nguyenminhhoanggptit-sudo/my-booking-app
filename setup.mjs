#!/usr/bin/env node
// ============================================================
// setup.mjs - TẠO NHANH cấu trúc thư mục + file mẫu cho my-booking-app
//
// CÁCH DÙNG (chạy 1 lần, ở thư mục my-booking-app, cạnh thư mục client/):
//   1) npm create vite@latest client -- --template react-ts
//   2) node setup.mjs              (thêm --force để GHI ĐÈ cả file đã có)
//   3) làm theo "BƯỚC TIẾP THEO" in ra ở cuối
//
// AN TOÀN KHI CHẠY LẠI: file đã có được giữ nguyên, không mất code.
// Ngoại lệ: 3 file mặc định của Vite (main.tsx, App.tsx, index.css) được thay
// một lần; sau đó chúng mang thẻ [CHUNG ...] nên không bị ghi đè nữa.
//
// Nội dung mọi file mẫu nằm trong biến BUNDLE ở cuối file này, mỗi file bắt đầu
// bằng dòng "@@@ đường/dẫn". Dấu § trong BUNDLE được đổi thành dấu huyền (`).
// ============================================================
import {
  copyFileSync, existsSync, mkdirSync, readFileSync, rmSync, rmdirSync, writeFileSync,
} from 'node:fs';
import { dirname, join } from 'node:path';

const ROOT = process.cwd();
const FORCE = process.argv.includes('--force');

// File do script này tạo luôn có thẻ [CHUNG ...] hoặc [TV1..TV4 ...] ở đầu
const OURS = /\[(CHUNG|TV[1-4])/;
// 3 file mặc định của Vite: được thay nếu chưa có thẻ ở trên
const VITE_DEFAULTS = new Set(['client/src/main.tsx', 'client/src/App.tsx', 'client/src/index.css']);

const count = { created: 0, replaced: 0, kept: 0 };

const NEXT_STEPS = [
  '',
  'BƯỚC TIẾP THEO',
  '  1) Cài thư viện cho client:',
  '       cd client',
  '       npm install',
  '       npm install react-router-dom axios @reduxjs/toolkit react-redux',
  '',
  '  2) Cài thư viện cho server:',
  '       cd ../server',
  '       npm install express mongoose cors dotenv jsonwebtoken bcryptjs nodemailer',
  '       npm install -D typescript tsx @types/node @types/express @types/cors @types/jsonwebtoken @types/nodemailer',
  '',
  '  3) Chạy (mở 2 terminal):',
  '       server:  npm run dev    ->  http://localhost:5000/api/health',
  '       client:  npm run dev    ->  http://localhost:5173',
  '',
  'Đọc README.md để biết phân công và các file React CHUNG.',
].join('\n');

// Tách BUNDLE thành danh sách [đường dẫn, nội dung]
function parseBundle() {
  return BUNDLE.replace(/\r\n/g, '\n')
    .split(/^@@@ /m)
    .slice(1)
    .map((block) => {
      const nl = block.indexOf('\n');
      const path = block.slice(0, nl).trim();
      const body = block.slice(nl + 1).replace(/\n+$/, '\n').replaceAll('§', '`');
      return [path, body];
    });
}

// Ghi 1 file (tự tạo thư mục cha). Không đè file đã có, trừ khi --force hoặc là file mặc định của Vite
function put(path, body) {
  const full = join(ROOT, path);
  const old = existsSync(full) ? readFileSync(full, 'utf8') : null;

  let label;
  if (old === null) {
    label = '+ tạo     ';
    count.created++;
  } else if (FORCE || (VITE_DEFAULTS.has(path) && !OURS.test(old))) {
    label = '~ ghi đè  ';
    count.replaced++;
  } else {
    console.log('  = giữ     ' + path);
    count.kept++;
    return;
  }
  mkdirSync(dirname(full), { recursive: true });
  writeFileSync(full, body, 'utf8');
  console.log('  ' + label + path);
}

// server/package.json: thêm scripts (tạo mới nếu chưa có, giữ nguyên phần còn lại nếu đã npm init)
function ensureServerPackage() {
  const path = join(ROOT, 'server', 'package.json');
  mkdirSync(dirname(path), { recursive: true });
  const pkg = existsSync(path) ? JSON.parse(readFileSync(path, 'utf8')) : {};
  pkg.name ??= 'booking-server';
  pkg.version ??= '1.0.0';
  pkg.private = true;
  pkg.type ??= 'commonjs';
  pkg.main = 'dist/server.js';
  pkg.scripts = {
    dev: 'tsx watch src/server.ts',
    build: 'tsc',
    start: 'node dist/server.js',
    seed: 'tsx src/seed/seed.ts',
  };
  writeFileSync(path, JSON.stringify(pkg, null, 2) + '\n', 'utf8');
  console.log('  ~ cập nhật server/package.json (scripts: dev, build, start, seed)');
}

// Xóa file mẫu của Vite mà dự án không dùng
function cleanViteLeftovers() {
  for (const f of ['client/src/App.css', 'client/src/assets/react.svg']) {
    const p = join(ROOT, f);
    if (existsSync(p)) {
      rmSync(p);
      console.log('  - xóa     ' + f + ' (file mẫu của Vite)');
    }
  }
  try {
    rmdirSync(join(ROOT, 'client', 'src', 'assets')); // chỉ xóa được khi thư mục đã rỗng
  } catch {
    /* còn file khác hoặc không tồn tại: bỏ qua */
  }
}

// Tạo .env từ .env.example nếu chưa có (.env nằm trong .gitignore, không bị commit)
function copyEnvFiles() {
  for (const dir of ['client', 'server']) {
    const example = join(ROOT, dir, '.env.example');
    const env = join(ROOT, dir, '.env');
    if (existsSync(example) && !existsSync(env)) {
      copyFileSync(example, env);
      console.log('  + tạo     ' + dir + '/.env (bản sao của .env.example)');
    }
  }
}

function main() {
  if (!existsSync(join(ROOT, 'client', 'package.json'))) {
    console.error('Không thấy client/package.json - chưa tạo project Vite.');
    console.error('Chạy trước:   npm create vite@latest client -- --template react-ts');
    console.error('Sau đó chạy:  node setup.mjs   (ở thư mục chứa client/)');
    process.exit(1);
  }

  console.log('Đang tạo file...');
  for (const [path, body] of parseBundle()) put(path, body);
  ensureServerPackage();
  cleanViteLeftovers();
  copyEnvFiles();

  console.log(
    '\nXong: ' + count.created + ' file mới, ' + count.replaced + ' file ghi đè, ' + count.kept + ' file giữ nguyên.'
  );
  console.log(NEXT_STEPS);
}

// ============================================================
// BUNDLE: nội dung toàn bộ file mẫu (mỗi file bắt đầu bằng dòng "@@@ đường/dẫn")
// ============================================================
const BUNDLE = String.raw`
@@@ .gitignore
# [CHUNG - chỉ Hoàng sửa] File và thư mục KHÔNG đưa lên Git
node_modules/
dist/
.env
.env.local
*.log
.DS_Store

@@@ README.md
# My Booking App - Hệ thống đặt sân

Dự án nhóm 4 người.

- §client/§: React + TypeScript + Vite (viết bằng §.tsx§, §.ts§, §.css§)
- §server/§: Node.js + Express + TypeScript + MongoDB (Mongoose)

## 1. Chạy dự án

Cần Node.js 20+ và MongoDB (cài trên máy hoặc dùng MongoDB Atlas).

    # Terminal 1 - server (cổng 5000)
    cd server
    npm install
    npm run dev

    # Terminal 2 - client (cổng 5173)
    cd client
    npm install
    npm run dev

- Lần đầu: copy §.env.example§ thành §.env§ ở cả §client/§ và §server/§ (setup.mjs đã làm sẵn), rồi sửa §MONGO_URI§ và §JWT_SECRET§.
- Kiểm tra server: mở http://localhost:5000/api/health
- Không commit file §.env§, chỉ commit §.env.example§.

## 2. Phân công

| Thành viên | Chức năng | Frontend | Backend |
|---|---|---|---|
| Nguyễn Minh Hoàng (trưởng nhóm) - TV1 | Người dùng, đăng nhập; nâng cao: JWT, gửi mail, deploy | Login, Register, Profile, AuthContext, ProtectedRoute, AdminRoute, Navbar | §/api/auth§, §/api/users§, JWT + middleware, sendEmail, config DB |
| Đặng Việt Duy - TV2 | Quản lý sân (admin), trang chủ | ManageCourts, Home, CourtDetail | §/api/courts§ CRUD, kiểm tra dữ liệu, seed dữ liệu mẫu |
| Vũ Đức Kiên - TV3 | Đặt sân theo khung giờ | Booking (lịch trống, chọn giờ), giỏ đặt sân (Redux) | §/api/bookings§, chặn đặt trùng giờ, hủy/đổi trạng thái |
| Đình Chuẩn - TV4 | Tìm kiếm, lịch sử, thống kê | History, ManageBookings, Dashboard, FilterBar, Pagination | §/api/history§ (lọc, phân trang), §/api/stats§ (doanh thu) |

Dòng đầu của mỗi file có thẻ người phụ trách: §[TV1 Hoàng]§, §[TV2 Duy]§, §[TV3 Kiên]§, §[TV4 Chuẩn]§ hoặc §[CHUNG ...]§.

## 3. File React CHUNG (cả nhóm dùng, đọc trước khi code)

| File (trong §client/src/§) | Ai giữ | Làm gì |
|---|---|---|
| §main.tsx§ | Hoàng | Điểm vào. Bọc Redux, Auth, Router rồi render §<App />§ |
| §App.tsx§ | Cả nhóm | Bảng route: URL nào hiện trang nào. Mỗi người chỉ thêm dòng của mình |
| §components/common/Layout.tsx§ | Hoàng | Khung chung: Navbar + §<Outlet />§ (chỗ trang con hiện ra) |
| §components/common/Navbar.tsx§ | Hoàng | Menu. Đọc user từ §useAuth()§, số giờ trong giỏ từ Redux |
| §components/common/ProtectedRoute.tsx§ | Hoàng | Chưa đăng nhập thì chuyển về §/login§ |
| §components/common/AdminRoute.tsx§ | Hoàng | Không phải admin thì chuyển về §/§ |
| §context/AuthContext.tsx§ | Hoàng | "Ai đang đăng nhập": §useAuth()§ trả về §user§, §login§, §logout§ |
| §api/axiosClient.ts§ | Hoàng | Cổng gọi API duy nhất, tự gắn JWT |
| §store/§ | Kiên | Redux (giỏ đặt sân). §main.tsx§ dùng §store§ ở đây |
| §types/index.ts§ | Cả nhóm | Gom type của 4 người, import bằng §from '../types'§ |
| §utils/format.ts§ | Cả nhóm | §formatCurrency§, §formatDate§ |
| §index.css§ | Hoàng | CSS toàn cục: biến màu, §.btn§, §.card§, §.input§, §.table§, §.grid§ |
| §pages/NotFound.tsx§ | Hoàng | Trang 404 |

Luồng khi mở một trang, ví dụ §/history§:

    main.tsx (Redux > Auth > Router)
      -> App.tsx (khớp route /history, nằm trong ProtectedRoute)
        -> ProtectedRoute (chưa đăng nhập thì chuyển /login)
          -> Layout (Navbar + Outlet)
            -> pages/user/History.tsx (trang của Chuẩn)

## 4. Quy ước làm việc nhóm

- Chỉ sửa file có thẻ của mình. File §[CHUNG - chỉ Hoàng sửa]§: cần gì báo Hoàng.
- §App.tsx§, §types/index.ts§: cả nhóm cùng thêm, mỗi người chỉ thêm đúng dòng của mình, §git pull§ trước khi sửa.
- CSS: mỗi người một file trong §src/styles/§ (§court.css§, §booking.css§, §stats.css§), đặt tiền tố class (§court-§, §booking-§, §stats-§) để không đụng nhau. Class dùng chung nằm ở §index.css§.
- Git: tạo nhánh §feature/<tên>-<việc>§, không push thẳng lên §main§, commit nhỏ, pull thường xuyên.
- Thứ tự làm: Hoàng xong auth + middleware trước (ai cũng cần token để test), Duy chạy seed, sau đó Kiên và Chuẩn làm tiếp.
- Cả nhóm chốt §types/§ và §models/§ (nhất là §Booking§) trước khi code. Kiên và Chuẩn thống nhất tên endpoint đổi trạng thái đơn.

@@@ client/.env.example
# [TV1 Hoàng] Biến môi trường của client. Copy file này thành .env
# Trong Vite, biến phải bắt đầu bằng VITE_ và được đọc bằng import.meta.env.VITE_...
VITE_API_URL=http://localhost:5000/api

@@@ client/src/api/authApi.ts
// [TV1 Hoàng] authApi.ts - gọi API đăng nhập / đăng ký  (server: /api/auth)
//   Đặt tên có đuôi Api để khỏi nhầm với login() của useAuth().
//   Cách dùng trong Login.tsx:  const { user, token } = await loginApi(email, password); login(user, token);
import axiosClient from './axiosClient';
import type { AuthResponse } from '../types';

export const loginApi = async (email: string, password: string): Promise<AuthResponse> => {
  const res = await axiosClient.post<AuthResponse>('/auth/login', { email, password });
  return res.data;
};

export const registerApi = async (name: string, email: string, password: string): Promise<AuthResponse> => {
  const res = await axiosClient.post<AuthResponse>('/auth/register', { name, email, password });
  return res.data;
};

@@@ client/src/api/axiosClient.ts
// ============================================================
// [CHUNG - chỉ Hoàng sửa] axiosClient.ts - "ĐƯỜNG DÂY" gọi API duy nhất
//   Mọi file trong api/ đều import axiosClient này, KHÔNG tự gọi axios.create().
//   - baseURL lấy từ VITE_API_URL trong .env
//   - Tự gắn JWT (lấy từ localStorage) vào header Authorization cho mọi request
//   - Gặp lỗi 401 khi đang có token (hết hạn) -> xóa đăng nhập, quay về /login
// ============================================================
import axios from 'axios';

const axiosClient = axios.create({
  baseURL: import.meta.env.VITE_API_URL ?? 'http://localhost:5000/api',
});

axiosClient.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = 'Bearer ' + token;
  }
  return config;
});

axiosClient.interceptors.response.use(
  (res) => res,
  (error) => {
    // Chỉ xử lý khi ĐANG có token: đăng nhập sai mật khẩu cũng trả 401 nhưng không được tải lại trang
    if (error.response?.status === 401 && localStorage.getItem('token')) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

export default axiosClient;

@@@ client/src/api/bookingApi.ts
// [TV3 Kiên] bookingApi.ts - gọi API đặt sân  (server: /api/bookings)
//   Tên endpoint dưới đây là DỰ KIẾN. Kiên chốt với Chuẩn: ManageBookings (của Chuẩn)
//   gọi updateBookingStatus. Đổi endpoint thì đổi cả server/src/routes/bookingRoutes.ts.
import axiosClient from './axiosClient';
import type { Booking, BookingInput, BookingStatus } from '../types';

// Các đơn đã đặt của 1 sân trong 1 ngày (để SlotPicker tô xám giờ đã bị đặt)
export const getBookedSlots = async (courtId: string, date: string): Promise<Booking[]> => {
  const res = await axiosClient.get<Booking[]>('/bookings/court/' + courtId, { params: { date } });
  return res.data;
};

export const createBooking = async (data: BookingInput): Promise<Booking> => {
  const res = await axiosClient.post<Booking>('/bookings', data);
  return res.data;
};

export const cancelBooking = async (id: string): Promise<Booking> => {
  const res = await axiosClient.patch<Booking>('/bookings/' + id + '/cancel');
  return res.data;
};

// Admin đổi trạng thái đơn (pending / confirmed / cancelled)
export const updateBookingStatus = async (id: string, status: BookingStatus): Promise<Booking> => {
  const res = await axiosClient.patch<Booking>('/bookings/' + id + '/status', { status });
  return res.data;
};

@@@ client/src/api/courtApi.ts
// [TV2 Duy] courtApi.ts - gọi API sân  (server: /api/courts)
//   Dùng ở Home, CourtDetail, ManageCourts. Cần lọc/phân trang cho danh sách sân thì
//   thống nhất với Chuẩn rồi đổi kiểu trả về thành PaginatedResponse<Court>.
import axiosClient from './axiosClient';
import type { Court, CourtInput } from '../types';

export const getCourts = async (): Promise<Court[]> => {
  const res = await axiosClient.get<Court[]>('/courts');
  return res.data;
};

export const getCourtById = async (id: string): Promise<Court> => {
  const res = await axiosClient.get<Court>('/courts/' + id);
  return res.data;
};

export const createCourt = async (data: CourtInput): Promise<Court> => {
  const res = await axiosClient.post<Court>('/courts', data);
  return res.data;
};

export const updateCourt = async (id: string, data: CourtInput): Promise<Court> => {
  const res = await axiosClient.put<Court>('/courts/' + id, data);
  return res.data;
};

export const deleteCourt = async (id: string): Promise<void> => {
  await axiosClient.delete('/courts/' + id);
};

@@@ client/src/api/historyApi.ts
// [TV4 Chuẩn] historyApi.ts - lịch sử đặt sân có lọc + phân trang  (server: /api/history)
import axiosClient from './axiosClient';
import type { Booking, BookingFilter, PaginatedResponse } from '../types';

// Lịch sử của user đang đăng nhập (trang History)
export const getMyHistory = async (filter: BookingFilter): Promise<PaginatedResponse<Booking>> => {
  const res = await axiosClient.get<PaginatedResponse<Booking>>('/history', { params: filter });
  return res.data;
};

// Admin: toàn bộ đơn của mọi người (trang ManageBookings)
export const getAllBookings = async (filter: BookingFilter): Promise<PaginatedResponse<Booking>> => {
  const res = await axiosClient.get<PaginatedResponse<Booking>>('/history/all', { params: filter });
  return res.data;
};

@@@ client/src/api/statsApi.ts
// [TV4 Chuẩn] statsApi.ts - thống kê doanh thu cho Dashboard  (server: /api/stats)
import axiosClient from './axiosClient';
import type { RevenueStat } from '../types';

export const getRevenue = async (): Promise<RevenueStat[]> => {
  const res = await axiosClient.get<RevenueStat[]>('/stats/revenue');
  return res.data;
};

@@@ client/src/App.tsx
// ============================================================
// [CHUNG - cả nhóm] App.tsx - BẢNG ĐỊNH TUYẾN: URL nào hiện trang nào
//   Cấu trúc:  Layout (Navbar)  ->  nhóm quyền  ->  trang
//     - Công khai       : ai cũng vào được
//     - ProtectedRoute  : phải đăng nhập
//     - AdminRoute      : phải đăng nhập + role admin
//   QUY ƯỚC: mỗi người chỉ thêm import + route của MÌNH (có comment tên).
//   Các trang đã có route sẵn, chỉ cần sửa trong file trang của mình, không cần đụng file này.
//   Sửa xong commit ngay; git pull trước khi sửa để khỏi conflict.
// ============================================================
import { Routes, Route } from 'react-router-dom';
import Layout from './components/common/Layout';
import ProtectedRoute from './components/common/ProtectedRoute';
import AdminRoute from './components/common/AdminRoute';
import NotFound from './pages/NotFound';

// [TV1 Hoàng]
import Login from './pages/user/Login';
import Register from './pages/user/Register';
import Profile from './pages/user/Profile';
// [TV2 Duy]
import Home from './pages/user/Home';
import CourtDetail from './pages/user/CourtDetail';
import ManageCourts from './pages/admin/ManageCourts';
// [TV3 Kiên]
import Booking from './pages/user/Booking';
// [TV4 Chuẩn]
import History from './pages/user/History';
import ManageBookings from './pages/admin/ManageBookings';
import Dashboard from './pages/admin/Dashboard';

export default function App() {
  return (
    <Routes>
      <Route element={<Layout />}>
        {/* ---- Công khai ---- */}
        <Route path="/" element={<Home />} /> {/* Duy */}
        <Route path="/courts/:id" element={<CourtDetail />} /> {/* Duy */}
        <Route path="/login" element={<Login />} /> {/* Hoàng */}
        <Route path="/register" element={<Register />} /> {/* Hoàng */}

        {/* ---- Phải đăng nhập ---- */}
        <Route element={<ProtectedRoute />}>
          <Route path="/profile" element={<Profile />} /> {/* Hoàng */}
          <Route path="/booking/:courtId" element={<Booking />} /> {/* Kiên */}
          <Route path="/history" element={<History />} /> {/* Chuẩn */}
        </Route>

        {/* ---- Chỉ admin ---- */}
        <Route element={<AdminRoute />}>
          <Route path="/admin" element={<Dashboard />} /> {/* Chuẩn */}
          <Route path="/admin/courts" element={<ManageCourts />} /> {/* Duy */}
          <Route path="/admin/bookings" element={<ManageBookings />} /> {/* Chuẩn */}
        </Route>

        <Route path="*" element={<NotFound />} />
      </Route>
    </Routes>
  );
}

@@@ client/src/components/booking/BookingCart.tsx
// [TV3 Kiên] BookingCart.tsx - giỏ đặt sân: các giờ đã chọn + nút "Xác nhận đặt"
//   TODO: đọc giỏ    const items = useAppSelector((state) => state.booking.items);
//         xóa 1 giờ  dispatch(removeItem(index));
//         xác nhận   createBooking(...) (api/bookingApi.ts) rồi dispatch(clearCart())
import '../../styles/booking.css';

export default function BookingCart() {
  return <div className="card">BookingCart (TODO Kiên)</div>;
}

@@@ client/src/components/booking/SlotPicker.tsx
// [TV3 Kiên] SlotPicker.tsx - lưới chọn khung giờ (dùng trong Booking)
//   TODO: props { bookedSlots: string[]; selected: string[]; onToggle: (startTime: string) => void }
//         mỗi giờ là 1 <button className="booking-slot">; thêm class is-selected / is-booked
//         (đã có sẵn trong styles/booking.css)
import '../../styles/booking.css';

export default function SlotPicker() {
  return <div className="booking-slots">SlotPicker (TODO Kiên)</div>;
}

@@@ client/src/components/common/AdminRoute.tsx
// ============================================================
// [CHUNG - chỉ Hoàng sửa] AdminRoute.tsx - BẢO VỆ: phải là admin
//   Chưa đăng nhập                    -> chuyển /login
//   Đăng nhập nhưng role khác 'admin' -> chuyển về trang chủ /
//   Lưu ý: đây chỉ là chặn ở giao diện. Server vẫn phải chặn bằng adminOnly
//   (server/src/middlewares/adminMiddleware.ts).
// ============================================================
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function AdminRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  if (user.role !== 'admin') return <Navigate to="/" replace />;
  return <Outlet />;
}

@@@ client/src/components/common/Layout.tsx
// ============================================================
// [CHUNG - chỉ Hoàng sửa] Layout.tsx - KHUNG CHUNG của mọi trang
//   Navbar luôn hiện ở trên; <Outlet /> là chỗ trang con (Home, Booking, History...)
//   được chèn vào. Nhờ vậy không ai phải tự chép Navbar vào trang của mình.
//   Được dùng trong App.tsx:  <Route element={<Layout />}> ... </Route>
// ============================================================
import { Outlet } from 'react-router-dom';
import Navbar from './Navbar';

export default function Layout() {
  return (
    <>
      <Navbar />
      <main className="container">
        <Outlet />
      </main>
    </>
  );
}

@@@ client/src/components/common/Navbar.tsx
// ============================================================
// [CHUNG - chỉ Hoàng sửa] Navbar.tsx - THANH MENU
//   Dữ liệu chung nó đọc:
//     - useAuth()        -> user đang đăng nhập (ẩn/hiện link, nút Đăng xuất)
//     - useAppSelector() -> số giờ đang có trong giỏ đặt sân (Redux của Kiên)
//   Thêm link mới vào menu? Báo Hoàng.
// ============================================================
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { useAppSelector } from '../../store/hooks';

export default function Navbar() {
  const { user, logout } = useAuth();
  const cartCount = useAppSelector((state) => state.booking.items.length);
  const navigate = useNavigate();

  const handleLogout = () => {
    logout();
    navigate('/login');
  };

  return (
    <header className="navbar">
      <nav className="navbar-inner">
        <Link to="/" className="navbar-brand">Đặt sân</Link>

        {user && <Link to="/history">Lịch sử đặt</Link>}
        {user?.role === 'admin' && (
          <>
            <Link to="/admin">Thống kê</Link>
            <Link to="/admin/courts">Quản lý sân</Link>
            <Link to="/admin/bookings">Quản lý đơn</Link>
          </>
        )}

        <div className="navbar-right">
          {cartCount > 0 && <span className="navbar-badge">Giỏ: {cartCount} giờ</span>}
          {user ? (
            <>
              <Link to="/profile">{user.name}</Link>
              <button className="btn btn-outline" onClick={handleLogout}>Đăng xuất</button>
            </>
          ) : (
            <>
              <Link to="/login">Đăng nhập</Link>
              <Link to="/register">Đăng ký</Link>
            </>
          )}
        </div>
      </nav>
    </header>
  );
}

@@@ client/src/components/common/ProtectedRoute.tsx
// ============================================================
// [CHUNG - chỉ Hoàng sửa] ProtectedRoute.tsx - BẢO VỆ: phải đăng nhập mới vào được
//   Đã đăng nhập   -> <Outlet /> (cho hiện trang con)
//   Chưa đăng nhập -> chuyển sang /login, nhớ trang đang muốn vào trong location.state.from
//                     (Login.tsx đọc state này để quay lại đúng trang sau khi đăng nhập)
//   Dùng trong App.tsx:  <Route element={<ProtectedRoute />}> ...các trang cần đăng nhập... </Route>
// ============================================================
import { Navigate, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';

export default function ProtectedRoute() {
  const { user } = useAuth();
  const location = useLocation();

  if (!user) return <Navigate to="/login" replace state={{ from: location }} />;
  return <Outlet />;
}

@@@ client/src/components/court/CourtCard.tsx
// [TV2 Duy] CourtCard.tsx - thẻ hiển thị 1 sân (dùng ở Home)
//   Đã làm sẵn bản mẫu để thấy cách dùng type Court, formatCurrency và link sang /booking/:courtId.
//   Duy tự chỉnh giao diện / thêm thông tin.
import { Link } from 'react-router-dom';
import type { Court } from '../../types';
import { formatCurrency } from '../../utils/format';
import '../../styles/court.css';

export default function CourtCard({ court }: { court: Court }) {
  return (
    <div className="card court-card">
      <h3>{court.name}</h3>
      {court.description && <p>{court.description}</p>}
      <span className="court-price">{formatCurrency(court.pricePerHour)} / giờ</span>
      <Link to={'/courts/' + court._id}>Xem chi tiết</Link>
      <Link className="btn" to={'/booking/' + court._id}>Đặt sân</Link>
    </div>
  );
}

@@@ client/src/components/court/CourtForm.tsx
// [TV2 Duy] CourtForm.tsx - form thêm / sửa sân (dùng trong ManageCourts)
//   TODO: props { initial?: Court; onSubmit: (data: CourtInput) => void }
//         ô nhập: tên, giá mỗi giờ (pricePerHour), mô tả. Kiểm tra dữ liệu trước khi gọi onSubmit.
import '../../styles/court.css';

export default function CourtForm() {
  return <div className="card court-form">CourtForm (TODO Duy)</div>;
}

@@@ client/src/components/filter/FilterBar.tsx
// [TV4 Chuẩn] FilterBar.tsx - thanh lọc, CẢ NHÓM dùng chung (Home, History, ManageBookings)
//   TODO: props { value: BookingFilter; onChange: (filter: BookingFilter) => void }
//         ô lọc: từ khóa / trạng thái / khoảng ngày. Mỗi lần đổi bộ lọc nhớ đặt lại page = 1.
//   Làm sớm để Duy (Home) dùng được.
import '../../styles/stats.css';

export default function FilterBar() {
  return <div className="filter-bar">FilterBar (TODO Chuẩn)</div>;
}

@@@ client/src/components/filter/Pagination.tsx
// [TV4 Chuẩn] Pagination.tsx - nút Trang trước / Trang sau, CẢ NHÓM dùng chung (Home, History, ManageBookings)
//   Dùng:  <Pagination page={data.page} totalPages={data.totalPages} onChange={(p) => setPage(p)} />
//   Khớp với PaginatedResponse<T> (types/stats.ts). Chuẩn tự chỉnh giao diện nếu muốn.
import '../../styles/stats.css';

interface PaginationProps {
  page: number;
  totalPages: number;
  onChange: (page: number) => void;
}

export default function Pagination({ page, totalPages, onChange }: PaginationProps) {
  if (totalPages <= 1) return null;

  return (
    <div className="pagination">
      <button className="btn btn-outline" disabled={page <= 1} onClick={() => onChange(page - 1)}>
        Trang trước
      </button>
      <span>Trang {page} / {totalPages}</span>
      <button className="btn btn-outline" disabled={page >= totalPages} onClick={() => onChange(page + 1)}>
        Trang sau
      </button>
    </div>
  );
}

@@@ client/src/components/stats/RevenueChart.tsx
// [TV4 Chuẩn] RevenueChart.tsx - biểu đồ doanh thu theo ngày (dùng trong Dashboard)
//   TODO: props { data: RevenueStat[] }
//         Vẽ bằng thư viện recharts (cài: npm install recharts) hoặc tự vẽ bằng CSS.
import '../../styles/stats.css';

export default function RevenueChart() {
  return <div className="card">RevenueChart (TODO Chuẩn)</div>;
}

@@@ client/src/components/stats/StatCard.tsx
// [TV4 Chuẩn] StatCard.tsx - 1 ô số liệu ở Dashboard (ví dụ: Tổng doanh thu, Số đơn)
//   Dùng:  <StatCard label="Tổng doanh thu" value={formatCurrency(total)} />
import '../../styles/stats.css';

interface StatCardProps {
  label: string;
  value: string | number;
}

export default function StatCard({ label, value }: StatCardProps) {
  return (
    <div className="card">
      <div className="stats-label">{label}</div>
      <div className="stats-value">{value}</div>
    </div>
  );
}

@@@ client/src/context/AuthContext.tsx
// ============================================================
// [CHUNG - chỉ Hoàng sửa] AuthContext.tsx - "AI ĐANG ĐĂNG NHẬP?" (dữ liệu dùng chung)
//   Lưu user + token vào localStorage để F5 không mất đăng nhập.
//   Dùng ở bất kỳ trang nào:   const { user, login, logout } = useAuth();
//     - user              : User | null  (null = chưa đăng nhập)
//     - login(user, token): gọi SAU KHI API đăng nhập/đăng ký thành công
//     - logout()          : xóa user + token
//   <AuthProvider> đã được bọc sẵn trong main.tsx.
// ============================================================
import { createContext, useContext, useState } from 'react';
import type { ReactNode } from 'react';
import type { User } from '../types';

interface AuthContextType {
  user: User | null;
  login: (user: User, token: string) => void;
  logout: () => void;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

function loadUser(): User | null {
  try {
    const saved = localStorage.getItem('user');
    return saved ? (JSON.parse(saved) as User) : null;
  } catch {
    return null;
  }
}

export function AuthProvider({ children }: { children: ReactNode }) {
  const [user, setUser] = useState<User | null>(loadUser);

  const login = (u: User, token: string) => {
    localStorage.setItem('user', JSON.stringify(u));
    localStorage.setItem('token', token); // axiosClient đọc token này để gắn vào mọi request
    setUser(u);
  };

  const logout = () => {
    localStorage.removeItem('user');
    localStorage.removeItem('token');
    setUser(null);
  };

  return <AuthContext.Provider value={{ user, login, logout }}>{children}</AuthContext.Provider>;
}

// eslint-disable-next-line react-refresh/only-export-components
export function useAuth(): AuthContextType {
  const ctx = useContext(AuthContext);
  if (!ctx) throw new Error('useAuth phải được dùng bên trong <AuthProvider>');
  return ctx;
}

@@@ client/src/index.css
/* ============================================================
   [CHUNG - chỉ Hoàng sửa] index.css - CSS TOÀN CỤC của cả web
   Gồm: 1) biến màu/chữ  2) reset  3) bố cục  4) navbar  5) nút
        6) form  7) thẻ, lưới, bảng  8) trang đăng nhập/đăng ký
   - Đổi màu hoặc font cả web: sửa biến ở mục 1.
   - Class dùng chung (.container .btn .input .card .grid .table) cứ dùng thoải mái.
   - CSS riêng từng người đặt trong src/styles/ (court.css, booking.css, stats.css)
     và đặt tiền tố class (court-, booking-, stats-) để không đụng nhau.
   ============================================================ */

/* 1. BIẾN MÀU / CHỮ */
:root {
  --primary: #0e6b5c;      /* xanh sân trong nhà: nút chính, navbar */
  --primary-dark: #0a5247;
  --accent: #e0a526;       /* vàng vạch kẻ sân: giờ đang chọn, điểm nhấn */
  --danger: #c0392b;
  --bg: #f3f5f6;
  --card: #ffffff;
  --text: #1b2428;
  --muted: #5d6b73;
  --border: #d8dfe3;
  --font: system-ui, -apple-system, 'Segoe UI', Roboto, 'Helvetica Neue', sans-serif;
  --radius: 6px;           /* ô nhập, nút */
  --radius-lg: 10px;       /* thẻ */
}

/* 2. RESET */
*, *::before, *::after { box-sizing: border-box; }
body { margin: 0; font-family: var(--font); background: var(--bg); color: var(--text); line-height: 1.5; }
h1, h2, h3 { line-height: 1.25; margin: 0 0 12px; }
a { color: var(--primary); }
:focus-visible { outline: 2px solid var(--accent); outline-offset: 2px; }

/* 3. BỐ CỤC */
.container { max-width: 1100px; margin: 0 auto; padding: 24px 16px; }

/* 4. NAVBAR (components/common/Navbar.tsx) */
.navbar { background: var(--primary); color: #fff; }
.navbar-inner { display: flex; flex-wrap: wrap; align-items: center; gap: 8px 20px; max-width: 1100px; margin: 0 auto; padding: 12px 16px; }
.navbar a { color: #fff; text-decoration: none; }
.navbar a:hover { text-decoration: underline; }
.navbar-brand { font-weight: 700; font-size: 1.15rem; }
.navbar-right { display: flex; align-items: center; gap: 16px; margin-left: auto; }
.navbar-badge { background: var(--accent); color: var(--text); border-radius: 999px; padding: 2px 10px; font-size: .875rem; font-weight: 600; }

/* 5. NÚT: <button className="btn"> hoặc <Link className="btn"> */
.btn { display: inline-block; padding: 8px 16px; border: 1px solid var(--primary); border-radius: var(--radius); background: var(--primary); color: #fff; font: inherit; text-align: center; text-decoration: none; cursor: pointer; }
.btn:hover:not(:disabled) { background: var(--primary-dark); border-color: var(--primary-dark); }
.btn:disabled { opacity: .5; cursor: not-allowed; }
.btn-outline { background: transparent; color: var(--primary); }
.btn-outline:hover:not(:disabled) { background: var(--primary); color: #fff; }
.btn-danger { background: var(--danger); border-color: var(--danger); }
.btn-danger:hover:not(:disabled) { background: #a02f23; border-color: #a02f23; }
.navbar .btn-outline { color: #fff; border-color: rgba(255, 255, 255, .7); }
.navbar .btn-outline:hover:not(:disabled) { background: rgba(255, 255, 255, .15); }

/* 6. FORM */
.form-group { margin-bottom: 14px; }
.form-group label { display: block; margin-bottom: 4px; font-weight: 600; }
.input { width: 100%; padding: 8px 12px; border: 1px solid var(--border); border-radius: var(--radius); background: #fff; color: var(--text); font: inherit; }
.input:focus { border-color: var(--primary); }
.error-text { color: var(--danger); font-size: .9rem; margin: 4px 0 0; }

/* 7. THẺ, LƯỚI, BẢNG */
.card { background: var(--card); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 16px; }
.grid { display: grid; grid-template-columns: repeat(auto-fill, minmax(240px, 1fr)); gap: 16px; }
.table-wrap { overflow-x: auto; }
.table { width: 100%; border-collapse: collapse; background: var(--card); }
.table th, .table td { padding: 10px 12px; border-bottom: 1px solid var(--border); text-align: left; }
.table th { font-weight: 600; color: var(--muted); }

/* 8. TRANG ĐĂNG NHẬP / ĐĂNG KÝ (Hoàng) */
.auth-box { max-width: 400px; margin: 32px auto; }

@@@ client/src/main.tsx
// ============================================================
// [CHUNG - chỉ Hoàng sửa] main.tsx - ĐIỂM VÀO của React
//   Chạy đầu tiên. Bọc cả app bằng: Redux -> Auth -> Router, rồi render <App />.
//   Nhờ vậy MỌI trang đều dùng được useAppSelector(), useAuth() và <Link>.
//   Cần thêm Provider mới? Báo Hoàng, đừng tự sửa.
// ============================================================
import { StrictMode } from 'react';
import { createRoot } from 'react-dom/client';
import { BrowserRouter } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store';
import { AuthProvider } from './context/AuthContext';
import App from './App';
import './index.css';

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <Provider store={store}>
      <AuthProvider>
        <BrowserRouter>
          <App />
        </BrowserRouter>
      </AuthProvider>
    </Provider>
  </StrictMode>
);

@@@ client/src/pages/admin/Dashboard.tsx
// [TV4 Chuẩn] Dashboard.tsx - Admin: thống kê doanh thu
//   Route : /admin  (chỉ admin - đã bọc AdminRoute trong App.tsx)
//   TODO  : getRevenue() (api/statsApi.ts) -> các ô <StatCard /> (trong <div className="stats-grid">) + <RevenueChart />
import '../../styles/stats.css';

export default function Dashboard() {
  return <h1>Thống kê doanh thu</h1>;
}

@@@ client/src/pages/admin/ManageBookings.tsx
// [TV4 Chuẩn] ManageBookings.tsx - Admin: quản lý tất cả đơn đặt sân
//   Route : /admin/bookings  (chỉ admin - đã bọc AdminRoute trong App.tsx)
//   TODO  : <FilterBar /> + getAllBookings(filter) (api/historyApi.ts) + <Pagination />
//           đổi trạng thái đơn bằng updateBookingStatus (api/bookingApi.ts của Kiên) - thống nhất endpoint với Kiên
import '../../styles/stats.css';

export default function ManageBookings() {
  return <h1>Quản lý đơn đặt sân</h1>;
}

@@@ client/src/pages/admin/ManageCourts.tsx
// [TV2 Duy] ManageCourts.tsx - Admin: thêm, sửa, xóa sân
//   Route : /admin/courts  (chỉ admin - đã bọc AdminRoute trong App.tsx)
//   TODO  : bảng danh sách sân (getCourts) + <CourtForm /> thêm/sửa (createCourt, updateCourt) + nút xóa (deleteCourt)
import '../../styles/court.css';

export default function ManageCourts() {
  return <h1>Quản lý sân</h1>;
}

@@@ client/src/pages/NotFound.tsx
// [CHUNG - chỉ Hoàng sửa] NotFound.tsx - Trang 404: URL không khớp route nào (route "*" trong App.tsx)
import { Link } from 'react-router-dom';

export default function NotFound() {
  return (
    <div className="card">
      <h1>404 - Không tìm thấy trang</h1>
      <Link to="/">Về trang chủ</Link>
    </div>
  );
}

@@@ client/src/pages/user/Booking.tsx
// [TV3 Kiên] Booking.tsx - Đặt sân theo khung giờ
//   Route : /booking/:courtId  (phải đăng nhập - đã bọc ProtectedRoute trong App.tsx)
//   TODO  : const { courtId } = useParams<{ courtId: string }>();
//           chọn ngày -> getBookedSlots(courtId, date) -> <SlotPicker /> -> dispatch(addItem(...))
//           -> <BookingCart /> -> createBooking(...)
//           Server chặn trùng giờ và gửi mail xác nhận (bookingController + utils/sendEmail).
import '../../styles/booking.css';

export default function Booking() {
  return <h1>Đặt sân</h1>;
}

@@@ client/src/pages/user/CourtDetail.tsx
// [TV2 Duy] CourtDetail.tsx - Chi tiết 1 sân + nút "Đặt sân"
//   Route : /courts/:id
//   TODO  : const { id } = useParams<{ id: string }>();  ->  getCourtById(id)  ->  hiển thị thông tin
//           nút "Đặt sân" dẫn tới /booking/<id> (trang của Kiên)
import '../../styles/court.css';

export default function CourtDetail() {
  return <h1>Chi tiết sân</h1>;
}

@@@ client/src/pages/user/History.tsx
// [TV4 Chuẩn] History.tsx - Lịch sử đặt sân của người dùng
//   Route : /history  (phải đăng nhập - đã bọc ProtectedRoute trong App.tsx)
//   TODO  : <FilterBar /> + getMyHistory(filter) (api/historyApi.ts) -> bảng <table className="table">
//           + <Pagination />. Dùng formatCurrency / formatDate (utils/format.ts) để hiển thị.
import '../../styles/stats.css';

export default function History() {
  return <h1>Lịch sử đặt sân</h1>;
}

@@@ client/src/pages/user/Home.tsx
// [TV2 Duy] Home.tsx - Trang chủ: danh sách sân
//   Route : /  (đã khai báo sẵn trong App.tsx)
//   TODO  : getCourts() (api/courtApi.ts) -> hiển thị từng sân bằng <CourtCard /> trong <div className="grid">
//           lọc / phân trang dùng <FilterBar /> + <Pagination /> của Chuẩn
import '../../styles/court.css';

export default function Home() {
  return <h1>Danh sách sân</h1>;
}

@@@ client/src/pages/user/Login.tsx
// [TV1 Hoàng] Login.tsx - Trang đăng nhập
//   Route : /login  (đã khai báo sẵn trong App.tsx)
//   TODO  : form email + mật khẩu -> loginApi() (api/authApi.ts) -> useAuth().login(user, token)
//           -> navigate về trang trước đó (location.state?.from) hoặc '/'
//   Class có sẵn trong index.css: .auth-box .card .form-group .input .btn .error-text
export default function Login() {
  return (
    <div className="auth-box card">
      <h1>Đăng nhập</h1>
    </div>
  );
}

@@@ client/src/pages/user/Profile.tsx
// [TV1 Hoàng] Profile.tsx - Trang thông tin cá nhân
//   Route : /profile  (phải đăng nhập - đã bọc ProtectedRoute trong App.tsx)
//   TODO  : lấy user từ useAuth(), hiển thị thông tin; thêm form đổi mật khẩu (gọi /api/users)
export default function Profile() {
  return <h1>Thông tin cá nhân</h1>;
}

@@@ client/src/pages/user/Register.tsx
// [TV1 Hoàng] Register.tsx - Trang đăng ký
//   Route : /register  (đã khai báo sẵn trong App.tsx)
//   TODO  : form tên + email + mật khẩu -> registerApi() (api/authApi.ts) -> useAuth().login(user, token) -> navigate('/')
//   Class có sẵn trong index.css: .auth-box .card .form-group .input .btn .error-text
export default function Register() {
  return (
    <div className="auth-box card">
      <h1>Đăng ký</h1>
    </div>
  );
}

@@@ client/src/store/bookingSlice.ts
// [TV3 Kiên] bookingSlice.ts - Redux: GIỎ ĐẶT SÂN (các khung giờ đã chọn nhưng chưa xác nhận)
//   Dùng:  const dispatch = useAppDispatch();
//          dispatch(addItem({ courtId, courtName, date, startTime, endTime, price }));
//   Đọc :  const items = useAppSelector((state) => state.booking.items);
//   Navbar (của Hoàng) cũng đọc số lượng trong giỏ từ đây.
import { createSlice } from '@reduxjs/toolkit';
import type { PayloadAction } from '@reduxjs/toolkit';
import type { CartItem } from '../types';

interface BookingState {
  items: CartItem[];
}

const initialState: BookingState = { items: [] };

const bookingSlice = createSlice({
  name: 'booking',
  initialState,
  reducers: {
    addItem: (state, action: PayloadAction<CartItem>) => {
      state.items.push(action.payload);
    },
    removeItem: (state, action: PayloadAction<number>) => {
      state.items.splice(action.payload, 1); // payload = vị trí trong giỏ
    },
    clearCart: (state) => {
      state.items = [];
    },
  },
});

export const { addItem, removeItem, clearCart } = bookingSlice.actions;
export default bookingSlice.reducer;

@@@ client/src/store/hooks.ts
// [TV3 Kiên] hooks.ts - hook Redux đã gắn type. Dùng 2 hook này thay cho useDispatch / useSelector gốc.
import { useDispatch, useSelector } from 'react-redux';
import type { AppDispatch, RootState } from './index';

export const useAppDispatch = useDispatch.withTypes<AppDispatch>();
export const useAppSelector = useSelector.withTypes<RootState>();

@@@ client/src/store/index.ts
// [TV3 Kiên] store/index.ts - KHO REDUX chung. main.tsx bọc <Provider store={store}>.
//   Thêm reducer mới (nếu cần) vào khối reducer bên dưới, rồi báo cả nhóm.
import { configureStore } from '@reduxjs/toolkit';
import bookingReducer from './bookingSlice';

export const store = configureStore({
  reducer: {
    booking: bookingReducer,
  },
});

export type RootState = ReturnType<typeof store.getState>;
export type AppDispatch = typeof store.dispatch;

@@@ client/src/styles/booking.css
/* ============================================================
   [TV3 Kiên] booking.css - CSS cho Booking, SlotPicker, BookingCart
   Quy ước: mọi class bắt đầu bằng "booking-". Class dùng chung nằm ở index.css.
   ============================================================ */
.booking-slots { display: grid; grid-template-columns: repeat(auto-fill, minmax(96px, 1fr)); gap: 8px; }
.booking-slot { padding: 8px; border: 1px solid var(--border); border-radius: var(--radius); background: var(--card); font: inherit; cursor: pointer; }
.booking-slot.is-selected { background: var(--accent); border-color: var(--accent); font-weight: 600; }
.booking-slot.is-booked { opacity: .4; cursor: not-allowed; text-decoration: line-through; }

@@@ client/src/styles/court.css
/* ============================================================
   [TV2 Duy] court.css - CSS cho Home, CourtDetail, ManageCourts, CourtCard, CourtForm
   Quy ước: mọi class bắt đầu bằng "court-" để không đụng class của người khác.
   Class dùng chung (.btn .card .input .grid .table) nằm ở index.css, cứ dùng.
   Biến màu (var(--primary)...) cũng lấy từ index.css.
   ============================================================ */
.court-card { display: flex; flex-direction: column; gap: 8px; }
.court-card h3 { margin: 0; }
.court-price { font-weight: 700; color: var(--primary); }

@@@ client/src/styles/stats.css
/* ============================================================
   [TV4 Chuẩn] stats.css - CSS cho History, ManageBookings, Dashboard, FilterBar, Pagination, StatCard
   Quy ước: class bắt đầu bằng "stats-", "filter-" hoặc "pagination". Class dùng chung nằm ở index.css.
   ============================================================ */
.stats-grid { display: grid; grid-template-columns: repeat(auto-fit, minmax(200px, 1fr)); gap: 16px; margin-bottom: 24px; }
.stats-label { color: var(--muted); font-size: .9rem; }
.stats-value { font-size: 1.75rem; font-weight: 700; }
.filter-bar { display: flex; flex-wrap: wrap; gap: 8px; margin-bottom: 16px; }
.pagination { display: flex; align-items: center; justify-content: center; gap: 12px; margin: 16px 0; }

@@@ client/src/types/booking.ts
// [TV3 Kiên] booking.ts - type đơn đặt sân + giỏ đặt. Khớp server/src/models/Booking.ts
//   Chuẩn (TV4) thống kê dựa trên schema này, nên chốt sớm và báo khi đổi.
import type { Court } from './court';
import type { User } from './user';

export type BookingStatus = 'pending' | 'confirmed' | 'cancelled';

export interface Booking {
  _id: string;
  court: string | Court; // string = id; Court = khi server .populate('court')
  user: string | User;   // tương tự
  date: string;          // 'YYYY-MM-DD'
  startTime: string;     // 'HH:mm'
  endTime: string;       // 'HH:mm'
  totalPrice: number;
  status: BookingStatus;
  createdAt: string;
}

// Dữ liệu gửi lên khi tạo đơn
export interface BookingInput {
  court: string;
  date: string;
  startTime: string;
  endTime: string;
}

// 1 khung giờ trong giỏ đặt sân (Redux: store/bookingSlice.ts)
export interface CartItem {
  courtId: string;
  courtName: string;
  date: string;
  startTime: string;
  endTime: string;
  price: number;
}

@@@ client/src/types/court.ts
// [TV2 Duy] court.ts - type sân. Khớp server/src/models/Court.ts
//   Thêm field mới? Sửa cả model ở server và báo cả nhóm.
export interface Court {
  _id: string;
  name: string;
  pricePerHour: number;
  description?: string;
}

// Dữ liệu gửi lên khi tạo / sửa sân (chưa có _id)
export type CourtInput = Omit<Court, '_id'>;

@@@ client/src/types/index.ts
// ============================================================
// [CHUNG - cả nhóm] types/index.ts - CỔNG CHUNG của mọi type
//   Mỗi người giữ 1 file type riêng (ít conflict); file này chỉ gom lại để import gọn:
//     import type { User, Court, Booking } from '../types';
//   Thêm file type mới thì thêm 1 dòng export bên dưới.
//   Các type phải KHỚP với Schema Mongoose ở server/src/models/.
// ============================================================
export * from './user';    // [TV1 Hoàng]
export * from './court';   // [TV2 Duy]
export * from './booking'; // [TV3 Kiên]
export * from './stats';   // [TV4 Chuẩn]

@@@ client/src/types/stats.ts
// [TV4 Chuẩn] stats.ts - type thống kê, bộ lọc, phân trang
//   PaginatedResponse<T> khớp kết quả của server/src/utils/paginate.ts (buildPageResult)
//   và được cả nhóm dùng (danh sách sân, lịch sử, quản lý đơn...).
import type { BookingStatus } from './booking';

export interface PaginatedResponse<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

// Bộ lọc cho lịch sử / quản lý đơn
export interface BookingFilter {
  status?: BookingStatus;
  courtId?: string;
  from?: string; // 'YYYY-MM-DD'
  to?: string;   // 'YYYY-MM-DD'
  page?: number;
  limit?: number;
}

// 1 điểm trên biểu đồ doanh thu
export interface RevenueStat {
  date: string;
  revenue: number;
  bookings: number;
}

@@@ client/src/types/user.ts
// [TV1 Hoàng] user.ts - type người dùng. Khớp server/src/models/User.ts
export type Role = 'user' | 'admin';

export interface User {
  _id: string;
  name: string;
  email: string;
  role: Role;
}

// Server trả về sau khi đăng nhập / đăng ký
export interface AuthResponse {
  user: User;
  token: string;
}

@@@ client/src/utils/format.ts
// ============================================================
// [CHUNG - cả nhóm] format.ts - Hàm tiện ích dùng chung (định dạng tiền, ngày)
//   Cần hàm dùng chung mới? Thêm vào cuối file, đừng tự viết lại ở trang riêng.
//   Dùng:  formatCurrency(150000)   ->  "150.000 ₫"
//          formatDate('2026-11-17') ->  "17/11/2026"
// ============================================================
export const formatCurrency = (value: number): string =>
  new Intl.NumberFormat('vi-VN', { style: 'currency', currency: 'VND' }).format(value);

export const formatDate = (iso: string): string => new Date(iso).toLocaleDateString('vi-VN');

@@@ server/.env.example
# [TV1 Hoàng] Biến môi trường của server. Copy file này thành .env (KHÔNG commit .env)
PORT=5000
MONGO_URI=mongodb://127.0.0.1:27017/my-booking-app
JWT_SECRET=doi_thanh_mot_chuoi_bi_mat_that_dai
CLIENT_URL=http://localhost:5173
# Gửi mail xác nhận đặt sân (Gmail: dùng "Mật khẩu ứng dụng" / App Password, không dùng mật khẩu thường)
EMAIL_USER=
EMAIL_PASS=

@@@ server/src/config/db.ts
// [TV1 Hoàng] db.ts - kết nối MongoDB bằng Mongoose (đọc MONGO_URI trong .env)
//   server.ts gọi connectDB() trước khi mở cổng; seed.ts của Duy cũng dùng lại hàm này.
import mongoose from 'mongoose';

export default async function connectDB(): Promise<void> {
  const uri = process.env.MONGO_URI;
  if (!uri) throw new Error('Thiếu MONGO_URI trong file .env');

  await mongoose.connect(uri);
  console.log('Đã kết nối MongoDB');
}

@@@ server/src/controllers/authController.ts
// [TV1 Hoàng] authController.ts - Đăng ký / Đăng nhập, cấp JWT  (route: routes/authRoutes.ts)
//   TODO register: validateRegister() -> kiểm tra email trùng -> hash mật khẩu (bcryptjs) -> User.create -> ký JWT
//   TODO login   : tìm User (.select('+password')) -> so mật khẩu -> ký JWT
//   Ký JWT   : jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET as string, { expiresIn: '7d' })
//   Trả về   : { user, token }  (khớp type AuthResponse ở client/src/types/user.ts, KHÔNG trả password)
import type { Request, Response } from 'express';

export async function register(_req: Request, res: Response): Promise<void> {
  res.status(501).json({ message: 'TODO [Hoàng]: đăng ký' });
}

export async function login(_req: Request, res: Response): Promise<void> {
  res.status(501).json({ message: 'TODO [Hoàng]: đăng nhập' });
}

@@@ server/src/controllers/bookingController.ts
// [TV3 Kiên] bookingController.ts - Đặt sân  (route: routes/bookingRoutes.ts)
//   TODO: getBookedSlots, createBooking, cancelBooking, updateBookingStatus
//   createBooking cần:
//     1) validateBooking(req.body)                 (validators/bookingValidator.ts)
//     2) CHẶN TRÙNG GIỜ: tìm đơn cùng court + date, status khác 'cancelled', khoảng giờ giao nhau
//     3) tính totalPrice từ Court.pricePerHour, tạo Booking
//     4) gửi mail xác nhận bằng sendEmail() (utils/sendEmail.ts của Hoàng)
import type { Request, Response } from 'express';

export async function createBooking(_req: Request, res: Response): Promise<void> {
  res.status(501).json({ message: 'TODO [Kiên]: tạo đơn đặt sân' });
}

@@@ server/src/controllers/courtController.ts
// [TV2 Duy] courtController.ts - CRUD sân  (route: routes/courtRoutes.ts)
//   TODO: getCourts (Court.find), getCourtById, createCourt, updateCourt, deleteCourt
//         dùng validateCourt() trong validators/courtValidator.ts để kiểm tra dữ liệu.
import type { Request, Response } from 'express';

export async function getCourts(_req: Request, res: Response): Promise<void> {
  res.json([]); // TODO [Duy]: thay bằng await Court.find()
}

@@@ server/src/controllers/historyController.ts
// [TV4 Chuẩn] historyController.ts - Lịch sử + danh sách đơn có lọc, phân trang  (route: routes/historyRoutes.ts)
//   Đã gắn sẵn helper phân trang (utils/paginate.ts). Chuẩn thay phần TODO bằng truy vấn Booking thật.
import type { Request, Response } from 'express';
import { buildPageResult, getPageParams } from '../utils/paginate';

// Lịch sử của user đang đăng nhập
export async function getMyHistory(req: Request, res: Response): Promise<void> {
  const page = getPageParams(req.query);
  // TODO [Chuẩn]: Booking.find({ user: req.user?.id, ...lọc }).skip(page.skip).limit(page.limit) + countDocuments
  res.json(buildPageResult([], 0, page));
}

// Admin: tất cả đơn (populate court + user)
export async function getAllBookings(req: Request, res: Response): Promise<void> {
  const page = getPageParams(req.query);
  // TODO [Chuẩn]: như trên nhưng không lọc theo user
  res.json(buildPageResult([], 0, page));
}

@@@ server/src/controllers/statsController.ts
// [TV4 Chuẩn] statsController.ts - Thống kê doanh thu  (route: routes/statsRoutes.ts)
//   TODO: getRevenue - gom Booking đã confirmed theo ngày bằng Booking.aggregate([...])
//         trả về mảng { date, revenue, bookings } (khớp type RevenueStat ở client/src/types/stats.ts)
import type { Request, Response } from 'express';

export async function getRevenue(_req: Request, res: Response): Promise<void> {
  res.json([]);
}

@@@ server/src/controllers/userController.ts
// [TV1 Hoàng] userController.ts - Thông tin cá nhân, đổi mật khẩu  (route: routes/userRoutes.ts)
//   req.user do authMiddleware (protect) gắn vào, chỉ có id + role.
//   TODO: User.findById(req.user.id) để trả đủ thông tin; thêm đổi mật khẩu; (admin) danh sách user.
import type { Request, Response } from 'express';

export async function getProfile(req: Request, res: Response): Promise<void> {
  res.json(req.user);
}

@@@ server/src/middlewares/adminMiddleware.ts
// ============================================================
// [CHUNG - chỉ Hoàng sửa] adminMiddleware.ts - chỉ cho ADMIN đi qua
//   LUÔN đặt sau protect:  router.post('/', protect, adminOnly, handler)
//   Không phải admin -> trả 403
// ============================================================
import type { NextFunction, Request, Response } from 'express';

export function adminOnly(req: Request, res: Response, next: NextFunction): void {
  if (req.user?.role !== 'admin') {
    res.status(403).json({ message: 'Chỉ admin mới được phép' });
    return;
  }
  next();
}

@@@ server/src/middlewares/authMiddleware.ts
// ============================================================
// [CHUNG - chỉ Hoàng sửa] authMiddleware.ts - kiểm tra JWT ("đã đăng nhập chưa?")
//   Cách dùng ở route:  router.get('/me', protect, handler)
//   Client gửi header:  Authorization: Bearer <token>   (axiosClient.ts tự gắn)
//   Hợp lệ     -> gắn req.user = { id, role } rồi cho đi tiếp (next)
//   Sai / hết hạn -> trả 401
// ============================================================
import type { NextFunction, Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import type { JwtPayload } from 'jsonwebtoken';

export interface AuthPayload {
  id: string;
  role: 'user' | 'admin';
}

// Cho TypeScript biết req.user tồn tại
declare global {
  namespace Express {
    interface Request {
      user?: AuthPayload;
    }
  }
}

export function protect(req: Request, res: Response, next: NextFunction): void {
  const header = req.headers.authorization;
  if (!header || !header.startsWith('Bearer ')) {
    res.status(401).json({ message: 'Chưa đăng nhập' });
    return;
  }

  try {
    const token = header.split(' ')[1];
    const decoded = jwt.verify(token, process.env.JWT_SECRET as string) as JwtPayload;
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch {
    res.status(401).json({ message: 'Token không hợp lệ hoặc đã hết hạn' });
  }
}

@@@ server/src/middlewares/errorHandler.ts
// ============================================================
// [CHUNG - chỉ Hoàng sửa] errorHandler.ts - xử lý lỗi tập trung
//   notFound     : đường dẫn không có route nào khớp -> 404
//   errorHandler : lỗi bất ngờ trong controller -> 500 kèm message (phải có đủ 4 tham số)
//   Cả hai được gắn cuối cùng trong server.ts.
// ============================================================
import type { NextFunction, Request, Response } from 'express';

export function notFound(req: Request, res: Response): void {
  res.status(404).json({ message: 'Không tìm thấy ' + req.originalUrl });
}

export function errorHandler(err: Error, _req: Request, res: Response, _next: NextFunction): void {
  console.error(err);
  res.status(500).json({ message: err.message || 'Lỗi server' });
}

@@@ server/src/models/Booking.ts
// [TV3 Kiên] Booking.ts - Schema Mongoose: đơn đặt sân. Khớp client/src/types/booking.ts
//   Chuẩn (TV4) thống kê doanh thu dựa trên schema này (totalPrice, status, date) -> chốt sớm, đổi thì báo.
//   Chặn trùng giờ: kiểm tra trong bookingController (cùng court + date, khoảng giờ giao nhau, status khác cancelled).
import { Schema, model, Types } from 'mongoose';

export interface IBooking {
  court: Types.ObjectId;
  user: Types.ObjectId;
  date: string;      // 'YYYY-MM-DD'
  startTime: string; // 'HH:mm'
  endTime: string;   // 'HH:mm'
  totalPrice: number;
  status: 'pending' | 'confirmed' | 'cancelled';
}

const bookingSchema = new Schema<IBooking>(
  {
    court: { type: Schema.Types.ObjectId, ref: 'Court', required: true },
    user: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    date: { type: String, required: true },
    startTime: { type: String, required: true },
    endTime: { type: String, required: true },
    totalPrice: { type: Number, required: true, min: 0 },
    status: { type: String, enum: ['pending', 'confirmed', 'cancelled'], default: 'pending' },
  },
  { timestamps: true }
);

// Tăng tốc truy vấn "các đơn của 1 sân trong 1 ngày" (dùng khi kiểm tra trùng giờ)
bookingSchema.index({ court: 1, date: 1 });

export default model<IBooking>('Booking', bookingSchema);

@@@ server/src/models/Court.ts
// [TV2 Duy] Court.ts - Schema Mongoose: sân. Khớp client/src/types/court.ts
//   Thêm field mới (loại sân, ảnh, địa chỉ...)? Sửa cả type ở client và báo cả nhóm.
import { Schema, model } from 'mongoose';

export interface ICourt {
  name: string;
  pricePerHour: number;
  description?: string;
}

const courtSchema = new Schema<ICourt>(
  {
    name: { type: String, required: true, trim: true },
    pricePerHour: { type: Number, required: true, min: 0 },
    description: { type: String, default: '' },
  },
  { timestamps: true }
);

export default model<ICourt>('Court', courtSchema);

@@@ server/src/models/User.ts
// [TV1 Hoàng] User.ts - Schema Mongoose: người dùng. Khớp client/src/types/user.ts
//   password lưu dạng đã HASH (bcryptjs), không bao giờ lưu mật khẩu thô.
//   select: false -> mặc định không trả password ra; khi đăng nhập phải dùng .select('+password').
import { Schema, model } from 'mongoose';

export interface IUser {
  name: string;
  email: string;
  password: string;
  role: 'user' | 'admin';
}

const userSchema = new Schema<IUser>(
  {
    name: { type: String, required: true, trim: true },
    email: { type: String, required: true, unique: true, lowercase: true, trim: true },
    password: { type: String, required: true, select: false },
    role: { type: String, enum: ['user', 'admin'], default: 'user' },
  },
  { timestamps: true }
);

export default model<IUser>('User', userSchema);

@@@ server/src/routes/authRoutes.ts
// [TV1 Hoàng] authRoutes.ts - /api/auth   (đăng ký, đăng nhập: không cần token)
import { Router } from 'express';
import { login, register } from '../controllers/authController';

const router = Router();

router.post('/register', register);
router.post('/login', login);

export default router;

@@@ server/src/routes/bookingRoutes.ts
// [TV3 Kiên] bookingRoutes.ts - /api/bookings
//   Endpoint DỰ KIẾN (Kiên chốt với Chuẩn; client/src/api/bookingApi.ts gọi đúng các đường này):
//     GET   /api/bookings/court/:courtId?date=YYYY-MM-DD   các đơn đã đặt của sân trong ngày
//     POST  /api/bookings                                  tạo đơn (CHẶN TRÙNG GIỜ ở controller)
//     PATCH /api/bookings/:id/cancel                       hủy đơn
//     PATCH /api/bookings/:id/status                       admin đổi trạng thái (protect + adminOnly)
import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { createBooking } from '../controllers/bookingController';

const router = Router();

router.post('/', protect, createBooking);

export default router;

@@@ server/src/routes/courtRoutes.ts
// [TV2 Duy] courtRoutes.ts - /api/courts
//   Làm thật (thêm dần):
//     router.get('/:id', getCourtById);                   // ai cũng xem được
//     router.post('/', protect, adminOnly, createCourt);  // chỉ admin
//     router.put('/:id', protect, adminOnly, updateCourt);
//     router.delete('/:id', protect, adminOnly, deleteCourt);
//   protect   = phải đăng nhập  (middlewares/authMiddleware.ts)
//   adminOnly = phải là admin   (middlewares/adminMiddleware.ts)
import { Router } from 'express';
import { getCourts } from '../controllers/courtController';

const router = Router();

router.get('/', getCourts);

export default router;

@@@ server/src/routes/historyRoutes.ts
// [TV4 Chuẩn] historyRoutes.ts - /api/history
//   GET /api/history      lịch sử của user đang đăng nhập
//   GET /api/history/all  tất cả đơn (chỉ admin)
import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { adminOnly } from '../middlewares/adminMiddleware';
import { getAllBookings, getMyHistory } from '../controllers/historyController';

const router = Router();

router.get('/', protect, getMyHistory);
router.get('/all', protect, adminOnly, getAllBookings);

export default router;

@@@ server/src/routes/statsRoutes.ts
// [TV4 Chuẩn] statsRoutes.ts - /api/stats   (chỉ admin)
import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { adminOnly } from '../middlewares/adminMiddleware';
import { getRevenue } from '../controllers/statsController';

const router = Router();

router.get('/revenue', protect, adminOnly, getRevenue);

export default router;

@@@ server/src/routes/userRoutes.ts
// [TV1 Hoàng] userRoutes.ts - /api/users   (cần đăng nhập)
import { Router } from 'express';
import { protect } from '../middlewares/authMiddleware';
import { getProfile } from '../controllers/userController';

const router = Router();

router.get('/me', protect, getProfile);

export default router;

@@@ server/src/seed/seed.ts
// [TV2 Duy] seed.ts - tạo dữ liệu mẫu (sân, tài khoản admin...) để cả nhóm có dữ liệu test
//   Chạy:  npm run seed   (trong thư mục server)
//   TODO : xóa dữ liệu cũ -> Court.insertMany([...]) -> tạo 1 user admin (mật khẩu phải HASH giống lúc đăng ký)
//   Làm sớm và báo cả nhóm để Kiên và Chuẩn có dữ liệu test.
import 'dotenv/config';
import mongoose from 'mongoose';
import connectDB from '../config/db';

async function seed(): Promise<void> {
  await connectDB();
  console.log('TODO [Duy]: thêm dữ liệu mẫu ở đây');
  await mongoose.disconnect();
}

seed().catch((err) => {
  console.error(err);
  process.exit(1);
});

@@@ server/src/server.ts
// ============================================================
// [CHUNG - chỉ Hoàng sửa] server.ts - ĐIỂM VÀO của Node.js
//   Chạy:  npm run dev  (trong thư mục server)
//   Làm gì: đọc .env -> bật cors + đọc JSON -> gắn các route -> kết nối MongoDB -> mở cổng.
//   Thêm route mới? Thêm import + 1 dòng app.use(...) ở khối "GẮN ROUTE" bên dưới.
// ============================================================
import 'dotenv/config'; // phải nằm đầu tiên để các file sau đọc được process.env
import express from 'express';
import cors from 'cors';
import connectDB from './config/db';
import { errorHandler, notFound } from './middlewares/errorHandler';

import authRoutes from './routes/authRoutes';       // [TV1 Hoàng]
import userRoutes from './routes/userRoutes';       // [TV1 Hoàng]
import courtRoutes from './routes/courtRoutes';     // [TV2 Duy]
import bookingRoutes from './routes/bookingRoutes'; // [TV3 Kiên]
import historyRoutes from './routes/historyRoutes'; // [TV4 Chuẩn]
import statsRoutes from './routes/statsRoutes';     // [TV4 Chuẩn]

const app = express();

app.use(cors({ origin: process.env.CLIENT_URL ?? 'http://localhost:5173' }));
app.use(express.json());

// Kiểm tra server sống: http://localhost:5000/api/health
app.get('/api/health', (_req, res) => {
  res.json({ ok: true, time: new Date().toISOString() });
});

// ---- GẮN ROUTE ----
app.use('/api/auth', authRoutes);
app.use('/api/users', userRoutes);
app.use('/api/courts', courtRoutes);
app.use('/api/bookings', bookingRoutes);
app.use('/api/history', historyRoutes);
app.use('/api/stats', statsRoutes);

// Hai middleware này LUÔN nằm cuối cùng
app.use(notFound);
app.use(errorHandler);

const PORT = Number(process.env.PORT) || 5000;

connectDB()
  .then(() => {
    app.listen(PORT, () => console.log('Server chạy tại http://localhost:' + PORT));
  })
  .catch((err) => {
    console.error('Không kết nối được MongoDB:', err);
    process.exit(1);
  });

@@@ server/src/utils/paginate.ts
// [TV4 Chuẩn] paginate.ts - helper phân trang, CẢ NHÓM dùng chung (sân, đơn, lịch sử...)
//   Dùng trong controller:
//     const page  = getPageParams(req.query);                      // đọc ?page=2&limit=10
//     const items = await Booking.find(filter).skip(page.skip).limit(page.limit);
//     const total = await Booking.countDocuments(filter);
//     res.json(buildPageResult(items, total, page));
//   Kết quả khớp type PaginatedResponse<T> ở client/src/types/stats.ts
export interface PageParams {
  page: number;
  limit: number;
  skip: number;
}

export interface PageResult<T> {
  items: T[];
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export function getPageParams(query: { page?: unknown; limit?: unknown }): PageParams {
  const page = Math.max(Number(query.page) || 1, 1);
  const limit = Math.min(Math.max(Number(query.limit) || 10, 1), 100);
  return { page, limit, skip: (page - 1) * limit };
}

export function buildPageResult<T>(items: T[], total: number, p: PageParams): PageResult<T> {
  return { items, total, page: p.page, limit: p.limit, totalPages: Math.ceil(total / p.limit) };
}

@@@ server/src/utils/sendEmail.ts
// [TV1 Hoàng] sendEmail.ts - gửi mail bằng Nodemailer
//   Kiên (TV3) gọi sau khi đặt sân thành công:
//     await sendEmail(userEmail, 'Đặt sân thành công', '<p>Bạn đã đặt sân ...</p>');
//   Cần EMAIL_USER, EMAIL_PASS trong .env (Gmail: dùng "Mật khẩu ứng dụng", không dùng mật khẩu thường).
import nodemailer from 'nodemailer';

export async function sendEmail(to: string, subject: string, html: string): Promise<void> {
  const user = process.env.EMAIL_USER ?? '';
  const pass = process.env.EMAIL_PASS ?? '';

  const transporter = nodemailer.createTransport({
    service: 'gmail',
    auth: { user, pass },
  });

  await transporter.sendMail({ from: '"Đặt sân" <' + user + '>', to, subject, html });
}

@@@ server/src/validators/authValidator.ts
// [TV1 Hoàng] authValidator.ts - kiểm tra dữ liệu đăng ký / đăng nhập trước khi xử lý
//   Mẫu chung của cả nhóm: trả về CHUỖI LỖI, hoặc null nếu hợp lệ.
//   Dùng trong controller:
//     const error = validateRegister(req.body);
//     if (error) { res.status(400).json({ message: error }); return; }
export function validateRegister(body: { name?: string; email?: string; password?: string }): string | null {
  if (!body.name || !body.email || !body.password) return 'Thiếu tên, email hoặc mật khẩu';
  if (body.password.length < 6) return 'Mật khẩu tối thiểu 6 ký tự';
  return null;
}

@@@ server/src/validators/bookingValidator.ts
// [TV3 Kiên] bookingValidator.ts - kiểm tra dữ liệu tạo đơn đặt sân (cùng mẫu với authValidator.ts)
export function validateBooking(body: { court?: string; date?: string; startTime?: string; endTime?: string }): string | null {
  if (!body.court || !body.date || !body.startTime || !body.endTime) return 'Thiếu sân, ngày hoặc giờ';
  // Giờ dạng 'HH:mm' (có số 0 đứng đầu) nên so sánh chuỗi là đúng
  if (body.startTime >= body.endTime) return 'Giờ bắt đầu phải nhỏ hơn giờ kết thúc';
  return null;
}

@@@ server/src/validators/courtValidator.ts
// [TV2 Duy] courtValidator.ts - kiểm tra dữ liệu thêm / sửa sân (cùng mẫu với authValidator.ts)
export function validateCourt(body: { name?: string; pricePerHour?: number }): string | null {
  if (!body.name) return 'Thiếu tên sân';
  if (typeof body.pricePerHour !== 'number' || body.pricePerHour <= 0) return 'Giá mỗi giờ phải là số lớn hơn 0';
  return null;
}

@@@ server/tsconfig.json
{
  // [TV1 Hoàng] tsconfig.json - cấu hình TypeScript cho server
  //   Code viết trong src/. npm run dev chạy thẳng bằng tsx.
  //   npm run build biên dịch ra dist/, npm start chạy bản đã build.
  "compilerOptions": {
    "target": "ES2022",
    "module": "nodenext",
    "rootDir": "src",
    "outDir": "dist",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "types": ["node"]
  },
  "include": ["src"]
}

`;

main();
