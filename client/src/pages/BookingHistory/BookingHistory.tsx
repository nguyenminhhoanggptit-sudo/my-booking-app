/* eslint-disable */
import React, { useEffect, useState } from 'react';
import { SearchFilterBar } from '../../components/SearchFilterBar/SearchFilterBar';
import { Pagination } from '../../components/Pagination/Pagination';
import { dichVuLichSu } from '../../services/historyService';
import {
  BO_LOC_MAC_DINH,
  type BoLocLichSu,
  type DonDatSan,
  type ThongTinPhanTrang,
} from '../../types/history.types';
import './BookingHistory.css';

const SO_DON_MOI_TRANG = 5;

// Đổi "2026-11-20" thành "20/11/2026"
const dinhDangNgay = (ngay: string) => {
  const [nam, thang, ngayTrongThang] = ngay.split('-');
  return `${ngayTrongThang}/${thang}/${nam}`;
};

export const BookingHistory: React.FC = () => {
  const [boLoc, setBoLoc] = useState<BoLocLichSu>(BO_LOC_MAC_DINH);
  const [trang, setTrang] = useState(1);
  const [danhSachDon, setDanhSachDon] = useState<DonDatSan[]>([]);
  const [phanTrang, setPhanTrang] = useState<ThongTinPhanTrang>({
    trangHienTai: 1,
    tongSoDon: 0,
    tongSoTrang: 1,
  });
  const [dangTai, setDangTai] = useState(false);
  const [loi, setLoi] = useState('');

  // Tải lịch sử mỗi khi đổi bộ lọc hoặc đổi trang
  const taiLichSu = async () => {
    setDangTai(true);
    setLoi('');
    try {
      const ketQua = await dichVuLichSu.layLichSu(boLoc, trang, SO_DON_MOI_TRANG);
      setDanhSachDon(ketQua.duLieu);
      setPhanTrang(ketQua.phanTrang);
    } catch {
      setDanhSachDon([]);
      setLoi('Không tải được lịch sử đặt sân!');
    } finally {
      setDangTai(false);
    }
  };

  useEffect(() => {
    taiLichSu();
  }, [boLoc, trang]);

  // Bấm Lọc: áp dụng bộ lọc mới và quay về trang 1
  const xuLyDoiBoLoc = (boLocMoi: BoLocLichSu) => {
    setBoLoc(boLocMoi);
    setTrang(1);
  };

  return (
    <div className="trang-lich-su">
      <div className="khung-lich-su">
        <h2>Lịch Sử Đặt Sân</h2>

        <SearchFilterBar boLoc={boLoc} khiLoc={xuLyDoiBoLoc} />

        {loi && <div className="hop-loi-ls">{loi}</div>}

        {dangTai ? (
          <p className="chu-phu">Đang tải dữ liệu...</p>
        ) : danhSachDon.length === 0 ? (
          <p className="chu-phu">Không có đơn đặt sân nào phù hợp.</p>
        ) : (
          <div className="boc-bang">
            <table className="bang-lich-su">
              <thead>
                <tr>
                  <th>Ngày</th>
                  <th>Khung giờ</th>
                  <th>Sân</th>
                  <th>Giá tiền</th>
                  <th>Trạng thái</th>
                </tr>
              </thead>
              <tbody>
                {danhSachDon.map((don) => (
                  <tr key={don._id}>
                    <td>{dinhDangNgay(don.ngayDat)}</td>
                    <td>
                      {don.gioBatDau} - {don.gioKetThuc}
                    </td>
                    <td>{don.tenSan}</td>
                    <td className="o-gia-tien">{don.giaTien.toLocaleString('vi-VN')} đ</td>
                    <td>
                      <span
                        className={`huy-hieu ${
                          don.trangThai === 'da_huy' ? 'huy-hieu-huy' : 'huy-hieu-xac-nhan'
                        }`}
                      >
                        {don.trangThai === 'da_huy' ? 'Đã hủy' : 'Đã xác nhận'}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}

        <Pagination
          trangHienTai={phanTrang.trangHienTai}
          tongSoTrang={phanTrang.tongSoTrang}
          khiDoiTrang={setTrang}
        />
      </div>
    </div>
  );
};

export default BookingHistory;