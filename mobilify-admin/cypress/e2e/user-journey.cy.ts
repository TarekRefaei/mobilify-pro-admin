describe('Complete User Journey', () => {
  it('should complete a full restaurant management workflow', () => {
    // 1. Login
    cy.visit('/');
    cy.get('input[type="email"]').type('demo@restaurant.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('input[type="checkbox"]').check(); // Remember me
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // 2. Check dashboard metrics
    cy.contains('Dashboard');
    cy.get('[data-testid="metric-card"]', { timeout: 10000 }).should('exist');
    cy.contains('Today\'s Orders');
    cy.contains('Recent Activity');

    // 3. Navigate to menu management
    cy.get('[data-testid="sidebar-menu"]').click();
    cy.url().should('include', '/menu');
    cy.contains('Menu Management');

    // 4. Add a new menu item
    cy.get('[data-testid="add-item-button"]').click();
    cy.get('[data-testid="menu-item-form"]').should('be.visible');
    
    cy.get('input[name="name"]').type('E2E Test Burger');
    cy.get('textarea[name="description"]').type('A burger created during E2E testing');
    cy.get('input[name="price"]').type('19.99');
    cy.get('select[name="category"]').select('Main Courses');
    cy.get('input[name="imageUrl"]').type('https://example.com/test-burger.jpg');
    
    cy.get('button[type="submit"]').click();
    
    // Verify item was added
    cy.contains('E2E Test Burger').should('be.visible');

    // 5. Navigate to orders
    cy.get('[data-testid="sidebar-orders"]').click();
    cy.url().should('include', '/orders');
    cy.contains('Orders');

    // 6. Check order management interface
    cy.contains('New Orders');
    cy.contains('In Progress');
    cy.contains('Ready for Pickup');
    
    // Wait for orders to load and interact with them
    cy.get('[data-testid="order-card"]', { timeout: 10000 }).should('exist');
    
    // 7. Process an order (if available)
    cy.get('[data-testid="pending-column"]').within(() => {
      cy.get('[data-testid="order-card"]').first().within(() => {
        cy.contains('Accept').click();
      });
    });

    // Verify order moved to preparing
    cy.get('[data-testid="preparing-column"]').within(() => {
      cy.get('[data-testid="order-card"]').should('exist');
    });

    // 8. Check notifications
    cy.contains('Enable Notifications').click();
    cy.contains('Test Sound').click();

    // 9. Navigate to settings
    cy.get('[data-testid="sidebar-settings"]').click();
    cy.url().should('include', '/settings');
    cy.contains('Settings');

    // 10. Update business hours
    cy.get('[data-testid="business-hours-tab"]').click();
    cy.get('input[name="monday.open"]').clear().type('09:00');
    cy.get('input[name="monday.close"]').clear().type('22:00');
    cy.get('button[type="submit"]').click();
    
    // Should show success message
    cy.contains('Settings saved successfully');

    // 11. Check customer management
    cy.get('[data-testid="sidebar-customers"]').click();
    cy.url().should('include', '/customers');
    cy.contains('Customer Management');
    
    // Check customer analytics
    cy.get('[data-testid="customer-stats"]').should('be.visible');
    cy.contains('Total Customers');

    // 12. Check reservations
    cy.get('[data-testid="sidebar-reservations"]').click();
    cy.url().should('include', '/reservations');
    cy.contains('Reservations');
    
    // Check calendar view
    cy.get('[data-testid="calendar-view"]').should('be.visible');

    // 13. Check loyalty program
    cy.get('[data-testid="sidebar-loyalty"]').click();
    cy.url().should('include', '/loyalty');
    cy.contains('Loyalty Program');
    
    // Check program configuration
    cy.get('[data-testid="loyalty-config"]').should('be.visible');

    // 14. Check notifications/marketing
    cy.get('[data-testid="sidebar-notifications"]').click();
    cy.url().should('include', '/notifications');
    cy.contains('Push Notifications');
    
    // Check notification composer
    cy.get('[data-testid="notification-composer"]').should('be.visible');

    // 15. Return to dashboard
    cy.get('[data-testid="sidebar-dashboard"]').click();
    cy.url().should('include', '/dashboard');
    
    // Verify we're back at dashboard with updated data
    cy.contains('Dashboard');
    cy.get('[data-testid="metric-card"]').should('exist');

    // 16. Test logout
    cy.get('[data-testid="user-menu"]').click();
    cy.contains('Sign Out').click();
    cy.url().should('include', '/login');

    // 17. Test remember me functionality
    cy.visit('/dashboard');
    // Should redirect to login since we logged out
    cy.url().should('include', '/login');
    
    // Login again with remember me
    cy.get('input[type="email"]').type('demo@restaurant.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('input[type="checkbox"]').check();
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
    
    // Refresh page - should stay logged in
    cy.reload();
    cy.url().should('include', '/dashboard');
    cy.contains('Dashboard');
  });

  it('should handle error scenarios gracefully', () => {
    // Test invalid login
    cy.visit('/');
    cy.get('input[type="email"]').type('invalid@email.com');
    cy.get('input[type="password"]').type('wrongpassword');
    cy.get('button[type="submit"]').click();
    
    // Should show error message
    cy.contains('Invalid email or password');
    
    // Test network error handling (if applicable)
    // This would require mocking network requests
    
    // Test form validation
    cy.get('[data-testid="sidebar-menu"]').click();
    cy.get('[data-testid="add-item-button"]').click();
    cy.get('button[type="submit"]').click();
    
    // Should show validation errors
    cy.contains('Name is required');
    cy.contains('Price is required');
  });
});
