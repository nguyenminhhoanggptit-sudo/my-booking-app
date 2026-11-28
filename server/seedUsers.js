// Tạo 2 tài khoản mẫu (admin và user) trong MongoDB.
// Chạy 1 lần, trong thư mục server:  node seedUsers.js
// Chạy lại nhiều lần vẫn an toàn: tài khoản nào đã có thì bỏ qua.
require("dotenv").config();
const mongoose = require("mongoose");
const User = require("./models/User");

const SAMPLE_USERS = [
  {
    username: "admin",
    password: "admin123",
    fullName: "Nguyễn Minh Hoàng",
    role: "admin",
  },
  {
    username: "user",
    password: "user123",
    fullName: "Người dùng mẫu",
    role: "user",
  },
];

const seed = async () => {
  // Dùng cùng chuỗi kết nối mặc định như server.js
  await mongoose.connect(
    process.env.MONGO_URI || "mongodb://127.0.0.1:27017/booking_app",
  );

  for (const data of SAMPLE_USERS) {
    if (await User.exists({ username: data.username })) {
      console.log(`Bỏ qua "${data.username}" (đã tồn tại)`);
      continue;
    }
    await User.create(data); // mật khẩu được băm tự động
    console.log(`Đã tạo "${data.username}" (${data.role})`);
  }

  await mongoose.disconnect();
};

seed().catch((error) => {
  console.error("Lỗi khi tạo dữ liệu mẫu:", error);
  process.exit(1);
});
