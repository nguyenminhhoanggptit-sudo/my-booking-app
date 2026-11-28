const jwt = require('jsonwebtoken');

// Xác thực JWT. Client gửi header:  Authorization: Bearer <token>
// Hợp lệ → gắn req.user = { id, role } rồi cho đi tiếp. Không hợp lệ → trả 401.
const verifyToken = (req, res, next) => {
  const authHeader = req.headers.authorization || '';
  const [scheme, token] = authHeader.split(' ');

  if (scheme !== 'Bearer' || !token) {
    return res.status(401).json({ message: 'Bạn chưa đăng nhập.' });
  }

  try {
    const payload = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: payload.id, role: payload.role };
    next();
  } catch (error) {
    const message =
      error.name === 'TokenExpiredError'
        ? 'Phiên đăng nhập đã hết hạn. Vui lòng đăng nhập lại.'
        : 'Token không hợp lệ.';
    return res.status(401).json({ message });
  }
};

// Phân quyền theo vai trò. PHẢI đặt SAU verifyToken.
// Ví dụ: router.post('/', verifyToken, requireRole('admin'), createCourt);
const requireRole =
  (...roles) =>
  (req, res, next) => {
    if (!req.user || !roles.includes(req.user.role)) {
      return res.status(403).json({ message: 'Bạn không có quyền thực hiện thao tác này.' });
    }
    next();
  };

module.exports = { verifyToken, requireRole };