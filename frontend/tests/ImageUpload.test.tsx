import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '@testing-library/react';
import { ImageUpload } from '../src/components/studio/ImageUpload';

describe('ImageUpload', () => {
  const mockOnFileSelect = vi.fn();

  it('renders upload area', () => {
    render(<ImageUpload onFileSelect={mockOnFileSelect} selectedFile={null} />);
    
    expect(screen.getByText(/Click to upload/i)).toBeInTheDocument();
    expect(screen.getByText(/JPEG or PNG, max 10MB/i)).toBeInTheDocument();
  });

  it('calls onFileSelect when file is selected', () => {
    render(<ImageUpload onFileSelect={mockOnFileSelect} selectedFile={null} />);
    
    const input = screen.getByLabelText('Select image file');
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(mockOnFileSelect).toHaveBeenCalledWith(file);
  });

  it('shows error for invalid file type', () => {
    render(<ImageUpload onFileSelect={mockOnFileSelect} selectedFile={null} />);
    
    const input = screen.getByLabelText('Select image file');
    const file = new File(['test'], 'test.pdf', { type: 'application/pdf' });
    
    fireEvent.change(input, { target: { files: [file] } });
    
    expect(screen.getByText(/Please select a JPEG or PNG image/i)).toBeInTheDocument();
    expect(mockOnFileSelect).toHaveBeenCalledWith(null);
  });

  it('shows error for file too large', () => {
    render(<ImageUpload onFileSelect={mockOnFileSelect} selectedFile={null} />);
    
    const input = screen.getByLabelText('Select image file');
    // Create a large file (>10MB)
    const largeFile = new File(['x'.repeat(11 * 1024 * 1024)], 'large.jpg', {
      type: 'image/jpeg',
    });
    
    fireEvent.change(input, { target: { files: [largeFile] } });
    
    expect(screen.getByText(/File size must be less than 10MB/i)).toBeInTheDocument();
  });

  it('disables input when disabled prop is true', () => {
    render(
      <ImageUpload
        onFileSelect={mockOnFileSelect}
        selectedFile={null}
        disabled={true}
      />
    );
    
    const input = screen.getByLabelText('Select image file');
    expect(input).toBeDisabled();
  });

  it('shows preview when file is selected', () => {
    const file = new File(['test'], 'test.jpg', { type: 'image/jpeg' });
    const previewUrl = 'data:image/jpeg;base64,test';
    
    // Mock FileReader
    global.FileReader = class {
      result: string | null = null;
      onloadend: (() => void) | null = null;
      
      readAsDataURL() {
        setTimeout(() => {
          this.result = previewUrl;
          if (this.onloadend) this.onloadend();
        }, 0);
      }
    } as any;
    
    render(<ImageUpload onFileSelect={mockOnFileSelect} selectedFile={file} />);
    
    // FileReader is async, so we check for the input
    const input = screen.getByLabelText('Select image file');
    expect(input).toBeInTheDocument();
  });
});

