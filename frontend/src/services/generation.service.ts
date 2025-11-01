import apiClient from './api.client';
import { Generation, CreateGenerationRequest } from '../types';

export async function createGeneration(data: CreateGenerationRequest): Promise<Generation> {
  const formData = new FormData();
  formData.append('prompt', data.prompt);
  formData.append('style', data.style);
  formData.append('imageUpload', data.imageUpload);

  const response = await apiClient.post<Generation>('/generations', formData, {
    headers: {
      'Content-Type': 'multipart/form-data',
    },
  });
  return response.data;
}

export async function getGenerations(limit: number = 5): Promise<Generation[]> {
  const response = await apiClient.get<Generation[]>('/generations', {
    params: { limit },
  });
  return response.data;
}

