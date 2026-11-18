import axios from 'axios';
import type { Court, CourtFormData } from '../types/court.types';

const API_URL = 'http://localhost:5000/api/courts';

const getAuthConfig = () => {
  const token = localStorage.getItem('token');
  return token ? { headers: { Authorization: `Bearer ${token}` } } : {};
};

export const courtService = {
  getAllCourts: async (): Promise<Court[]> => {
    const res = await axios.get(API_URL);
    return res.data.data;
  },

  createCourt: async (data: CourtFormData): Promise<Court> => {
    const res = await axios.post(API_URL, data, getAuthConfig());
    return res.data.data;
  },

  updateCourt: async (id: string, data: CourtFormData): Promise<Court> => {
    const res = await axios.put(`${API_URL}/${id}`, data, getAuthConfig());
    return res.data.data;
  },

  deleteCourt: async (id: string): Promise<void> => {
    await axios.delete(`${API_URL}/${id}`, getAuthConfig());
  },
};