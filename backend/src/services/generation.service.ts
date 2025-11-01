import { getDbClient } from '../db';
import { Generation } from '../types';
import * as fs from 'fs';
import * as path from 'path';
import * as crypto from 'crypto';

const UPLOAD_DIR = process.env.UPLOAD_DIR || './uploads';
const MAX_FILE_SIZE = parseInt(process.env.MAX_FILE_SIZE || '10485760', 10);

// Ensure upload directory exists
if (!fs.existsSync(UPLOAD_DIR)) {
  fs.mkdirSync(UPLOAD_DIR, { recursive: true });
}

export async function createGeneration(
  userId: number,
  prompt: string,
  style: string,
  originalImageUrl: string
): Promise<Generation> {
  const client = await getDbClient();
  try {
    const result = await client.query(
      `INSERT INTO generations (user_id, prompt, style, original_image_url, status)
       VALUES ($1, $2, $3, $4, 'pending')
       RETURNING *`,
      [userId, prompt, style, originalImageUrl]
    );

    return result.rows[0] as Generation;
  } finally {
    if (client.release) {
      client.release();
    }
  }
}

export async function updateGeneration(
  generationId: number,
  userId: number,
  generatedImageUrl: string | null,
  status: 'pending' | 'completed' | 'failed'
): Promise<Generation> {
  const client = await getDbClient();
  try {
    const result = await client.query(
      `UPDATE generations
       SET generated_image_url = $1, status = $2, updated_at = CURRENT_TIMESTAMP
       WHERE id = $3 AND user_id = $4
       RETURNING *`,
      [generatedImageUrl, status, generationId, userId]
    );

    if (!result.rows || result.rows.length === 0) {
      throw new Error('Generation not found');
    }

    return result.rows[0] as Generation;
  } finally {
    if (client.release) {
      client.release();
    }
  }
}

export async function getGenerationsByUserId(
  userId: number,
  limit: number = 5
): Promise<Generation[]> {
  const client = await getDbClient();
  try {
    const result = await client.query(
      `SELECT * FROM generations
       WHERE user_id = $1
       ORDER BY created_at DESC
       LIMIT $2`,
      [userId, limit]
    );

    return result.rows as Generation[];
  } finally {
    if (client.release) {
      client.release();
    }
  }
}

export function saveUploadedFile(file: Express.Multer.File): string {
  const fileExtension = path.extname(file.originalname);
  const fileName = `${crypto.randomBytes(16).toString('hex')}${fileExtension}`;
  const filePath = path.join(UPLOAD_DIR, fileName);

  fs.writeFileSync(filePath, file.buffer);
  return `/uploads/${fileName}`;
}

export function generateMockImageUrl(): string {
  // Simulate a generated image URL
  const mockId = crypto.randomBytes(8).toString('hex');
  return `/uploads/generated_${mockId}.jpg`;
}

export function shouldSimulateOverload(): boolean {
  // 20% chance of overload
  return Math.random() < 0.2;
}

export async function simulateGenerationDelay(): Promise<void> {
  // Simulate 1-2 second delay
  const delay = 1000 + Math.random() * 1000;
  return new Promise((resolve) => setTimeout(resolve, delay));
}

