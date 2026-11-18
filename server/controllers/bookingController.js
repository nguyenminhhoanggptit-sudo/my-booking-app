const mongoose = require('mongoose');

// Tạo khuôn dữ liệu đơn đặt sân trong MongoDB
const khuonDatSan = new mongoose.Schema(
  {
    maNguoiDung: { type: String, required: true },
    maSan: { type: String, required: true },
    tenSan: { type: String, required: true },
    ngayDat: { type: String, required: true },     // Ví dụ: "2026-11-20"
    gioBatDau: { type: String, required: true },   // Ví dụ: "17:00"
    gioKetThuc: { type: String, required: true },  // Ví dụ: "18:30"
    giaTien: { type: Number, required: true },
    trangThai: {
      type: String,
      default: 'da_xac_nhan', // da_xac_nhan | da_huy
    },
  },
  { timestamps: true }
);

const DonDatSan = mongoose.models.Booking || mongoose.model('Booking', khuonDatSan);

// Hàm 1: Lấy danh sách các giờ đã bị đặt của 1 sân trong ngày
const layGioDaDat = async (req, res) => {
  try {
    const { maSan, ngayDat } = req.query;

    if (!maSan || !ngayDat) {
      return res.status(400).json({ thongBao: 'Thiếu mã sân hoặc ngày đặt!' });
    }

    // Tìm các đơn chưa bị hủy
    const danhSach = await DonDatSan.find({
      maSan: maSan,
      ngayDat: ngayDat,
      trangThai: { $ne: 'da_huy' },
    }).select('gioBatDau gioKetThuc');

    res.status(200).json(danhSach);
  } catch (loi) {
    res.status(500).json({ thongBao: 'Lỗi máy chủ!', chiTiet: loi.message });
  }
};

// Hàm 2: Lưu đơn đặt sân mới (Có kiểm tra chặn trùng giờ)
const taoDonDatSan = async (req, res) => {
  try {
    const { danhSachGio } = req.body; // Mảng các ca khách chọn từ giỏ hàng
    const maNguoiDung = req.user?.id || 'khach_hang_1';

    if (!danhSachGio || danhSachGio.length === 0) {
      return res.status(400).json({ thongBao: 'Giỏ đặt sân đang trống!' });
    }

    // Kiểm tra từng ca trong giỏ xem có bị ai đặt trùng chưa
    for (const ca of danhSachGio) {
      const biTrung = await DonDatSan.findOne({
        maSan: ca.maSan,
        ngayDat: ca.ngayDat,
        trangThai: { $ne: 'da_huy' },
        // Kiểm tra 2 khung giờ đè lên nhau
        gioBatDau: { $lt: ca.gioKetThuc },
        gioKetThuc: { $gt: ca.gioBatDau },
      });

      if (biTrung) {
        return res.status(409).json({
          thongBao: `Sân "${ca.tenSan}" ngày ${ca.ngayDat} khung giờ ${ca.gioBatDau} - ${ca.gioKetThuc} đã có người đặt!`,
        });
      }
    }

    // Không trùng thì chuẩn bị dữ liệu và lưu tất cả vào MongoDB
    const duLieuLuu = danhSachGio.map((ca) => ({
      maNguoiDung: maNguoiDung,
      maSan: ca.maSan,
      tenSan: ca.tenSan,
      ngayDat: ca.ngayDat,
      gioBatDau: ca.gioBatDau,
      gioKetThuc: ca.gioKetThuc,
      giaTien: ca.giaTien,
    }));

    const ketQua = await DonDatSan.insertMany(duLieuLuu);
    res.status(201).json({
      thongBao: 'Đặt sân thành công!',
      duLieu: ketQua,
    });
  } catch (loi) {
    res.status(500).json({ thongBao: 'Lỗi khi lưu đơn đặt sân!', chiTiet: loi.message });
  }
};

module.exports = { layGioDaDat, taoDonDatSan };