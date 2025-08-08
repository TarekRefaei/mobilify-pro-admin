import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import Button from './Button';

describe('Button Component', () => {
  it('renders with default props', () => {
    render(<Button>Click me</Button>);

    const button = screen.getByRole('button', { name: /click me/i });
    expect(button).toBeInTheDocument();
    expect(button).toHaveClass('bg-blue-600', 'text-white');
  });

  it('renders with primary variant', () => {
    render(<Button variant="primary">Primary Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-blue-600', 'text-white');
  });

  it('renders with secondary variant', () => {
    render(<Button variant="secondary">Secondary Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-gray-200', 'text-gray-900');
  });

  it('renders with danger variant', () => {
    render(<Button variant="danger">Danger Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-red-600', 'text-white');
  });

  it('renders with ghost variant', () => {
    render(<Button variant="ghost">Ghost Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('bg-transparent', 'text-gray-700');
  });

  it('handles click events', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Click me</Button>);

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('is disabled when disabled prop is true', () => {
    render(<Button disabled>Disabled Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass(
      'disabled:opacity-50',
      'disabled:pointer-events-none'
    );
  });

  it('shows loading state', () => {
    render(<Button loading>Loading Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeDisabled();
    expect(button).toHaveClass('disabled:opacity-50');
    // Check for loading spinner SVG
    const spinner = button.querySelector('svg');
    expect(spinner).toBeInTheDocument();
    expect(spinner).toHaveClass('animate-spin');
  });

  it('does not call onClick when disabled', () => {
    const handleClick = vi.fn();
    render(
      <Button disabled onClick={handleClick}>
        Disabled Button
      </Button>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('does not call onClick when loading', () => {
    const handleClick = vi.fn();
    render(
      <Button loading onClick={handleClick}>
        Loading Button
      </Button>
    );

    const button = screen.getByRole('button');
    fireEvent.click(button);

    expect(handleClick).not.toHaveBeenCalled();
  });

  it('applies custom className', () => {
    render(<Button className="custom-class">Custom Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveClass('custom-class');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Button ref={ref}>Ref Button</Button>);

    expect(ref).toHaveBeenCalled();
  });

  it('renders as button element by default', () => {
    render(<Button>Default Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toBeInTheDocument();
    expect(button.tagName).toBe('BUTTON');
  });

  it('supports keyboard navigation', () => {
    const handleClick = vi.fn();
    render(<Button onClick={handleClick}>Keyboard Button</Button>);

    const button = screen.getByRole('button');
    button.focus();

    // Test that button can receive focus
    expect(button).toHaveFocus();

    // Test that clicking the button works
    fireEvent.click(button);
    expect(handleClick).toHaveBeenCalledTimes(1);
  });

  it('has correct accessibility attributes', () => {
    render(<Button aria-label="Accessible button">Button</Button>);

    const button = screen.getByRole('button');
    expect(button).toHaveAttribute('aria-label', 'Accessible button');
  });

  it('renders children correctly', () => {
    render(
      <Button>
        <span>Icon</span>
        <span>Text</span>
      </Button>
    );

    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
  });
});
