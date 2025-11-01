import express from 'express';
import cors from 'cors';
import dotenv from 'dotenv';
import { initializeDatabase } from './db';
import authRoutes from './routes/auth';
import generationRoutes from './routes/generations';
import { errorHandler, notFoundHandler } from './middleware/error.middleware';
import * as path from 'path';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use(cors());
app.use(express.json());
app.use(express.urlencoded({ extended: true }));

// Health check endpoint
app.get('/health', (_req, res) => {
  res.json({ status: 'ok', message: 'AI Studio API is running' });
});

// Serve uploaded files
const uploadDir = process.env.UPLOAD_DIR || './uploads';
app.use('/uploads', express.static(path.join(process.cwd(), uploadDir)));

// API Routes
app.use('/auth', authRoutes);
app.use('/generations', generationRoutes);

// Error handling middleware (must be last)
app.use(notFoundHandler);
app.use(errorHandler);

// Initialize database and start server
// Only start server if not in Jest test mode
// Allow webServer (Playwright) and direct execution to start the server
if (!process.env.JEST_WORKER_ID) {
  async function startServer() {
    try {
      await initializeDatabase();
      console.log('Database initialized');

      app.listen(PORT, () => {
        console.log(`Server is running on port ${PORT}`);
      });
    } catch (error) {
      console.error('Failed to start server:', error);
      process.exit(1);
    }
  }

  startServer();
}

export default app;

