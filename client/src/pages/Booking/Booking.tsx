/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { themVaoGio, xoaKhoiGio, xoaSachGio } from '../../store/bookingSlice';
import { TimeSlotPicker } from '../../components/TimeSlotPicker/TimeSlotPicker';
import { dichVuDatSan } from '../../services/bookingService';
import type { KhungGio } from '../../types/booking.types';
import './Booking.css';

// Danh sách sân mẫu
const danhSachSan = [
  { id: 'san-1', ten: 'Sân Bóng Đá Mini 1 (5 người)' },
  { id: 'san-2', ten: 'Sân Bóng Đá Mini 2 (7 người)' },
  { id: 'san-3', ten: 'Sân Cầu Lông VIP A' },
];

// Các ca đá cố định trong ngày
const cacCaCoDinh: KhungGio[] = [
  { id: '1', gioBatDau: '07:00', gioKetThuc: '08:30', giaTien: 250000 },
  { id: '2', gioBatDau: '08:30', gioKetThuc: '10:00', giaTien: 250000 },
  { id: '3', gioBatDau: '15:30', gioKetThuc: '17:00', giaTien: 300000 },
  { id: '4', gioBatDau: '17:00', gioKetThuc: '18:30', giaTien: 400000 },
  { id: '5', gioBatDau: '18:30', gioKetThuc: '20:00', giaTien: 450000 },
  { id: '6', gioBatDau: '20:00', gioKetThuc: '21:30', giaTien: 400000 },
];

export const Booking: React.FC = () => {
  const dispatch = useDispatch();
  const gioHang = useSelector((state: RootState) => state.booking.gioHang);

  const homNay = new Date().toISOString().split('T')[0];
  const [maSanChon, setMaSanChon] = useState(danhSachSan[0].id);
  const [ngayChon, setNgayChon] = useState(homNay);
  const [gioDaDat, setGioDaDat] = useState<string[]>([]);
  const [dangGui, setDangGui] = useState(false);
  const [thongBao, setThongBao] = useState<{ loai: 'thanh-cong' | 'that-bai'; noiDung: string } | null>(null);

  const sanHienTai = danhSachSan.find((s) => s.id === maSanChon) || danhSachSan[0];

  // Tải danh sách giờ đã có người đặt mỗi khi đổi sân hoặc đổi ngày
  const taiGioDaDat = async () => {
    try {
      const duLieu = await dichVuDatSan.layGioDaDat(maSanChon, ngayChon);
      setGioDaDat(duLieu.map((item) => item.gioBatDau));
    } catch {
      setGioDaDat([]);
    }
  };

  useEffect(() => {
    taiGioDaDat();
  }, [maSanChon, ngayChon]);

  // Bấm vào ô giờ: nếu chưa có trong giỏ thì thêm, có rồi thì bỏ chọn
  const xuLyChonGio = (gio: KhungGio) => {
    const maDinhDanh = `${maSanChon}_${ngayChon}_${gio.gioBatDau}`;
    const daTrongGio = gioHang.some((mon) => mon.id === maDinhDanh);

    if (daTrongGio) {
      dispatch(xoaKhoiGio(maDinhDanh));
    } else {
      dispatch(
        themVaoGio({
          id: maDinhDanh,
          maSan: maSanChon,
          tenSan: sanHienTai.ten,
          ngayDat: ngayChon,
          gioBatDau: gio.gioBatDau,
          gioKetThuc: gio.gioKetThuc,
          giaTien: gio.giaTien,
        })
      );
    }
  };

  // Bấm nút Xác Nhận Đặt Sân
  const xuLyDatSan = async () => {
    if (gioHang.length === 0) return;
    setDangGui(true);
    setThongBao(null);

    try {
      const ketQua = await dichVuDatSan.guiDonDatSan(gioHang);
      setThongBao({ loai: 'thanh-cong', noiDung: ketQua.thongBao || 'Đặt sân thành công!' });
      dispatch(xoaSachGio());
      taiGioDaDat();
    } catch (loi: unknown) {
      const err = loi as { response?: { data?: { thongBao?: string } } };
      const loiNhan = err.response?.data?.thongBao || 'Có lỗi xảy ra khi đặt sân!';
      setThongBao({ loai: 'that-bai', noiDung: loiNhan });
    } finally {
      setDangGui(false);
    }
  };

  const tongTien = gioHang.reduce((tong, mon) => tong + mon.giaTien, 0);

  return (
    <div className="trang-dat-san">
      {/* Cột trái: Chọn sân, ngày và giờ */}
      <div className="khung-noi-dung">
        <h2>Đặt Lịch Sân Thể Thao</h2>

        <div className="hang-bo-loc">
          <div className="nhom-nhap">
            <label>Chọn sân:</label>
            <select value={maSanChon} onChange={(e) => setMaSanChon(e.target.value)}>
              {danhSachSan.map((san) => (
                <option key={san.id} value={san.id}>
                  {san.ten}
                </option>
              ))}
            </select>
          </div>

          <div className="nhom-nhap">
            <label>Chọn ngày:</label>
            <input
              type="date"
              min={homNay}
              value={ngayChon}
              onChange={(e) => setNgayChon(e.target.value)}
            />
          </div>
        </div>

        <p>
          <strong>Chọn khung giờ trống:</strong>
        </p>
        <TimeSlotPicker
          danhSachGio={cacCaCoDinh}
          gioDaDat={gioDaDat}
          maGioDangChon={gioHang.map((mon) => mon.id)}
          maSan={maSanChon}
          ngayDat={ngayChon}
          khiBamChonGio={xuLyChonGio}
        />
      </div>

      {/* Cột phải: Giỏ đặt sân */}
      <div className="khung-noi-dung">
        <h3>Giỏ Đặt Sân ({gioHang.length})</h3>

        {thongBao && (
          <div className={`hop-thong-bao ${thongBao.loai}`}>
            {thongBao.noiDung}
          </div>
        )}

        {gioHang.length === 0 ? (
          <p style={{ color: '#6b7280' }}>Bạn chưa chọn khung giờ nào.</p>
        ) : (
          <div>
            {gioHang.map((mon) => (
              <div key={mon.id} className="dong-gio-hang">
                <div>
                  <strong>{mon.tenSan}</strong>
                  <div style={{ fontSize: '13px', color: '#4b5563' }}>
                    Ngày: {mon.ngayDat} | {mon.gioBatDau} - {mon.gioKetThuc}
                  </div>
                  <div style={{ color: '#16a34a', fontWeight: 'bold' }}>
                    {mon.giaTien.toLocaleString('vi-VN')} đ
                  </div>
                </div>
                <button
                  type="button"
                  className="nut-xoa"
                  onClick={() => dispatch(xoaKhoiGio(mon.id))}
                >
                  Xóa
                </button>
              </div>
            ))}

            <div style={{ marginTop: '16px', fontSize: '18px', fontWeight: 'bold' }}>
              Tổng tiền: {tongTien.toLocaleString('vi-VN')} đ
            </div>

            <button
              type="button"
              className="nut-xac-nhan"
              disabled={dangGui}
              onClick={xuLyDatSan}
            >
              {dangGui ? 'Đang xử lý...' : 'Xác Nhận Đặt Sân'}
            </button>
          </div>
        )}
      </div>
    </div>
  );
};

export default Booking;