import React, { useState, useEffect } from 'react';
import type { Court, CourtFormData } from '../../types/court.types';
import { courtService } from '../../services/courtService';
import CourtFormModal from '../../components/CourtFormModal/CourtFormModal';
import './AdminCourts.css';

const AdminCourts: React.FC = () => {
  const [courts, setCourts] = useState<Court[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isModalOpen, setIsModalOpen] = useState<boolean>(false);
  const [selectedCourt, setSelectedCourt] = useState<Court | null>(null);

  const fetchCourts = async () => {
    setLoading(true);
    try {
      const data = await courtService.getAllCourts();
      setCourts(data);
    } catch (error) {
      alert('Không thể tải danh sách sân bóng!');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchCourts();
  }, []);

  const handleOpenAdd = () => {
    setSelectedCourt(null);
    setIsModalOpen(true);
  };

  const handleOpenEdit = (court: Court) => {
    setSelectedCourt(court);
    setIsModalOpen(true);
  };

  const handleSaveCourt = async (formData: CourtFormData) => {
    if (selectedCourt) {
      await courtService.updateCourt(selectedCourt._id, formData);
      alert('Cập nhật sân thành công!');
    } else {
      await courtService.createCourt(formData);
      alert('Thêm sân mới thành công!');
    }
    fetchCourts();
  };

  const handleDeleteCourt = async (id: string, name: string) => {
    if (!window.confirm(`Bạn có chắc chắn muốn xóa "${name}" không?`)) return;

    try {
      await courtService.deleteCourt(id);
      setCourts((prev) => prev.filter((item) => item._id !== id));
      alert('Đã xóa sân thành công!');
    } catch (error: any) {
      alert(error.response?.data?.message || 'Xóa sân thất bại!');
    }
  };

return (
    <div className="app-card">
      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginBottom: '20px',
        }}
      >
        <h1 style={{ margin: 0 }}>Quản lý sân (Duy)</h1>
        <button
          type="button"
          onClick={handleOpenAdd}
          style={{
            backgroundColor: '#1f4d3a',
            color: '#ffffff',
            border: 'none',
            borderRadius: '8px',
            padding: '10px 16px',
            fontWeight: 600,
            cursor: 'pointer',
          }}
        >
          + Thêm sân mới
        </button>
      </div>

      {loading ? (
        <p>Đang tải danh sách sân...</p>
      ) : (
        <table className="courts-table">
          <thead>
            <tr>
              <th>Tên sân</th>
              <th>Loại sân</th>
              <th>Giá / giờ</th>
              <th>Trạng thái</th>
              <th>Hành động</th>
            </tr>
          </thead>
          <tbody>
            {courts.length === 0 ? (
              <tr>
                <td colSpan={5} style={{ textAlign: 'center' }}>
                  Chưa có sân bóng nào trong hệ thống.
                </td>
              </tr>
            ) : (
              courts.map((court) => (
                <tr key={court._id}>
                  <td><strong>{court.name}</strong></td>
                  <td>Sân {court.type}</td>
                  <td>{Number(court.pricePerHour).toLocaleString('vi-VN')} đ</td>
                  <td>
                    <span
                      className={`badge ${
                        court.status === 'AVAILABLE' ? 'badge-available' : 'badge-maintenance'
                      }`}
                    >
                      {court.status === 'AVAILABLE' ? 'Hoạt động' : 'Bảo trì'}
                    </span>
                  </td>
                  <td>
                    <button className="btn-edit" onClick={() => handleOpenEdit(court)}>
                      Sửa
                    </button>
                    <button
                      className="btn-delete"
                      onClick={() => handleDeleteCourt(court._id, court.name)}
                    >
                      Xóa
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      )}

      <CourtFormModal
        isOpen={isModalOpen}
        onClose={() => setIsModalOpen(false)}
        onSubmit={handleSaveCourt}
        initialData={selectedCourt}
      />
    </div>
  );
};

export default AdminCourts;