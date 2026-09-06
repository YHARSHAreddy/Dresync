import api from './client';

export interface VTOResponse {
  success: boolean;
  result_image_url?: string;
  error_message?: string;
  is_mock?: boolean;
  status?: string;
}

export const vtoApi = {
  tryOnItem: async (itemId: string): Promise<VTOResponse> => {
    const { data } = await api.post(`/vto/item/${itemId}`);
    return data;
  },
  tryOnOutfit: async (outfitId: string): Promise<VTOResponse> => {
    const { data } = await api.post(`/vto/outfit/${outfitId}`);
    return data;
  },
};
