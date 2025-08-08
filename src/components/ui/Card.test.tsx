import { describe, it, expect } from 'vitest';
import { render, screen } from '../../test/utils';
import { Card } from './Card';

describe('Card Component', () => {
  it('renders with default props', () => {
    render(<Card>Card content</Card>);

    const card = screen.getByText('Card content');
    expect(card).toBeInTheDocument();
    expect(card).toHaveClass(
      'bg-white',
      'rounded-lg',
      'shadow-sm',
      'border',
      'border-gray-200'
    );
  });

  it('renders children correctly', () => {
    render(
      <Card>
        <h2>Card Title</h2>
        <p>Card description</p>
      </Card>
    );

    expect(screen.getByText('Card Title')).toBeInTheDocument();
    expect(screen.getByText('Card description')).toBeInTheDocument();
  });

  it('applies custom className', () => {
    render(<Card className="custom-card">Content</Card>);

    const card = screen.getByText('Content');
    expect(card).toHaveClass('custom-card');
    // Should still have default classes
    expect(card).toHaveClass('bg-white', 'rounded-lg');
  });

  it('forwards additional props', () => {
    render(
      <Card data-testid="test-card" role="article">
        Content
      </Card>
    );

    const card = screen.getByTestId('test-card');
    expect(card).toHaveAttribute('role', 'article');
  });

  it('has correct default styling', () => {
    render(<Card>Styled content</Card>);

    const card = screen.getByText('Styled content');
    expect(card).toHaveClass(
      'bg-white',
      'rounded-lg',
      'shadow-sm',
      'border',
      'border-gray-200'
    );
  });

  it('can be used as a container for complex content', () => {
    render(
      <Card>
        <div className="p-4">
          <h3>Complex Card</h3>
          <div className="flex items-center gap-2">
            <span>Icon</span>
            <span>Text</span>
          </div>
          <button>Action</button>
        </div>
      </Card>
    );

    expect(screen.getByText('Complex Card')).toBeInTheDocument();
    expect(screen.getByText('Icon')).toBeInTheDocument();
    expect(screen.getByText('Text')).toBeInTheDocument();
    expect(screen.getByRole('button', { name: 'Action' })).toBeInTheDocument();
  });

  it('maintains semantic structure', () => {
    render(<Card>Semantic content</Card>);

    const card = screen.getByText('Semantic content');
    expect(card.tagName).toBe('DIV');
  });

  it('supports responsive design classes', () => {
    render(<Card className="md:p-6 lg:p-8">Responsive card</Card>);

    const card = screen.getByText('Responsive card');
    expect(card).toHaveClass('md:p-6', 'lg:p-8');
  });

  it('can be styled for different states', () => {
    render(
      <Card className="hover:shadow-md transition-shadow">Hoverable card</Card>
    );

    const card = screen.getByText('Hoverable card');
    expect(card).toHaveClass('hover:shadow-md', 'transition-shadow');
  });

  it('works with empty content', () => {
    render(<Card />);

    // Should render an empty div with card styling
    const cards = document.querySelectorAll('.bg-white.rounded-lg.shadow-sm');
    expect(cards).toHaveLength(1);
  });
});
