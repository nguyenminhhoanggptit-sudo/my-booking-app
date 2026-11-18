import axios from 'axios';
import type { BoLocLichSu, KetQuaLichSu } from '../types/history.types';

const DIA_CHI_API = 'http://localhost:5000/api/stats';

export const dichVuLichSu = {
  // Gọi API lấy lịch sử đặt sân (có tìm kiếm, lọc và phân trang)
  layLichSu: async (boLoc: BoLocLichSu, trang: number, soLuong: number) => {
    const token = localStorage.getItem('token');
    const phanHoi = await axios.get(`${DIA_CHI_API}/lich-su`, {
      params: {
        trang,
        soLuong,
        tuKhoa: boLoc.tuKhoa.trim() || undefined,
        trangThai: boLoc.trangThai === 'tat-ca' ? undefined : boLoc.trangThai,
      },
      headers: token ? { Authorization: `Bearer ${token}` } : {},
    });
    return phanHoi.data as KetQuaLichSu;
  },
};