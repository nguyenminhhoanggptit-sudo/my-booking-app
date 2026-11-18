import React, { useState, useEffect } from 'react';
import { useDispatch, useSelector } from 'react-redux';
import type { RootState } from '../../store/store';
import { themVaoGio, xoaKhoiGio, xoaSachGio } from '../../store/bookingSlice';
import type { KhungGio } from '../../types/booking.types';
import { layGioDaDat, guiDonDatSan } from '../../services/bookingService';
import TimeSlotPicker from '../../components/TimeSlotPicker/TimeSlotPicker';
import './Booking.css';

// Danh sách sân bóng đá mẫu (đã đồng bộ theo đề tài sân bóng đá)
const danhSachSan = [
  { id: 'san-1', ten: 'Sân Bóng Đá Mini 1 (5 người)' },
  { id: 'san-2', ten: 'Sân Bóng Đá Mini 2 (7 người)' },
  { id: 'san-3', ten: 'Sân Bóng Đá Mini 3 (5 người)' },
];

// Danh sách khung giờ mẫu trong ngày
const khungGioMau: KhungGio[] = [
  { id: 'ca-1', gioBatDau: '07:00', gioKetThuc: '08:30', giaTien: 300000 },
  { id: 'ca-2', gioBatDau: '08:30', gioKetThuc: '10:00', giaTien: 300000 },
  { id: 'ca-3', gioBatDau: '16:00', gioKetThuc: '17:30', giaTien: 400000 },
  { id: 'ca-4', gioBatDau: '17:30', gioKetThuc: '19:00', giaTien: 500000 },
  { id: 'ca-5', gioBatDau: '19:00', gioKetThuc: '20:30', giaTien: 500000 },
  { id: 'ca-6', gioBatDau: '20:30', gioKetThuc: '22:00', giaTien: 400000 },
];

const Booking: React.FC = () => {
  const dispatch = useDispatch();
  const gioHang = useSelector((state: RootState) => state.booking.gioHang);

  const homNay = new Date().toISOString().split('T')[0];

  const [sanDangChon, setSanDangChon] = useState(danhSachSan[0]);
  const [ngayDat, setNgayDat] = useState<string>(homNay);
  const [gioDaDat, setGioDaDat] = useState<string[]>([]);
  const [dangTaiLich, setDangTaiLich] = useState<boolean>(false);
  const [dangGuiDon, setDangGuiDon] = useState<boolean>(false);
  const [thongBao, setThongBao] = useState<{ loai: 'thanh_cong' | 'loi'; noiDung: string } | null>(null);

  useEffect(() => {
    const taiGioDaDat = async () => {
      setDangTaiLich(true);
      try {
        const duLieu = await layGioDaDat(sanDangChon.id, ngayDat);
        const danhSachGioBan = duLieu.map((item: { gioBatDau: string }) => item.gioBatDau);
        setGioDaDat(danhSachGioBan);
      } catch (loi) {
        console.error('Lỗi khi tải lịch sân:', loi);
        setGioDaDat([]);
      } finally {
        setDangTaiLich(false);
      }
    };

    taiGioDaDat();
  }, [sanDangChon, ngayDat]);

  const maGioDangChon = gioHang
    .filter((item) => item.maSan === sanDangChon.id && item.ngayDat === ngayDat)
    .map((item) => item.gioBatDau);

  const xuLyChonGio = (khungGio: KhungGio) => {
    setThongBao(null);
    const idMon = `${sanDangChon.id}_${ngayDat}_${khungGio.gioBatDau}`;
    const daCoTrongGio = gioHang.some((item) => item.id === idMon);

    if (daCoTrongGio) {
      dispatch(xoaKhoiGio(idMon));
    } else {
      dispatch(
        themVaoGio({
          id: idMon,
          maSan: sanDangChon.id,
          tenSan: sanDangChon.ten,
          ngayDat,
          gioBatDau: khungGio.gioBatDau,
          gioKetThuc: khungGio.gioKetThuc,
          giaTien: khungGio.giaTien,
        })
      );
    }
  };

  const tongTien = gioHang.reduce((tong, item) => tong + item.giaTien, 0);

  const xuLyDatSan = async () => {
    if (gioHang.length === 0) {
      setThongBao({ loai: 'loi', noiDung: 'Vui lòng chọn ít nhất 1 khung giờ trước khi đặt.' });
      return;
    }

    setDangGuiDon(true);
    setThongBao(null);

    try {
      const ketQua = await guiDonDatSan(gioHang);
      setThongBao({
        loai: 'thanh_cong',
        noiDung: ketQua.thongBao || 'Đặt sân thành công!',
      });
      dispatch(xoaSachGio());

      const duLieuMoi = await layGioDaDat(sanDangChon.id, ngayDat);
      setGioDaDat(duLieuMoi.map((item: { gioBatDau: string }) => item.gioBatDau));
    } catch (loi: unknown) {
      const loiAxios = loi as { response?: { data?: { thongBao?: string } } };
      const loiServer = loiAxios.response?.data?.thongBao || 'Không thể đặt sân, vui lòng thử lại.';
      setThongBao({ loai: 'loi', noiDung: loiServer });
    } finally {
      setDangGuiDon(false);
    }
  };

  return (
    <div className="booking-container">
      <header className="booking-header">
        <h1>Đặt Lịch Sân Bóng</h1>
        <p>Chọn sân, ngày thi đấu và khung giờ còn trống</p>
      </header>

      <div className="booking-layout">
        <section className="booking-left">
          <div className="filter-group">
            <div className="form-field">
              <label htmlFor="chon-san">Chọn sân</label>
              <select
                id="chon-san"
                value={sanDangChon.id}
                onChange={(e) => {
                  const sanTimThay = danhSachSan.find((s) => s.id === e.target.value);
                  if (sanTimThay) setSanDangChon(sanTimThay);
                }}
              >
                {danhSachSan.map((san) => (
                  <option key={san.id} value={san.id}>
                    {san.ten}
                  </option>
                ))}
              </select>
            </div>

            <div className="form-field">
              <label htmlFor="chon-ngay">Chọn ngày</label>
              <input
                id="chon-ngay"
                type="date"
                min={homNay}
                value={ngayDat}
                onChange={(e) => setNgayDat(e.target.value)}
              />
            </div>
          </div>

          <div className="slots-section">
            <div className="slots-header">
              <h2>Khung giờ ngày {ngayDat}</h2>
              <div className="legend">
                <span><i className="dot dot-trong"></i> Trống</span>
                <span><i className="dot dot-chon"></i> Đang chọn</span>
                <span><i className="dot dot-ban"></i> Đã đặt</span>
              </div>
            </div>

            {dangTaiLich ? (
              <p className="loading-text">Đang tải lịch sân...</p>
            ) : (
              <TimeSlotPicker
                danhSachKhungGio={khungGioMau}
                gioDaDat={gioDaDat}
                maGioDangChon={maGioDangChon}
                khiBamChonGio={xuLyChonGio}
              />
            )}
          </div>
        </section>

        <aside className="booking-right">
          <h2>Giỏ Đặt Sân ({gioHang.length})</h2>

          {gioHang.length === 0 ? (
            <p className="empty-cart">Chưa có khung giờ nào được chọn.</p>
          ) : (
            <ul className="cart-list">
              {gioHang.map((item) => (
                <li key={item.id} className="cart-item">
                  <div className="cart-item-info">
                    <strong>{item.tenSan}</strong>
                    <span>
                      {item.ngayDat} | {item.gioBatDau} - {item.gioKetThuc}
                    </span>
                    <span className="cart-item-price">
                      {item.giaTien.toLocaleString('vi-VN')} đ
                    </span>
                  </div>
                  <button
                    type="button"
                    className="btn-remove"
                    onClick={() => dispatch(xoaKhoiGio(item.id))}
                    title="Xóa khung giờ này"
                  >
                    Xóa
                  </button>
                </li>
              ))}
            </ul>
          )}

          <div className="cart-footer">
            <div className="total-row">
              <span>Tổng cộng</span>
              <strong>{tongTien.toLocaleString('vi-VN')} đ</strong>
            </div>

            {thongBao && (
              <div className={`alert-box ${thongBao.loai === 'thanh_cong' ? 'alert-success' : 'alert-error'}`}>
                {thongBao.noiDung}
              </div>
            )}

            <button
              type="button"
              className="btn-confirm"
              disabled={dangGuiDon || gioHang.length === 0}
              onClick={xuLyDatSan}
            >
              {dangGuiDon ? 'Đang xử lý...' : 'Xác Nhận Đặt Sân'}
            </button>
          </div>
        </aside>
      </div>
    </div>
  );
};

export default Booking;