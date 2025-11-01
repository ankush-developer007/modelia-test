import { Response, NextFunction } from 'express';
import { z } from 'zod';
import { AuthRequest, GenerationResponse } from '../types';
import {
  createGeneration,
  updateGeneration,
  getGenerationsByUserId,
  saveUploadedFile,
  generateMockImageUrl,
  shouldSimulateOverload,
  simulateGenerationDelay,
} from '../services/generation.service';

// Validation schema
const createGenerationSchema = z.object({
  prompt: z.string().min(1, 'Prompt is required').max(1000, 'Prompt is too long'),
  style: z.string().min(1, 'Style is required'),
});

export async function createGenerationHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    // Validate input
    const validationResult = createGenerationSchema.safeParse(req.body);
    if (!validationResult.success) {
      res.status(400).json({
        error: 'Validation failed',
        details: validationResult.error.errors,
      });
      return;
    }

    const { prompt, style } = validationResult.data;

    // Check if file was uploaded
    if (!req.file) {
      res.status(400).json({ error: 'Image file is required' });
      return;
    }

    // Save uploaded file
    const originalImageUrl = saveUploadedFile(req.file);

    // Create generation record
    const generation = await createGeneration(
      req.userId,
      prompt,
      style,
      originalImageUrl
    );

    // Simulate generation delay (1-2 seconds)
    await simulateGenerationDelay();

    // Simulate 20% chance of overload error
    if (shouldSimulateOverload()) {
      await updateGeneration(generation.id, req.userId, null, 'failed');
      res.status(503).json({
        error: 'Model overloaded',
        message: 'Model overloaded',
        generationId: generation.id,
      });
      return;
    }

    // Generate mock image URL
    const generatedImageUrl = generateMockImageUrl();
    
    // Update generation with result
    const updatedGeneration = await updateGeneration(
      generation.id,
      req.userId,
      generatedImageUrl,
      'completed'
    );

    const response: GenerationResponse = {
      id: updatedGeneration.id,
      imageUrl: updatedGeneration.generated_image_url || generatedImageUrl,
      prompt: updatedGeneration.prompt,
      style: updatedGeneration.style,
      createdAt: updatedGeneration.created_at,
      status: updatedGeneration.status,
    };

    res.status(201).json(response);
  } catch (error) {
    next(error);
  }
}

export async function getGenerationsHandler(
  req: AuthRequest,
  res: Response,
  next: NextFunction
): Promise<void> {
  try {
    if (!req.userId) {
      res.status(401).json({ error: 'Unauthorized' });
      return;
    }

    const limit = parseInt(req.query.limit as string) || 5;
    const limitNumber = Math.min(Math.max(1, limit), 100); // Clamp between 1 and 100

    const generations = await getGenerationsByUserId(req.userId, limitNumber);

    const response: GenerationResponse[] = generations.map((gen) => ({
      id: gen.id,
      imageUrl: gen.generated_image_url || gen.original_image_url,
      prompt: gen.prompt,
      style: gen.style,
      createdAt: gen.created_at,
      status: gen.status,
    }));

    res.json(response);
  } catch (error) {
    next(error);
  }
}

