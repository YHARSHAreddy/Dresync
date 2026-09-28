import api from './client';

export interface VTOResponse {
  success: boolean;
  job_id?: string;
  error_message?: string;
  is_mock?: boolean;
  status?: string;
}

export interface VTOJobResponse {
  id: string;
  status: string;
  result_image_url?: string;
  error_message?: string;
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
  getJobStatus: async (jobId: string): Promise<VTOJobResponse> => {
    const { data } = await api.get(`/vto/job/${jobId}`);
    return data;
  }
};
