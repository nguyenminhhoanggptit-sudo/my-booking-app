const mongoose = require('mongoose');

// Nạp controller của Kiên để model 'Booking' được đăng ký, dùng chung 1 collection
require('./bookingController');
const DonDatSan = mongoose.model('Booking');

// Thoát ký tự đặc biệt để từ khóa không bị hiểu thành regex
const thoatKyTuDacBiet = (chuoi) => chuoi.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');

// Lấy lịch sử đặt sân (tìm kiếm, lọc trạng thái, phân trang)
// GET /api/stats/lich-su?trang=1&soLuong=5&tuKhoa=&trangThai=
const layLichSu = async(req, res) => {
    try {
        const maNguoiDung = (req.user && req.user.id) || 'khach_hang_1';
        const { tuKhoa, trangThai } = req.query;

        const trang = Math.max(parseInt(req.query.trang, 10) || 1, 1);
        const soLuong = Math.min(Math.max(parseInt(req.query.soLuong, 10) || 5, 1), 50);

        const boLoc = { maNguoiDung };
        if (tuKhoa && String(tuKhoa).trim()) {
            boLoc.tenSan = { $regex: thoatKyTuDacBiet(String(tuKhoa).trim()), $options: 'i' };
        }
        if (trangThai === 'da_xac_nhan' || trangThai === 'da_huy') {
            boLoc.trangThai = trangThai;
        }

        const tongSoDon = await DonDatSan.countDocuments(boLoc);
        const tongSoTrang = Math.max(Math.ceil(tongSoDon / soLuong), 1);
        const trangHienTai = Math.min(trang, tongSoTrang);

        // Đơn mới nhất hiện trước
        const duLieu = await DonDatSan.find(boLoc)
            .sort({ ngayDat: -1, gioBatDau: -1 })
            .skip((trangHienTai - 1) * soLuong)
            .limit(soLuong)
            .lean();

        res.status(200).json({ duLieu, phanTrang: { trangHienTai, tongSoDon, tongSoTrang } });
    } catch (loi) {
        res.status(500).json({ thongBao: 'Lỗi khi tải lịch sử đặt sân!', chiTiet: loi.message });
    }
};

module.exports = { layLichSu };