import React from 'react';
import type { KhungGio } from '../../types/booking.types';
import './TimeSlotPicker.css';

interface TimeSlotPickerProps {
  danhSachKhungGio: KhungGio[];
  gioDaDat: string[];
  maGioDangChon: string[];
  khiBamChonGio: (khungGio: KhungGio) => void;
}

const TimeSlotPicker: React.FC<TimeSlotPickerProps> = ({
  danhSachKhungGio,
  gioDaDat,
  maGioDangChon,
  khiBamChonGio,
}) => {
  return (
    <div className="time-slot-grid">
      {danhSachKhungGio.map((khungGio) => {
        const daBiDat = gioDaDat.includes(khungGio.gioBatDau);
        const dangChon = maGioDangChon.includes(khungGio.gioBatDau);

        let tenLop = 'slot-btn';
        if (daBiDat) tenLop += ' slot-booked';
        else if (dangChon) tenLop += ' slot-selected';

        return (
          <button
            key={khungGio.id}
            type="button"
            className={tenLop}
            disabled={daBiDat}
            onClick={() => khiBamChonGio(khungGio)}
          >
            <span className="slot-time">
              {khungGio.gioBatDau} - {khungGio.gioKetThuc}
            </span>
            <span className="slot-price">
              {daBiDat
                ? 'Đã đặt'
                : `${khungGio.giaTien.toLocaleString('vi-VN')} đ`}
            </span>
          </button>
        );
      })}
    </div>
  );
};

export default TimeSlotPicker;