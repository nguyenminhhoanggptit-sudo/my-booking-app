const express = require("express");
const { getUsers, registerUser } = require("../controllers/userController");
const { verifyToken, requireRole } = require("../middlewares/authMiddleware");

const router = express.Router();

// Được mount tại /api/users trong server.js
router.post("/", registerUser);
router.get("/", verifyToken, requireRole("admin"), getUsers);

module.exports = router;
