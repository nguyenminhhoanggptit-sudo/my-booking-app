import React, { useState } from 'react';
import { BO_LOC_MAC_DINH, type BoLocLichSu } from '../../types/history.types';
import './SearchFilterBar.css';

interface ThuocTinhThanhLoc {
  boLoc: BoLocLichSu;
  khiLoc: (boLocMoi: BoLocLichSu) => void;
}

export const SearchFilterBar: React.FC<ThuocTinhThanhLoc> = ({ boLoc, khiLoc }) => {
  const [dangNhap, setDangNhap] = useState<BoLocLichSu>(boLoc);

  const xuLyXoaLoc = () => {
    setDangNhap(BO_LOC_MAC_DINH);
    khiLoc(BO_LOC_MAC_DINH);
  };

  return (
    <div className="thanh-loc">
      <div className="o-loc o-loc-rong">
        <label>Tìm theo tên sân:</label>
        <input
          type="text"
          placeholder="Ví dụ: Cầu Lông..."
          value={dangNhap.tuKhoa}
          onChange={(e) => setDangNhap({ ...dangNhap, tuKhoa: e.target.value })}
          onKeyDown={(e) => e.key === 'Enter' && khiLoc(dangNhap)}
        />
      </div>

      <div className="o-loc">
        <label>Trạng thái:</label>
        <select
          value={dangNhap.trangThai}
          onChange={(e) =>
            setDangNhap({ ...dangNhap, trangThai: e.target.value as BoLocLichSu['trangThai'] })
          }
        >
          <option value="tat-ca">Tất cả</option>
          <option value="da_xac_nhan">Đã xác nhận</option>
          <option value="da_huy">Đã hủy</option>
        </select>
      </div>

      <button type="button" className="nut-loc" onClick={() => khiLoc(dangNhap)}>
        Lọc
      </button>
      <button type="button" className="nut-xoa-loc" onClick={xuLyXoaLoc}>
        Xóa lọc
      </button>
    </div>
  );
};