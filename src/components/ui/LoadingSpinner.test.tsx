import { screen } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { render } from '../../test/utils';
import LoadingSpinner from './LoadingSpinner';

describe('LoadingSpinner Component', () => {
  it('renders with default props', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('renders with small size', () => {
    render(<LoadingSpinner size="sm" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('h-4', 'w-4');
  });

  it('renders with medium size', () => {
    render(<LoadingSpinner size="md" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('h-8', 'w-8');
  });

  it('renders with large size', () => {
    render(<LoadingSpinner size="lg" />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('renders with text', () => {
    render(<LoadingSpinner text="Loading data..." />);

    expect(screen.getByText('Loading data...')).toBeInTheDocument();
  });

  it('renders without text by default', () => {
    render(<LoadingSpinner />);

    const container = screen.getByTestId('loading-spinner').parentElement;
    expect(container?.textContent).toBe('');
  });

  it('applies custom className', () => {
    render(<LoadingSpinner className="custom-spinner" />);

    const container =
      screen.getByTestId('loading-spinner').parentElement?.parentElement;
    expect(container).toHaveClass('custom-spinner');
  });

  it('has correct accessibility attributes', () => {
    render(<LoadingSpinner text="Loading..." />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveAttribute('role', 'status');
    expect(spinner).toHaveAttribute('aria-label', 'Loading');
  });

  it('has spinning animation', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('animate-spin');
  });

  it('renders with correct structure when text is provided', () => {
    render(<LoadingSpinner text="Please wait..." />);

    const container = screen.getByTestId('loading-spinner').parentElement;
    expect(container).toHaveClass(
      'flex',
      'flex-col',
      'items-center',
      'space-y-2'
    );

    const spinner = screen.getByTestId('loading-spinner');
    const text = screen.getByText('Please wait...');

    expect(spinner).toBeInTheDocument();
    expect(text).toBeInTheDocument();
  });

  it('centers content when no text is provided', () => {
    render(<LoadingSpinner />);

    const outerContainer =
      screen.getByTestId('loading-spinner').parentElement?.parentElement;
    expect(outerContainer).toHaveClass(
      'flex',
      'items-center',
      'justify-center'
    );
  });

  it('has correct color classes', () => {
    render(<LoadingSpinner />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toHaveClass('text-blue-600');
  });

  it('maintains aspect ratio', () => {
    render(<LoadingSpinner size="lg" />);

    const spinner = screen.getByTestId('loading-spinner');
    // Both width and height should be the same for square aspect ratio
    expect(spinner).toHaveClass('h-12', 'w-12');
  });

  it('is visible and accessible', () => {
    render(<LoadingSpinner text="Loading content..." />);

    const spinner = screen.getByTestId('loading-spinner');
    expect(spinner).toBeVisible();

    // Should be announced by screen readers
    expect(spinner).toHaveAttribute('role', 'status');
  });
});
