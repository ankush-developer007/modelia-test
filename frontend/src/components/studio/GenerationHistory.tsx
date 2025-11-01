import React from 'react';
import { Generation } from '../../types';

interface GenerationHistoryProps {
  generations: Generation[];
  onRestore: (generation: Generation) => void;
  disabled?: boolean;
}

export function GenerationHistory({
  generations,
  onRestore,
  disabled = false,
}: GenerationHistoryProps) {
  if (generations.length === 0) {
    return (
      <div className="text-center text-gray-500 py-8">
        <p>No generations yet. Create your first one above!</p>
      </div>
    );
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  return (
    <div className="space-y-4">
      <h2 className="text-lg font-semibold text-gray-900">Recent Generations</h2>
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {generations.map((generation) => {
          const apiBaseUrl = import.meta.env.VITE_API_URL || 'http://localhost:3000';
          const imageUrl = generation.imageUrl.startsWith('http')
            ? generation.imageUrl
            : `${apiBaseUrl}${generation.imageUrl}`;

          return (
            <div
              key={generation.id}
              className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow cursor-pointer focus-within:ring-2 focus-within:ring-blue-500"
              onClick={() => !disabled && onRestore(generation)}
              onKeyDown={(e) => {
                if (!disabled && (e.key === 'Enter' || e.key === ' ')) {
                  e.preventDefault();
                  onRestore(generation);
                }
              }}
              role="button"
              tabIndex={disabled ? -1 : 0}
              aria-label={`Restore generation from ${formatDate(generation.createdAt)}`}
            >
              <div className="aspect-square bg-gray-100 overflow-hidden">
                <img
                  src={imageUrl}
                  alt={`Generation ${generation.id}`}
                  className="w-full h-full object-cover"
                  onError={(e) => {
                    (e.target as HTMLImageElement).src =
                      'data:image/svg+xml,%3Csvg xmlns="http://www.w3.org/2000/svg" width="100" height="100"%3E%3Crect width="100" height="100" fill="%23e5e7eb"/%3E%3Ctext x="50%25" y="50%25" text-anchor="middle" dy=".3em" fill="%239ca3af" font-size="12"%3EImage%3C/text%3E%3C/svg%3E';
                  }}
                />
              </div>
              <div className="p-3 space-y-1">
                <p className="text-sm font-medium text-gray-900 truncate">
                  {generation.prompt}
                </p>
                <div className="flex items-center justify-between text-xs text-gray-500">
                  <span className="px-2 py-1 bg-blue-100 text-blue-800 rounded-full">
                    {generation.style}
                  </span>
                  <span>{formatDate(generation.createdAt)}</span>
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
}

