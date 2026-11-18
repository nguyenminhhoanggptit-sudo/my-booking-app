const mongoose = require('mongoose');
const Court = require('../models/Court');

// [GET] /api/courts
exports.getAllCourts = async (req, res) => {
  try {
    const courts = await Court.find().sort({ createdAt: -1 });
    res.status(200).json({ success: true, data: courts });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// [GET] /api/courts/:id
exports.getCourtById = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID sân không hợp lệ' });
    }
    const court = await Court.findById(id);
    if (!court) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sân' });
    }
    res.status(200).json({ success: true, data: court });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi server', error: error.message });
  }
};

// [POST] /api/courts
exports.createCourt = async (req, res) => {
  try {
    const { name, type, pricePerHour, status, description, imageUrl } = req.body;

    if (!name || !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên sân không được để trống' });
    }
    if (!['5', '7', '11'].includes(String(type))) {
      return res.status(400).json({ success: false, message: 'Loại sân chỉ chấp nhận 5, 7 hoặc 11' });
    }
    if (!pricePerHour || Number(pricePerHour) <= 0) {
      return res.status(400).json({ success: false, message: 'Giá thuê/giờ phải lớn hơn 0' });
    }

    const existingCourt = await Court.findOne({ name: { $regex: new RegExp(`^${name.trim()}$`, 'i') } });
    if (existingCourt) {
      return res.status(400).json({ success: false, message: 'Tên sân này đã tồn tại!' });
    }

    const newCourt = await Court.create({
      name: name.trim(),
      type: String(type),
      pricePerHour: Number(pricePerHour),
      status: status || 'AVAILABLE',
      description,
      imageUrl: imageUrl || undefined,
    });

    res.status(201).json({ success: true, message: 'Thêm sân thành công', data: newCourt });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi tạo sân', error: error.message });
  }
};

// [PUT] /api/courts/:id
exports.updateCourt = async (req, res) => {
  try {
    const { id } = req.params;
    const { name, type, pricePerHour, status, description, imageUrl } = req.body;

    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID sân không hợp lệ' });
    }
    if (name !== undefined && !name.trim()) {
      return res.status(400).json({ success: false, message: 'Tên sân không được để trống' });
    }
    if (type && !['5', '7', '11'].includes(String(type))) {
      return res.status(400).json({ success: false, message: 'Loại sân phải là 5, 7 hoặc 11' });
    }
    if (pricePerHour !== undefined && Number(pricePerHour) <= 0) {
      return res.status(400).json({ success: false, message: 'Giá thuê/giờ phải lớn hơn 0' });
    }

    if (name) {
      const duplicate = await Court.findOne({
        _id: { $ne: id },
        name: { $regex: new RegExp(`^${name.trim()}$`, 'i') },
      });
      if (duplicate) {
        return res.status(400).json({ success: false, message: 'Tên sân đã được sử dụng bởi sân khác!' });
      }
    }

    const updatedCourt = await Court.findByIdAndUpdate(
      id,
      {
        ...(name && { name: name.trim() }),
        ...(type && { type: String(type) }),
        ...(pricePerHour !== undefined && { pricePerHour: Number(pricePerHour) }),
        ...(status && { status }),
        ...(description !== undefined && { description }),
        ...(imageUrl !== undefined && { imageUrl }),
      },
      { new: true, runValidators: true }
    );

    if (!updatedCourt) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sân để cập nhật' });
    }

    res.status(200).json({ success: true, message: 'Cập nhật sân thành công', data: updatedCourt });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi cập nhật sân', error: error.message });
  }
};

// [DELETE] /api/courts/:id
exports.deleteCourt = async (req, res) => {
  try {
    const { id } = req.params;
    if (!mongoose.Types.ObjectId.isValid(id)) {
      return res.status(400).json({ success: false, message: 'ID sân không hợp lệ' });
    }

    const deletedCourt = await Court.findByIdAndDelete(id);
    if (!deletedCourt) {
      return res.status(404).json({ success: false, message: 'Không tìm thấy sân để xóa' });
    }

    res.status(200).json({ success: true, message: 'Xóa sân thành công' });
  } catch (error) {
    res.status(500).json({ success: false, message: 'Lỗi khi xóa sân', error: error.message });
  }
};