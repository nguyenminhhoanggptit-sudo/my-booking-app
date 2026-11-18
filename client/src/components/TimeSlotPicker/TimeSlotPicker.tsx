import React from 'react';
import type { KhungGio } from '../../types/booking.types';
import './TimeSlotPicker.css';

interface ThuocTinhChonGio {
  danhSachGio: KhungGio[];
  gioDaDat: string[];
  maGioDangChon: string[];
  maSan: string;
  ngayDat: string;
  khiBamChonGio: (gio: KhungGio) => void;
}

export const TimeSlotPicker: React.FC<ThuocTinhChonGio> = ({
  danhSachGio,
  gioDaDat,
  maGioDangChon,
  maSan,
  ngayDat,
  khiBamChonGio,
}) => {
  return (
    <div className="luoi-khung-gio">
      {danhSachGio.map((gio) => {
        const biDatRoi = gioDaDat.includes(gio.gioBatDau);
        const maDinhDanh = `${maSan}_${ngayDat}_${gio.gioBatDau}`;
        const dangChon = maGioDangChon.includes(maDinhDanh);

        return (
          <button
            key={gio.id}
            type="button"
            disabled={biDatRoi}
            onClick={() => khiBamChonGio(gio)}
            className={`nut-khung-gio ${biDatRoi ? 'da-dat' : ''} ${dangChon ? 'dang-chon' : ''}`}
          >
            <span className="chu-gio">
              {gio.gioBatDau} - {gio.gioKetThuc}
            </span>
            <span className="chu-gia">
              {biDatRoi ? 'Đã có người đặt' : `${gio.giaTien.toLocaleString('vi-VN')} đ`}
            </span>
          </button>
        );
      })}
    </div>
  );
};