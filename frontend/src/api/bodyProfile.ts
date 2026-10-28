import api from './client';

export interface BodyProfile {
  id?: string;
  user_id?: string;
  height_cm?: number | null;
  front_photo_url?: string | null;
  side_photo_url?: string | null;
}

export const bodyProfileApi = {
  getProfile: async (): Promise<BodyProfile> => {
    try {
      const res = await api.get('/body-profile/me');
      return res.data;
    } catch (e: any) {
      if (e.response?.status === 404) {
        return {};
      }
      throw e;
    }
  },
  
  createProfile: async (data: BodyProfile): Promise<BodyProfile> => {
    const res = await api.post('/body-profile/me', data);
    return res.data;
  },

  updateProfile: async (data: BodyProfile): Promise<BodyProfile> => {
    const res = await api.put('/body-profile/me', data);
    return res.data;
  },

  uploadPhoto: async (file: File, photoType: 'front' | 'side' = 'front'): Promise<BodyProfile> => {
    const formData = new FormData();
    formData.append('file', file);
    const res = await api.post(`/body-profile/me/photo?photo_type=${photoType}`, formData, {
      headers: {
        'Content-Type': 'multipart/form-data',
      },
    });
    return res.data;
  }
};

