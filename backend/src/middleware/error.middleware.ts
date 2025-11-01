import { Request, Response, NextFunction } from 'express';
import multer from 'multer';

export interface AppError extends Error {
  statusCode?: number;
  status?: string;
}

export function errorHandler(
  err: AppError | multer.MulterError,
  _req: Request,
  res: Response,
  _next: NextFunction
): void {
  // Handle multer errors
  if (err.name === 'MulterError') {
    const multerErr = err as multer.MulterError;
    res.status(400).json({
      status: 'error',
      error: multerErr.message || 'File upload error',
    });
    return;
  }

  // Handle file validation errors (from multer fileFilter)
  if (err.message && (err.message.includes('Invalid file type') || err.message.includes('file type'))) {
    res.status(400).json({
      status: 'error',
      error: err.message,
    });
    return;
  }

  const statusCode = (err as AppError).statusCode || 500;
  const status = (err as AppError).status || 'error';

  res.status(statusCode).json({
    status,
    error: err.message || 'Internal server error',
    ...(process.env.NODE_ENV === 'development' && { stack: err.stack }),
  });
}

export function notFoundHandler(
  req: Request,
  res: Response,
  _next: NextFunction
): void {
  res.status(404).json({
    status: 'error',
    error: `Route ${req.originalUrl} not found`,
  });
}

