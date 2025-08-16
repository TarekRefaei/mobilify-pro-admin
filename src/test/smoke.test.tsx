import { describe, it, expect, vi } from 'vitest';
import { render, screen } from '@testing-library/react';

// Simple test to verify the test environment works
describe('Smoke Test', () => {
  it('passes a basic test', () => {
    expect(true).toBe(true);
  });

  it('renders a simple component', () => {
    render(<div>Test Component</div>);
    expect(screen.getByText('Test Component')).toBeInTheDocument();
  });
});
