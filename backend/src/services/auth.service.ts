import bcrypt from 'bcrypt';
import jwt from 'jsonwebtoken';
import { getDbClient } from '../db';
import { User, JWTPayload } from '../types';

const JWT_SECRET: string = process.env.JWT_SECRET || 'default-secret-change-in-production';
const JWT_EXPIRES_IN: string = process.env.JWT_EXPIRES_IN || '7d';

export async function hashPassword(password: string): Promise<string> {
  const saltRounds = 10;
  return bcrypt.hash(password, saltRounds);
}

export async function comparePassword(
  password: string,
  hash: string
): Promise<boolean> {
  return bcrypt.compare(password, hash);
}

export function generateToken(userId: number, email: string): string {
  const payload: JWTPayload = {
    userId,
    email,
  };

  return jwt.sign(payload, JWT_SECRET, {
    expiresIn: JWT_EXPIRES_IN,
  } as jwt.SignOptions);
}

export function verifyToken(token: string): JWTPayload {
  try {
    const decoded = jwt.verify(token, JWT_SECRET) as JWTPayload;
    return decoded;
  } catch (error) {
    throw new Error('Invalid or expired token');
  }
}

export async function findUserByEmail(email: string): Promise<User | null> {
  const client = await getDbClient();
  try {
    const result = await client.query(
      'SELECT * FROM users WHERE email = $1 LIMIT 1',
      [email]
    );

    if (!result.rows || result.rows.length === 0) {
      return null;
    }

    return result.rows[0] as User;
  } finally {
    if (client.release) {
      client.release();
    }
  }
}

export async function createUser(
  email: string,
  passwordHash: string
): Promise<User> {
  const client = await getDbClient();
  try {
    const result = await client.query(
      'INSERT INTO users (email, password_hash) VALUES ($1, $2) RETURNING *',
      [email, passwordHash]
    );

    return result.rows[0] as User;
  } finally {
    if (client.release) {
      client.release();
    }
  }
}

