const express = require("express");
const { login, getMe } = require("../controllers/authController");
const { verifyToken } = require("../middlewares/authMiddleware");

const router = express.Router();

// Được mount tại /api/auth trong server.js
router.post("/login", login);
router.get("/me", verifyToken, getMe);

module.exports = router;
