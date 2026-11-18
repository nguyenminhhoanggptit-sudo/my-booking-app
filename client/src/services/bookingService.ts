import axios from 'axios';
import type { MonTrongGio } from '../types/booking.types';

const API_URL = 'http://localhost:5000/api/bookings';

// Lấy danh sách khung giờ đã đặt của một sân theo ngày
export const layGioDaDat = async (maSan: string, ngayDat: string) => {
  const phanHoi = await axios.get(`${API_URL}/gio-da-dat`, {
    params: { maSan, ngayDat },
  });
  return phanHoi.data;
};

// Gửi toàn bộ giỏ hàng lên Backend để chốt đơn đặt sân
export const guiDonDatSan = async (danhSachGio: MonTrongGio[]) => {
  const token = localStorage.getItem('token');
  const cauHinh = token
    ? { headers: { Authorization: `Bearer ${token}` } }
    : {};

  const phanHoi = await axios.post(API_URL, { danhSachGio }, cauHinh);
  return phanHoi.data;
};