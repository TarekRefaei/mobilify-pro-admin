describe('Authentication Flow', () => {
  beforeEach(() => {
    // Visit the login page
    cy.visit('/');
  });

  it('should display login form', () => {
    cy.contains('Sign in to your account');
    cy.get('input[type="email"]').should('be.visible');
    cy.get('input[type="password"]').should('be.visible');
    cy.get('button[type="submit"]').should('contain', 'Sign In');
  });

  it('should show validation errors for empty fields', () => {
    cy.get('button[type="submit"]').click();
    cy.contains('Email is required');
    cy.contains('Password is required');
  });

  it('should show validation error for invalid email', () => {
    cy.get('input[type="email"]').type('invalid-email');
    cy.get('input[type="password"]').type('password123');
    cy.get('button[type="submit"]').click();
    cy.contains('Please enter a valid email address');
  });

  it('should successfully login with demo credentials', () => {
    cy.get('input[type="email"]').type('demo@restaurant.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('button[type="submit"]').click();

    // Should redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard');
    cy.contains('Welcome back');
  });

  it('should remember login credentials when checkbox is checked', () => {
    cy.get('input[type="email"]').type('demo@restaurant.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('input[type="checkbox"]').check();
    cy.get('button[type="submit"]').click();

    // Wait for redirect
    cy.url().should('include', '/dashboard');

    // Refresh the page
    cy.reload();

    // Should still be logged in
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard');
  });

  it('should logout successfully', () => {
    // Login first
    cy.get('input[type="email"]').type('demo@restaurant.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Logout
    cy.get('[data-testid="user-menu"]').click();
    cy.contains('Sign Out').click();

    // Should redirect to login
    cy.url().should('include', '/login');
    cy.contains('Sign in to your account');
  });

  it('should protect routes when not authenticated', () => {
    // Try to access protected route directly
    cy.visit('/orders');

    // Should redirect to login
    cy.url().should('include', '/login');
    cy.contains('Sign in to your account');
  });
});
