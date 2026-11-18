const express = require('express');
const router = express.Router();
const courtController = require('../controllers/courtController');
// Khi Hoàng xong authMiddleware.js thì bỏ comment dòng dưới để bảo vệ API Admin:
// const { verifyToken, isAdmin } = require('../middlewares/authMiddleware');

router.get('/', courtController.getAllCourts);
router.get('/:id', courtController.getCourtById);
router.post('/', /* verifyToken, isAdmin, */ courtController.createCourt);
router.put('/:id', /* verifyToken, isAdmin, */ courtController.updateCourt);
router.delete('/:id', /* verifyToken, isAdmin, */ courtController.deleteCourt);

module.exports = router;
