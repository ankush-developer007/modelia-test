import { Router } from 'express';
import {
  createGenerationHandler,
  getGenerationsHandler,
} from '../controllers/generations.controller';
import { authenticateToken } from '../middleware/auth.middleware';
import { upload } from '../middleware/upload.middleware';

const router = Router();

// All routes require authentication
router.use(authenticateToken);

// POST /generations - Create a new generation
router.post('/', upload.single('imageUpload'), createGenerationHandler);

// GET /generations?limit=5 - Get user's generations
router.get('/', getGenerationsHandler);

export default router;

