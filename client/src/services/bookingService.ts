import axios from 'axios';
import type { MonTrongGio } from '../types/booking.types';

const DIA_CHI_API = 'http://localhost:5000/api/bookings';

export const dichVuDatSan = {
  // Gọi API lấy danh sách giờ đã đặt của sân trong ngày
  layGioDaDat: async (maSan: string, ngayDat: string) => {
    const phanHoi = await axios.get(`${DIA_CHI_API}/gio-da-dat`, {
      params: { maSan, ngayDat },
    });
    return phanHoi.data as { gioBatDau: string; gioKetThuc: string }[];
  },

  // Gọi API gửi giỏ hàng lên server để lưu
  guiDonDatSan: async (danhSachGio: MonTrongGio[]) => {
    const token = localStorage.getItem('token');
    const phanHoi = await axios.post(
      DIA_CHI_API,
      { danhSachGio },
      {
        headers: token ? { Authorization: `Bearer ${token}` } : {},
      }
    );
    return phanHoi.data;
  },
};