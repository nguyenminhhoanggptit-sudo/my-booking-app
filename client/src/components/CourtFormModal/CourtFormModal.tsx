import React, { useState, useEffect } from 'react';
import type { Court, CourtFormData, CourtStatus, CourtType } from '../../types/court.types';
import './CourtFormModal.css';

interface CourtFormModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSubmit: (data: CourtFormData) => Promise<void>;
  initialData: Court | null;
}

const defaultForm: CourtFormData = {
  name: '',
  type: '5',
  pricePerHour: '',
  status: 'AVAILABLE',
  description: '',
  imageUrl: '',
};

const CourtFormModal: React.FC<CourtFormModalProps> = ({
  isOpen,
  onClose,
  onSubmit,
  initialData,
}) => {
  const [formData, setFormData] = useState<CourtFormData>(defaultForm);
  const [errorMsg, setErrorMsg] = useState<string>('');
  const [submitting, setSubmitting] = useState<boolean>(false);

  useEffect(() => {
    if (initialData) {
      setFormData({
        name: initialData.name,
        type: initialData.type,
        pricePerHour: initialData.pricePerHour,
        status: initialData.status,
        description: initialData.description || '',
        imageUrl: initialData.imageUrl || '',
      });
    } else {
      setFormData(defaultForm);
    }
    setErrorMsg('');
  }, [initialData, isOpen]);

  if (!isOpen) return null;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setErrorMsg('');

    if (!formData.name.trim()) {
      return setErrorMsg('Vui lòng nhập tên sân.');
    }
    if (Number(formData.pricePerHour) <= 0) {
      return setErrorMsg('Giá thuê mỗi giờ phải lớn hơn 0.');
    }

    try {
      setSubmitting(true);
      await onSubmit(formData);
      onClose();
    } catch (err: any) {
      setErrorMsg(err.response?.data?.message || 'Có lỗi xảy ra, vui lòng thử lại.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-overlay">
      <div className="modal-content">
        <h3>{initialData ? 'Chỉnh Sửa Thông Tin Sân' : 'Thêm Sân Bóng Mới'}</h3>
        {errorMsg && <div className="error-text">{errorMsg}</div>}

        <form onSubmit={handleSubmit} className="form-grid">
          <div className="form-group">
            <label>Tên sân *</label>
            <input
              type="text"
              value={formData.name}
              onChange={(e) => setFormData({ ...formData, name: e.target.value })}
              placeholder="VD: Sân 5 - Số 1"
            />
          </div>

          <div className="form-group">
            <label>Loại sân *</label>
            <select
              value={formData.type}
              onChange={(e) => setFormData({ ...formData, type: e.target.value as CourtType })}
            >
              <option value="5">Sân 5 người</option>
              <option value="7">Sân 7 người</option>
              <option value="11">Sân 11 người</option>
            </select>
          </div>

          <div className="form-group">
            <label>Giá thuê / giờ (VNĐ) *</label>
            <input
              type="number"
              value={formData.pricePerHour}
              onChange={(e) => setFormData({ ...formData, pricePerHour: e.target.value })}
              placeholder="VD: 300000"
            />
          </div>

          <div className="form-group">
            <label>Trạng thái</label>
            <select
              value={formData.status}
              onChange={(e) => setFormData({ ...formData, status: e.target.value as CourtStatus })}
            >
              <option value="AVAILABLE">Hoạt động</option>
              <option value="MAINTENANCE">Bảo trì</option>
            </select>
          </div>

          <div className="form-group full-width">
            <label>Link hình ảnh</label>
            <input
              type="text"
              value={formData.imageUrl}
              onChange={(e) => setFormData({ ...formData, imageUrl: e.target.value })}
              placeholder="https://..."
            />
          </div>

          <div className="form-group full-width">
            <label>Mô tả sân</label>
            <textarea
              rows={3}
              value={formData.description}
              onChange={(e) => setFormData({ ...formData, description: e.target.value })}
              placeholder="Mặt cỏ nhân tạo, có đèn chiếu sáng..."
            />
          </div>

          <div className="modal-actions">
            <button type="button" className="btn-cancel" onClick={onClose} disabled={submitting}>
              Hủy
            </button>
            <button type="submit" className="btn-submit" disabled={submitting}>
              {submitting ? 'Đang lưu...' : initialData ? 'Lưu Thay Đổi' : 'Tạo Sân'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default CourtFormModal;