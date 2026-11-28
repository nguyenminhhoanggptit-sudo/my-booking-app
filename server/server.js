const express = require("express");
const mongoose = require("mongoose");
const cors = require("cors");
require("dotenv").config();

const app = express();
app.use(cors());
app.use(express.json());

// Kết nối MongoDB (thay chuỗi kết nối MongoDB của nhóm bạn vào đây)
const MONGO_URI =
  process.env.MONGO_URI || "mongodb://127.0.0.1:27017/booking_app";
mongoose
  .connect(MONGO_URI)
  .then(() => console.log("Kết nối MongoDB thành công"))
  .catch((err) => console.error("Lỗi kết nối MongoDB:", err));

app.use("/api/auth", require("./routes/authRoutes"));
app.use("/api/users", require("./routes/userRoutes"));
// Gắn API quản lý sân của Duy
app.use("/api/courts", require("./routes/courtRoutes"));

const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
  console.log(`Server đang chạy tại http://localhost:${PORT}`);
});
