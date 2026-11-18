const express = require('express');
const router = express.Router();
const { layLichSu } = require('../controllers/statsController');

// Lấy lịch sử đặt sân: GET /api/stats/lich-su
router.get('/lich-su', layLichSu);

module.exports = router;