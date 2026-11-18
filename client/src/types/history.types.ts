// 1 đơn đặt sân (khớp với model Booking trong bookingController của Kiên)
export interface DonDatSan {
  _id: string;
  maSan: string;
  tenSan: string;
  ngayDat: string;     // "2026-11-20"
  gioBatDau: string;   // "17:00"
  gioKetThuc: string;  // "18:30"
  giaTien: number;
  trangThai: 'da_xac_nhan' | 'da_huy';
}

// Điều kiện tìm kiếm và lọc
export interface BoLocLichSu {
  tuKhoa: string;                                // tìm theo tên sân
  trangThai: 'tat-ca' | 'da_xac_nhan' | 'da_huy';
}

export const BO_LOC_MAC_DINH: BoLocLichSu = { tuKhoa: '', trangThai: 'tat-ca' };

export interface ThongTinPhanTrang {
  trangHienTai: number;
  tongSoDon: number;
  tongSoTrang: number;
}

export interface KetQuaLichSu {
  duLieu: DonDatSan[];
  phanTrang: ThongTinPhanTrang;
}
