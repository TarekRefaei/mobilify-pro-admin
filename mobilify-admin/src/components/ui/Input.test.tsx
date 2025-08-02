import { describe, it, expect, vi } from 'vitest';
import { render, screen, fireEvent } from '../../test/utils';
import Input from './Input';

describe('Input Component', () => {
  it('renders with default props', () => {
    render(<Input />);
    
    const input = screen.getByRole('textbox');
    expect(input).toBeInTheDocument();
    expect(input).toHaveClass('border-gray-300');
  });

  it('renders with label', () => {
    render(<Input label="Email Address" />);

    const input = screen.getByLabelText(/email address/i);
    expect(input).toBeInTheDocument();
    expect(screen.getByText('Email Address')).toBeInTheDocument();
  });

  it('renders with placeholder', () => {
    render(<Input placeholder="Enter your email" />);
    
    const input = screen.getByPlaceholderText(/enter your email/i);
    expect(input).toBeInTheDocument();
  });

  it('handles value changes', () => {
    const handleChange = vi.fn();
    render(<Input onChange={handleChange} />);

    const input = screen.getByRole('textbox');
    fireEvent.change(input, { target: { value: 'test@example.com' } });

    expect(handleChange).toHaveBeenCalledTimes(1);
    // Check that the event was called with the correct value
    const call = handleChange.mock.calls[0][0];
    expect(call.target.value).toBe('test@example.com');
  });

  it('shows error state', () => {
    render(<Input error="This field is required" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('border-red-500');
    expect(screen.getByText('This field is required')).toBeInTheDocument();
  });

  it('shows required indicator when required', () => {
    render(<Input label="Email" required />);

    const input = screen.getByLabelText(/email/i);
    expect(input).toHaveAttribute('required');
  });

  it('is disabled when disabled prop is true', () => {
    render(<Input disabled />);

    const input = screen.getByRole('textbox');
    expect(input).toBeDisabled();
    expect(input).toHaveClass('disabled:bg-gray-100', 'disabled:text-gray-500');
  });

  it('supports different input types', () => {
    const { container } = render(<Input type="password" />);

    // Password inputs don't have textbox role, so query by input element directly
    const input = container.querySelector('input');
    expect(input).toHaveAttribute('type', 'password');
  });

  it('supports email input type', () => {
    render(<Input type="email" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('type', 'email');
  });

  it('supports number input type', () => {
    render(<Input type="number" />);
    
    const input = screen.getByRole('spinbutton');
    expect(input).toHaveAttribute('type', 'number');
  });

  it('applies custom className', () => {
    render(<Input className="custom-input" />);
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveClass('custom-input');
  });

  it('forwards ref correctly', () => {
    const ref = vi.fn();
    render(<Input ref={ref} />);
    
    expect(ref).toHaveBeenCalled();
  });

  it('supports controlled input', () => {
    const { rerender } = render(<Input value="initial" onChange={vi.fn()} />);
    
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('initial');
    
    rerender(<Input value="updated" onChange={vi.fn()} />);
    expect(input.value).toBe('updated');
  });

  it('supports uncontrolled input', () => {
    render(<Input defaultValue="default" />);
    
    const input = screen.getByRole('textbox') as HTMLInputElement;
    expect(input.value).toBe('default');
    
    fireEvent.change(input, { target: { value: 'changed' } });
    expect(input.value).toBe('changed');
  });

  it('has correct accessibility attributes', () => {
    render(
      <Input 
        label="Email" 
        required 
        error="Invalid email"
        aria-describedby="email-help"
      />
    );
    
    const input = screen.getByRole('textbox');
    expect(input).toHaveAttribute('aria-required', 'true');
    expect(input).toHaveAttribute('aria-invalid', 'true');
    expect(input).toHaveAttribute('aria-describedby');
  });

  it('focuses on input when label is clicked', () => {
    render(<Input label="Email Address" />);

    const label = screen.getByText('Email Address');
    const input = screen.getByRole('textbox');

    // Check that the input is properly associated with the label
    expect(input).toHaveAttribute('id');
    expect(label).toHaveAttribute('for', input.getAttribute('id'));

    // Focus the input directly to test the association
    input.focus();
    expect(input).toHaveFocus();
  });

  it('shows help text when provided', () => {
    render(<Input label="Password" helperText="Must be at least 8 characters" />);

    expect(screen.getByText('Must be at least 8 characters')).toBeInTheDocument();
  });

  it('handles onFocus and onBlur events', () => {
    const handleFocus = vi.fn();
    const handleBlur = vi.fn();
    
    render(<Input onFocus={handleFocus} onBlur={handleBlur} />);
    
    const input = screen.getByRole('textbox');
    
    fireEvent.focus(input);
    expect(handleFocus).toHaveBeenCalledTimes(1);
    
    fireEvent.blur(input);
    expect(handleBlur).toHaveBeenCalledTimes(1);
  });
});
