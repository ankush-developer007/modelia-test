import { Request } from 'express';
import { JwtPayload } from 'jsonwebtoken';

export interface AuthRequest extends Request {
  userId?: number;
  user?: {
    id: number;
    email: string;
  };
}

export interface User {
  id: number;
  email: string;
  password_hash: string;
  created_at: Date;
  updated_at: Date;
}

export interface Generation {
  id: number;
  user_id: number;
  prompt: string;
  style: string;
  original_image_url: string;
  generated_image_url: string | null;
  status: 'pending' | 'completed' | 'failed';
  created_at: Date;
  updated_at: Date;
}

export interface JWTPayload extends JwtPayload {
  userId: number;
  email: string;
}

export interface SignupRequest {
  email: string;
  password: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface CreateGenerationRequest {
  prompt: string;
  style: string;
  imageUpload: Express.Multer.File;
}

export interface GenerationResponse {
  id: number;
  imageUrl: string;
  prompt: string;
  style: string;
  createdAt: Date;
  status: string;
}

