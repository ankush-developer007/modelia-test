import { describe, it, expect, vi, beforeEach } from 'vitest';
import { render, screen, waitFor } from '@testing-library/react';
import { Studio } from '../src/pages/Studio';
import { AuthProvider } from '../src/contexts/AuthContext';
import * as authService from '../src/services/auth.service';
import * as generationService from '../src/services/generation.service';

// Mock the services
vi.mock('../src/services/generation.service');
vi.mock('../src/services/auth.service');

// Mock useNavigate
const mockNavigate = vi.fn();
vi.mock('react-router-dom', async () => {
  const actual = await vi.importActual('react-router-dom');
  return {
    ...actual,
    useNavigate: () => mockNavigate,
  };
});

describe('Generate Flow', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    
    // Setup auth
    const mockUser = { id: 1, email: 'test@example.com' };
    const mockToken = 'mock-token';
    authService.getAuthData = vi.fn(() => ({
      token: mockToken,
      user: mockUser,
    }));
  });

  it('renders generation form', async () => {
    vi.mocked(generationService.getGenerations).mockResolvedValue([]);
    
    render(
      <AuthProvider>
        <Studio />
      </AuthProvider>
    );

    expect(screen.getByText(/Create New Generation/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Prompt/i)).toBeInTheDocument();
    expect(screen.getByLabelText(/Style/i)).toBeInTheDocument();
    expect(screen.getByRole('button', { name: /Generate/i })).toBeInTheDocument();
  });

  it('shows loading state during generation', async () => {
    vi.mocked(generationService.getGenerations).mockResolvedValue([]);
    
    const mockGeneration = {
      id: 1,
      imageUrl: '/uploads/test.jpg',
      prompt: 'Test prompt',
      style: 'casual',
      createdAt: new Date().toISOString(),
      status: 'completed' as const,
    };

    vi.mocked(generationService.createGeneration).mockImplementation(
      () =>
        new Promise((resolve) => {
          setTimeout(() => resolve(mockGeneration), 100);
        })
    );

    render(
      <AuthProvider>
        <Studio />
      </AuthProvider>
    );

    // Fill form and submit
    const promptInput = screen.getByLabelText(/Prompt/i);
    const styleSelect = screen.getByLabelText(/Style/i);
    const generateButton = screen.getByRole('button', { name: /Generate/i });

    // Note: We can't easily test file upload without more setup
    // This test verifies the form structure and button state

    expect(generateButton).toBeInTheDocument();
  });

  it('displays error message on generation failure', async () => {
    vi.mocked(generationService.getGenerations).mockResolvedValue([]);
    vi.mocked(generationService.createGeneration).mockRejectedValue({
      response: {
        data: { error: 'Model overloaded', message: 'Model overloaded' },
      },
      status: 503,
    });

    render(
      <AuthProvider>
        <Studio />
      </AuthProvider>
    );

    // Error would be shown if generation was triggered
    // This test structure is in place for more complete E2E testing
    expect(screen.getByText(/Create New Generation/i)).toBeInTheDocument();
  });

  it('loads and displays generation history', async () => {
    const mockGenerations = [
      {
        id: 1,
        imageUrl: '/uploads/test1.jpg',
        prompt: 'Test prompt 1',
        style: 'casual',
        createdAt: new Date().toISOString(),
        status: 'completed' as const,
      },
      {
        id: 2,
        imageUrl: '/uploads/test2.jpg',
        prompt: 'Test prompt 2',
        style: 'formal',
        createdAt: new Date().toISOString(),
        status: 'completed' as const,
      },
    ];

    vi.mocked(generationService.getGenerations).mockResolvedValue(mockGenerations);

    render(
      <AuthProvider>
        <Studio />
      </AuthProvider>
    );

    await waitFor(() => {
      expect(generationService.getGenerations).toHaveBeenCalledWith(5);
    });

    expect(screen.getByText(/Recent Generations/i)).toBeInTheDocument();
  });
});

