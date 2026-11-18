import { createSlice, type PayloadAction } from '@reduxjs/toolkit';
import type { MonTrongGio } from '../types/booking.types';

interface TrangThaiDatSan {
  gioHang: MonTrongGio[];
}

const trangThaiBanDau: TrangThaiDatSan = {
  gioHang: [],
};

const bookingSlice = createSlice({
  name: 'booking',
  initialState: trangThaiBanDau,
  reducers: {
    // Thêm 1 khung giờ vào giỏ
    themVaoGio: (state, action: PayloadAction<MonTrongGio>) => {
      const daCo = state.gioHang.some((mon) => mon.id === action.payload.id);
      if (!daCo) {
        state.gioHang.push(action.payload);
      }
    },
    // Xóa 1 khung giờ khỏi giỏ
    xoaKhoiGio: (state, action: PayloadAction<string>) => {
      state.gioHang = state.gioHang.filter((mon) => mon.id !== action.payload);
    },
    // Xóa sạch giỏ sau khi đặt thành công
    xoaSachGio: (state) => {
      state.gioHang = [];
    },
  },
});

export const { themVaoGio, xoaKhoiGio, xoaSachGio } = bookingSlice.actions;
export default bookingSlice.reducer;