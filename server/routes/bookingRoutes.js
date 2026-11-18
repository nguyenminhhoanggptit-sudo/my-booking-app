const express = require('express');
const router = express.Router();
const { layGioDaDat, taoDonDatSan } = require('../controllers/bookingController');

// Đường dẫn lấy giờ đã đặt: GET /api/bookings/gio-da-dat
router.get('/gio-da-dat', layGioDaDat);

// Đường dẫn tạo đơn đặt sân: POST /api/bookings
router.post('/', taoDonDatSan);

module.exports = router;