import React from 'react';
import './Pagination.css';

interface ThuocTinhPhanTrang {
  trangHienTai: number;
  tongSoTrang: number;
  khiDoiTrang: (trang: number) => void;
}

// Tạo danh sách số trang cần hiện, ví dụ: 1 ... 4 5 6 ... 10
const taoDanhSachTrang = (hienTai: number, tong: number): (number | '...')[] => {
  const cacTrang = new Set<number>([1, tong, hienTai - 1, hienTai, hienTai + 1]);
  const hopLe = [...cacTrang].filter((t) => t >= 1 && t <= tong).sort((a, b) => a - b);

  const ketQua: (number | '...')[] = [];
  hopLe.forEach((trang, viTri) => {
    if (viTri > 0 && trang - hopLe[viTri - 1] > 1) ketQua.push('...');
    ketQua.push(trang);
  });
  return ketQua;
};

export const Pagination: React.FC<ThuocTinhPhanTrang> = ({
  trangHienTai,
  tongSoTrang,
  khiDoiTrang,
}) => {
  if (tongSoTrang <= 1) return null;

  return (
    <div className="thanh-phan-trang">
      <button
        type="button"
        className="nut-trang"
        disabled={trangHienTai <= 1}
        onClick={() => khiDoiTrang(trangHienTai - 1)}
      >
        « Trước
      </button>

      {taoDanhSachTrang(trangHienTai, tongSoTrang).map((trang, viTri) =>
        trang === '...' ? (
          <span key={`cham-${viTri}`} className="dau-cham">
            ...
          </span>
        ) : (
          <button
            key={trang}
            type="button"
            className={`nut-trang ${trang === trangHienTai ? 'trang-dang-chon' : ''}`}
            onClick={() => khiDoiTrang(trang)}
          >
            {trang}
          </button>
        )
      )}

      <button
        type="button"
        className="nut-trang"
        disabled={trangHienTai >= tongSoTrang}
        onClick={() => khiDoiTrang(trangHienTai + 1)}
      >
        Sau »
      </button>
    </div>
  );
};