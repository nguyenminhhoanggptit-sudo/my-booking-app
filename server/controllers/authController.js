const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const userStore = require("../data/users");

const TOKEN_EXPIRES_IN = "1d"; // token sống 1 ngày

// Tạo JWT chứa id và vai trò của người dùng.
const signToken = (user) =>
  jwt.sign({ id: user.id, role: user.role }, process.env.JWT_SECRET, {
    expiresIn: TOKEN_EXPIRES_IN,
  });

// POST /api/auth/login   body: { username, password }
const login = async (req, res) => {
  try {
    const { username, password } = req.body;

    if (
      typeof username !== "string" ||
      typeof password !== "string" ||
      !username.trim() ||
      !password
    ) {
      return res
        .status(400)
        .json({ message: "Vui lòng nhập tên đăng nhập và mật khẩu." });
    }

    const user = await userStore.findByUsername(username.trim().toLowerCase());
    const isPasswordCorrect = user
      ? await bcrypt.compare(password, user.password)
      : false;

    // Cố ý dùng chung một thông báo cho "sai tên" và "sai mật khẩu"
    // để người ngoài không dò được tên đăng nhập nào đang tồn tại.
    if (!isPasswordCorrect) {
      return res
        .status(401)
        .json({ message: "Tên đăng nhập hoặc mật khẩu không đúng." });
    }

    res.json({ token: signToken(user), user: userStore.toPublicUser(user) });
  } catch (error) {
    console.error("Lỗi đăng nhập:", error);
    res.status(500).json({ message: "Lỗi máy chủ. Vui lòng thử lại sau." });
  }
};

// GET /api/auth/me   (cần token)
// Trả về người dùng hiện tại, client dùng để khôi phục phiên khi tải lại trang.
const getMe = async (req, res) => {
  try {
    const user = await userStore.findById(req.user.id);
    if (!user) {
      return res.status(404).json({ message: "Không tìm thấy người dùng." });
    }
    res.json({ user: userStore.toPublicUser(user) });
  } catch (error) {
    console.error("Lỗi lấy thông tin người dùng:", error);
    res.status(500).json({ message: "Lỗi máy chủ. Vui lòng thử lại sau." });
  }
};

module.exports = { login, getMe };
