export interface User {
  id: number;
  email: string;
}

export interface AuthResponse {
  message: string;
  token: string;
  user: User;
}

export interface Generation {
  id: number;
  imageUrl: string;
  prompt: string;
  style: string;
  createdAt: string;
  status: 'pending' | 'completed' | 'failed';
}

export interface CreateGenerationRequest {
  prompt: string;
  style: string;
  imageUpload: File;
}

export interface ApiError {
  error: string;
  message?: string;
  details?: Array<{ path: string[]; message: string }>;
}

