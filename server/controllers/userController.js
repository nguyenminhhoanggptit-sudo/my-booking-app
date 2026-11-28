const User = require("../models/User");

// GET /api/users   (chỉ admin) → danh sách người dùng, không kèm mật khẩu
const getUsers = async (req, res) => {
  try {
    const users = await User.find().sort({ _id: 1 });
    res.json({ users });
  } catch (error) {
    console.error("Lỗi lấy danh sách người dùng:", error);
    res.status(500).json({ message: "Lỗi máy chủ. Vui lòng thử lại sau." });
  }
};

// POST /api/users   body: { username, password, fullName }  → tạo tài khoản mới
// Vai trò luôn là "user"; không cho client tự chọn để tránh tự cấp quyền admin.
const registerUser = async (req, res) => {
  try {
    const { username, password, fullName } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      typeof fullName !== "string"
    ) {
      return res
        .status(400)
        .json({
          message: "Vui lòng nhập đầy đủ họ tên, tên đăng nhập và mật khẩu.",
        });
    }

    const cleanUsername = username.trim().toLowerCase();
    const cleanFullName = fullName.trim();

    if (cleanUsername.length < 3) {
      return res
        .status(400)
        .json({ message: "Tên đăng nhập phải có ít nhất 3 ký tự." });
    }
    if (password.length < 6) {
      return res
        .status(400)
        .json({ message: "Mật khẩu phải có ít nhất 6 ký tự." });
    }
    if (!cleanFullName) {
      return res.status(400).json({ message: "Vui lòng nhập họ tên." });
    }

    // Mật khẩu được băm tự động trong pre('save') của model
    const newUser = await User.create({
      username: cleanUsername,
      password,
      fullName: cleanFullName,
      role: "user",
    });

    res.status(201).json({ user: newUser });
  } catch (error) {
    // Mã 11000 = vi phạm unique index (trùng tên đăng nhập)
    if (error.code === 11000) {
      return res.status(409).json({ message: "Tên đăng nhập đã tồn tại." });
    }
    console.error("Lỗi tạo người dùng:", error);
    res.status(500).json({ message: "Lỗi máy chủ. Vui lòng thử lại sau." });
  }
};

module.exports = { getUsers, registerUser };
