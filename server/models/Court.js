const mongoose = require('mongoose');

const courtSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: [true, 'Tên sân không được để trống'],
      trim: true,
      unique: true,
    },
    type: {
      type: String,
      enum: ['5', '7', '11'],
      required: [true, 'Loại sân bắt buộc phải chọn'],
    },
    pricePerHour: {
      type: Number,
      required: [true, 'Giá thuê mỗi giờ không được để trống'],
      min: [1000, 'Giá thuê sân phải lớn hơn 0'],
    },
    status: {
      type: String,
      enum: ['AVAILABLE', 'MAINTENANCE'],
      default: 'AVAILABLE',
    },
    description: {
      type: String,
      default: '',
      trim: true,
    },
    imageUrl: {
      type: String,
      default: 'https://via.placeholder.com/400x250?text=San+Bong+Da',
    },
  },
  { timestamps: true }
);

module.exports = mongoose.model('Court', courtSchema);