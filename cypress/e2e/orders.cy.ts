describe('Order Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/');
    cy.get('input[type="email"]').type('demo@restaurant.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Navigate to orders page
    cy.get('[data-testid="sidebar-orders"]').click();
    cy.url().should('include', '/orders');
  });

  it('should display orders page with kanban columns', () => {
    cy.contains('Orders');
    cy.contains('Manage your restaurant orders in real-time');
    
    // Check for kanban columns
    cy.contains('New Orders');
    cy.contains('In Progress');
    cy.contains('Ready for Pickup');
  });

  it('should display order cards with customer information', () => {
    // Wait for orders to load
    cy.get('[data-testid="order-card"]', { timeout: 10000 }).should('exist');
    
    // Check order card content
    cy.get('[data-testid="order-card"]').first().within(() => {
      cy.get('[data-testid="customer-name"]').should('be.visible');
      cy.get('[data-testid="order-id"]').should('be.visible');
      cy.get('[data-testid="order-time"]').should('be.visible');
      cy.get('[data-testid="order-status"]').should('be.visible');
      cy.get('[data-testid="order-total"]').should('be.visible');
    });
  });

  it('should update order status when action buttons are clicked', () => {
    // Wait for orders to load
    cy.get('[data-testid="order-card"]', { timeout: 10000 }).should('exist');
    
    // Find a pending order and accept it
    cy.get('[data-testid="order-card"]').contains('Pending').parent().within(() => {
      cy.contains('Accept').click();
    });

    // Verify the order moved to preparing column
    cy.get('[data-testid="preparing-column"]').within(() => {
      cy.get('[data-testid="order-card"]').should('exist');
    });
  });

  it('should show order details when view details is clicked', () => {
    // Wait for orders to load
    cy.get('[data-testid="order-card"]', { timeout: 10000 }).should('exist');
    
    // Click view details on first order
    cy.get('[data-testid="order-card"]').first().within(() => {
      cy.contains('View Details').click();
    });

    // Check if order details modal/page is displayed
    cy.get('[data-testid="order-details"]').should('be.visible');
    cy.contains('Order Details');
  });

  it('should filter orders by status tabs', () => {
    // Check active orders tab
    cy.contains('Active Orders').click();
    cy.get('[data-testid="order-card"]').should('exist');

    // Check archive tab
    cy.contains('Archive').click();
    // Archive might be empty, so just check the tab is active
    cy.contains('Archive').should('have.class', 'text-blue-600');
  });

  it('should enable/disable notifications', () => {
    // Check notification controls
    cy.contains('Enable Notifications').click();
    
    // Should show notification permission request or success message
    // Note: In Cypress, we can't test actual browser notifications,
    // but we can test the UI interaction
    cy.contains('Notifications').should('be.visible');
  });

  it('should test sound notification', () => {
    // Click test sound button
    cy.contains('Test Sound').click();
    
    // Should not throw any errors (sound might not play in headless mode)
    cy.contains('Test Sound').should('be.visible');
  });

  it('should handle order status transitions correctly', () => {
    // Wait for orders to load
    cy.get('[data-testid="order-card"]', { timeout: 10000 }).should('exist');
    
    // Test full order lifecycle: pending -> preparing -> ready -> completed
    cy.get('[data-testid="pending-column"]').within(() => {
      cy.get('[data-testid="order-card"]').first().within(() => {
        cy.contains('Accept').click();
      });
    });

    // Order should move to preparing
    cy.get('[data-testid="preparing-column"]').within(() => {
      cy.get('[data-testid="order-card"]').should('exist');
      cy.get('[data-testid="order-card"]').first().within(() => {
        cy.contains('Mark Ready').click();
      });
    });

    // Order should move to ready
    cy.get('[data-testid="ready-column"]').within(() => {
      cy.get('[data-testid="order-card"]').should('exist');
      cy.get('[data-testid="order-card"]').first().within(() => {
        cy.contains('Complete').click();
      });
    });

    // Order should be completed (might move to archive)
    cy.contains('Archive').click();
    cy.get('[data-testid="completed-orders"]').should('exist');
  });
});
