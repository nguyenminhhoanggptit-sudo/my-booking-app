// Kiểu dữ liệu cho 1 khung giờ mẫu
export interface KhungGio {
  id: string;
  gioBatDau: string;
  gioKetThuc: string;
  giaTien: number;
}

// Kiểu dữ liệu cho 1 ca đặt nằm trong giỏ hàng
export interface MonTrongGio {
  id: string; // Mã duy nhất: "san-1_2026-11-20_17:00"
  maSan: string;
  tenSan: string;
  ngayDat: string;
  gioBatDau: string;
  gioKetThuc: string;
  giaTien: number;
}