import { useState, useCallback, useRef } from 'react';
import { createGeneration } from '../services/generation.service';
import { Generation, ApiError } from '../types';

interface UseGenerateOptions {
  onSuccess?: (generation: Generation) => void;
  onError?: (error: string) => void;
}

const MAX_RETRIES = 3;

export function useGenerate(options: UseGenerateOptions = {}) {
  const [generation, setGeneration] = useState<Generation | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [retryCount, setRetryCount] = useState(0);
  const abortControllerRef = useRef<AbortController | null>(null);

  const executeGeneration = useCallback(
    async (prompt: string, style: string, imageFile: File): Promise<void> => {
      setLoading(true);
      setError(null);
      setRetryCount(0);

      // Create new AbortController for this request
      abortControllerRef.current = new AbortController();

      let attempt = 0;

      while (attempt <= MAX_RETRIES) {
        try {
          // Check if aborted
          if (abortControllerRef.current?.signal.aborted) {
            setError(null);
            setLoading(false);
            return;
          }

          // Exponential backoff delay before retry (skip for first attempt)
          if (attempt > 0) {
            const delay = 1000 * Math.pow(2, attempt - 1);
            await new Promise((resolve) => setTimeout(resolve, delay));
            
            // Check again after delay
            if (abortControllerRef.current?.signal.aborted) {
              setError(null);
              setLoading(false);
              return;
            }
          }

          const result = await createGeneration({
            prompt,
            style,
            imageUpload: imageFile,
          });

          setGeneration(result);
          setRetryCount(0);
          options.onSuccess?.(result);
          return;
        } catch (err: any) {
          // Handle abort
          if (err.name === 'AbortError' || abortControllerRef.current?.signal.aborted) {
            setError(null);
            setLoading(false);
            return;
          }

          const apiError: ApiError = err.response?.data || { error: 'An error occurred' };
          const errorMessage = apiError.error || apiError.message || 'Failed to generate image';

          // If it's an overload error (503), retry if possible
          if (err.response?.status === 503 && attempt < MAX_RETRIES) {
            setRetryCount(attempt + 1);
            setError(`${errorMessage} - Retrying... (${attempt + 1}/${MAX_RETRIES})`);
            attempt++;
            continue;
          } else {
            // Non-retryable error or max retries reached
            setError(errorMessage);
            setRetryCount(0);
            options.onError?.(errorMessage);
            break;
          }
        }
      }

      setLoading(false);
      abortControllerRef.current = null;
    },
    [options]
  );

  const abort = useCallback(() => {
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      setLoading(false);
      setError(null);
    }
  }, []);

  const reset = useCallback(() => {
    setGeneration(null);
    setError(null);
    setLoading(false);
    setRetryCount(0);
    if (abortControllerRef.current) {
      abortControllerRef.current.abort();
      abortControllerRef.current = null;
    }
  }, []);

  return {
    generation,
    loading,
    error,
    executeGeneration,
    abort,
    reset,
    retryCount,
    isRetrying: loading && retryCount > 0,
    canRetry: retryCount < MAX_RETRIES,
  };
}

