import { describe, it, expect } from 'vitest';
import { render, screen } from '@testing-library/react';

describe('Standalone Test', () => {
  it('passes a basic test', () => {
    expect(1 + 1).toBe(2);
  });

  it('renders a simple component', () => {
    const { container } = render(<div>Test Component</div>);
    expect(container.textContent).toContain('Test Component');
  });
});
