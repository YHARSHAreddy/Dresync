import api from './client';
import { ClothingItem, ClothingItemCreate, WardrobeStats } from '../types';

export const wardrobeApi = {
  getStats: async (): Promise<WardrobeStats> => {
    const res = await api.get('/wardrobe/stats');
    return res.data;
  },
  getItems: async (params?: { category?: string; search?: string }): Promise<ClothingItem[]> => {
    const res = await api.get('/wardrobe/items', { params });
    return res.data;
  },
  getItem: async (id: string): Promise<ClothingItem> => {
    const res = await api.get(`/wardrobe/items/${id}`);
    return res.data;
  },
  createItem: async (data: ClothingItemCreate): Promise<ClothingItem> => {
    const res = await api.post('/wardrobe/items', data);
    return res.data;
  },
  updateItem: async (id: string, data: Partial<ClothingItemCreate>): Promise<ClothingItem> => {
    const res = await api.put(`/wardrobe/items/${id}`, data);
    return res.data;
  },
  deleteItem: async (id: string): Promise<void> => {
    await api.delete(`/wardrobe/items/${id}`);
  },
  uploadImage: async (id: string, file: File): Promise<ClothingItem> => {
    const form = new FormData();
    form.append('file', file);
    const res = await api.post(`/wardrobe/items/${id}/image`, form, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
    return res.data;
  },
};
