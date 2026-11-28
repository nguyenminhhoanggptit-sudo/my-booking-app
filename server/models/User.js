const mongoose = require("mongoose");
const bcrypt = require("bcryptjs");

const userSchema = new mongoose.Schema(
  {
    username: {
      type: String,
      required: [true, "Vui lòng nhập tên đăng nhập."],
      unique: true, // MongoDB tự chặn trùng tên đăng nhập
      trim: true,
      lowercase: true,
      minlength: [3, "Tên đăng nhập phải có ít nhất 3 ký tự."],
    },
    password: {
      type: String,
      required: [true, "Vui lòng nhập mật khẩu."],
      minlength: [6, "Mật khẩu phải có ít nhất 6 ký tự."],
      select: false, // mặc định KHÔNG trả mật khẩu khi truy vấn; cần thì dùng .select('+password')
    },
    fullName: {
      type: String,
      required: [true, "Vui lòng nhập họ tên."],
      trim: true,
    },
    role: {
      type: String,
      enum: ["admin", "user"],
      default: "user",
    },
  },
  {
    // Khi chuyển sang JSON (res.json): đổi _id thành id (chuỗi), bỏ __v và password.
    // Nhờ vậy dữ liệu trả về khớp với interface User ở frontend.
    toJSON: {
      transform: (_doc, ret) => {
        ret.id = ret._id.toString();
        delete ret._id;
        delete ret.__v;
        delete ret.password;
        return ret;
      },
    },
  },
);

// Tự băm mật khẩu trước khi lưu (chỉ khi mật khẩu mới được gán hoặc thay đổi).
userSchema.pre("save", async function () {
  if (!this.isModified("password")) return;
  this.password = await bcrypt.hash(this.password, 10);
});

// So sánh mật khẩu người dùng nhập với mật khẩu đã băm trong DB.
// Lưu ý: document phải được lấy bằng .select('+password').
userSchema.methods.comparePassword = function (plainPassword) {
  return bcrypt.compare(plainPassword, this.password);
};

module.exports = mongoose.model("User", userSchema);
