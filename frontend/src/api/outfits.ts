import api from './client';
import { Outfit, OutfitGenerateRequest, OutfitHistory } from '../types';

export const outfitsApi = {
  generate: async (req: OutfitGenerateRequest): Promise<Outfit[]> => {
    const res = await api.post('/outfits/generate', req);
    return res.data;
  },
  getAll: async (favoritesOnly = false): Promise<Outfit[]> => {
    const res = await api.get('/outfits/', { params: { favorites_only: favoritesOnly } });
    return res.data;
  },
  getOne: async (id: string): Promise<Outfit> => {
    const res = await api.get(`/outfits/${id}`);
    return res.data;
  },
  toggleFavorite: async (id: string): Promise<{ id: string; is_favorite: boolean }> => {
    const res = await api.post(`/outfits/${id}/favorite`);
    return res.data;
  },
  markWorn: async (id: string): Promise<OutfitHistory> => {
    const res = await api.post(`/outfits/${id}/wear`);
    return res.data;
  },
  deleteOutfit: async (id: string): Promise<void> => {
    await api.delete(`/outfits/${id}`);
  },
  getHistory: async (): Promise<OutfitHistory[]> => {
    const res = await api.get('/outfits/history/all');
    return res.data;
  },
};
