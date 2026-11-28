const bcrypt = require("bcryptjs");

const users = [
  {
    id: "1",
    username: "admin123",
    password: bcrypt.hashSync("123456", 10),
    fullName: "Quản trị viên",
    role: "admin",
  },
  {
    id: "2",
    username: "user1",
    password: bcrypt.hashSync("123456", 10),
    fullName: "Khách hàng mẫu",
    role: "user",
  },
];

const findByUsername = async (username) =>
  users.find((u) => u.username === username) || null;

const findById = async (id) =>
  users.find((u) => u.id === id) || null;

const toPublicUser = (user) => {
  if (!user) return null;
  const { password, ...publicUser } = user;
  return publicUser;
};

module.exports = {
  users,
  findByUsername,
  findById,
  toPublicUser,
};
