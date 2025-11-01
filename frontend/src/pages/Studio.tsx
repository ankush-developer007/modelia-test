import React, { useState, useEffect } from 'react';
import { useAuth } from '../contexts/AuthContext';
import { useNavigate } from 'react-router-dom';
import { useGenerate } from '../hooks/useGenerate';
import { getGenerations } from '../services/generation.service';
import { ImageUpload } from '../components/studio/ImageUpload';
import { PromptInput } from '../components/studio/PromptInput';
import { StyleDropdown } from '../components/studio/StyleDropdown';
import { GenerationHistory } from '../components/studio/GenerationHistory';
import { Generation } from '../types';

export function Studio() {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [prompt, setPrompt] = useState('');
  const [style, setStyle] = useState('');
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [generations, setGenerations] = useState<Generation[]>([]);
  const [loadingHistory, setLoadingHistory] = useState(false);

  const {
    generation,
    loading: generating,
    error: generateError,
    executeGeneration,
    abort,
    reset: resetGeneration,
    retryCount,
    canRetry,
  } = useGenerate({
    onSuccess: async () => {
      // Refresh history after successful generation
      await loadGenerations();
      // Reset form after successful generation
      setPrompt('');
      setStyle('');
      setSelectedFile(null);
      resetGeneration();
    },
  });

  const loadGenerations = async () => {
    setLoadingHistory(true);
    try {
      const data = await getGenerations(5);
      setGenerations(data);
    } catch (error) {
      console.error('Failed to load generations:', error);
    } finally {
      setLoadingHistory(false);
    }
  };

  useEffect(() => {
    loadGenerations();
  }, []);

  const handleGenerate = async () => {
    if (!selectedFile || !prompt.trim() || !style) {
      return;
    }

    await executeGeneration(prompt, style, selectedFile);
  };

  const handleRestore = (gen: Generation) => {
    setPrompt(gen.prompt);
    setStyle(gen.style);
    // Note: We can't restore the original image file, but we restore the prompt and style
    setSelectedFile(null);
  };

  const canGenerate = selectedFile && prompt.trim() && style && !generating;

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b border-gray-200">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-4">
          <div className="flex items-center justify-between">
            <h1 className="text-2xl font-bold text-gray-900">AI Studio</h1>
            <div className="flex items-center gap-4">
              <span className="text-sm text-gray-600">{user?.email}</span>
              <button
                onClick={() => {
                  logout();
                  navigate('/login');
                }}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                Logout
              </button>
            </div>
          </div>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Left Column - Generation Form */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6 space-y-6">
              <h2 className="text-xl font-semibold text-gray-900">
                Create New Generation
              </h2>

              <ImageUpload
                onFileSelect={setSelectedFile}
                selectedFile={selectedFile}
                disabled={generating}
              />

              <PromptInput
                value={prompt}
                onChange={setPrompt}
                disabled={generating}
              />

              <StyleDropdown
                value={style}
                onChange={setStyle}
                disabled={generating}
              />

              {generateError && (
                <div
                  className="p-4 bg-red-50 border border-red-200 rounded-md"
                  role="alert"
                  aria-live="assertive"
                >
                  <div className="flex items-center justify-between">
                    <p className="text-sm text-red-800">{generateError}</p>
                    {canRetry && retryCount > 0 && (
                      <span className="text-xs text-red-600">
                        Retry {retryCount}/3
                      </span>
                    )}
                  </div>
                </div>
              )}

              <div className="flex gap-4">
                <button
                  onClick={handleGenerate}
                  disabled={!canGenerate}
                  className="flex-1 px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                >
                  {generating ? (
                    <span className="flex items-center justify-center">
                      <svg
                        className="animate-spin -ml-1 mr-3 h-5 w-5 text-white"
                        xmlns="http://www.w3.org/2000/svg"
                        fill="none"
                        viewBox="0 0 24 24"
                      >
                        <circle
                          className="opacity-25"
                          cx="12"
                          cy="12"
                          r="10"
                          stroke="currentColor"
                          strokeWidth="4"
                        />
                        <path
                          className="opacity-75"
                          fill="currentColor"
                          d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                        />
                      </svg>
                      Generating...
                    </span>
                  ) : (
                    'Generate'
                  )}
                </button>

                {generating && (
                  <button
                    onClick={abort}
                    className="px-4 py-2 bg-red-600 text-white rounded-md hover:bg-red-700 focus:outline-none focus:ring-2 focus:ring-red-500 transition-colors"
                  >
                    Abort
                  </button>
                )}
              </div>

              {generation && (
                <div className="mt-4 p-4 bg-green-50 border border-green-200 rounded-md">
                  <p className="text-sm text-green-800 font-medium mb-2">
                    Generation completed successfully!
                  </p>
                  <div className="space-y-2">
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Prompt:</span> {generation.prompt}
                    </p>
                    <p className="text-sm text-gray-700">
                      <span className="font-medium">Style:</span> {generation.style}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          {/* Right Column - History */}
          <div className="space-y-6">
            <div className="bg-white rounded-lg shadow-sm p-6">
              {loadingHistory ? (
                <div className="text-center py-8">
                  <svg
                    className="animate-spin h-8 w-8 text-blue-600 mx-auto"
                    xmlns="http://www.w3.org/2000/svg"
                    fill="none"
                    viewBox="0 0 24 24"
                  >
                    <circle
                      className="opacity-25"
                      cx="12"
                      cy="12"
                      r="10"
                      stroke="currentColor"
                      strokeWidth="4"
                    />
                    <path
                      className="opacity-75"
                      fill="currentColor"
                      d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"
                    />
                  </svg>
                </div>
              ) : (
                <GenerationHistory
                  generations={generations}
                  onRestore={handleRestore}
                  disabled={generating}
                />
              )}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}

