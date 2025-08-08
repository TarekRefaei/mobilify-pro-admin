describe('Dashboard', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/');
    cy.get('input[type="email"]').type('demo@restaurant.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');
  });

  it('should display dashboard with key metrics', () => {
    cy.contains('Dashboard');
    cy.contains('Welcome back');

    // Check for metric cards
    cy.get('[data-testid="metric-card"]').should('have.length.at.least', 3);

    // Check specific metrics
    cy.contains("Today's Orders");
    cy.contains("Today's Sales");
    cy.contains('Pending Orders');
  });

  it('should display metric values and trends', () => {
    // Wait for metrics to load
    cy.get('[data-testid="metric-card"]', { timeout: 10000 }).should('exist');

    cy.get('[data-testid="metric-card"]').each($card => {
      cy.wrap($card).within(() => {
        // Each metric card should have a value
        cy.get('[data-testid="metric-value"]').should('be.visible');
        // And optionally a trend indicator
        cy.get('[data-testid="metric-trend"]').should('exist');
      });
    });
  });

  it('should display recent activity feed', () => {
    cy.get('[data-testid="activity-feed"]').should('be.visible');
    cy.contains('Recent Activity');

    // Check for activity items
    cy.get('[data-testid="activity-item"]').should('exist');

    cy.get('[data-testid="activity-item"]')
      .first()
      .within(() => {
        cy.get('[data-testid="activity-time"]').should('be.visible');
        cy.get('[data-testid="activity-description"]').should('be.visible');
      });
  });

  it('should display quick actions', () => {
    cy.get('[data-testid="quick-actions"]').should('be.visible');
    cy.contains('Quick Actions');

    // Check for action buttons
    cy.contains('View Orders').should('be.visible');
    cy.contains('Add Menu Item').should('be.visible');
    cy.contains('View Analytics').should('be.visible');
  });

  it('should navigate to orders from quick actions', () => {
    cy.get('[data-testid="quick-actions"]').within(() => {
      cy.contains('View Orders').click();
    });

    cy.url().should('include', '/orders');
    cy.contains('Orders');
  });

  it('should navigate to menu from quick actions', () => {
    cy.get('[data-testid="quick-actions"]').within(() => {
      cy.contains('Add Menu Item').click();
    });

    cy.url().should('include', '/menu');
    cy.contains('Menu Management');
  });

  it('should refresh dashboard data', () => {
    // Wait for initial load
    cy.get('[data-testid="metric-card"]', { timeout: 10000 }).should('exist');

    // Click refresh button if available
    cy.get('[data-testid="refresh-button"]').click();

    // Verify data is still displayed (refresh should not break the page)
    cy.get('[data-testid="metric-card"]').should('exist');
    cy.get('[data-testid="activity-feed"]').should('be.visible');
  });

  it('should handle loading states', () => {
    // Reload the page to see loading states
    cy.reload();

    // Should show loading indicators initially
    cy.get('[data-testid="loading-spinner"]').should('be.visible');

    // Then show actual content
    cy.get('[data-testid="metric-card"]', { timeout: 10000 }).should('exist');
    cy.get('[data-testid="loading-spinner"]').should('not.exist');
  });

  it('should display popular items section', () => {
    cy.get('[data-testid="popular-items"]').should('be.visible');
    cy.contains('Popular Items');

    // Check for popular item entries
    cy.get('[data-testid="popular-item"]').should('exist');

    cy.get('[data-testid="popular-item"]')
      .first()
      .within(() => {
        cy.get('[data-testid="item-name"]').should('be.visible');
        cy.get('[data-testid="item-orders"]').should('be.visible');
      });
  });

  it('should show weekly statistics', () => {
    cy.get('[data-testid="weekly-stats"]').should('be.visible');
    cy.contains('This Week');

    // Check for weekly metrics
    cy.contains('Orders').should('be.visible');
    cy.contains('Revenue').should('be.visible');
  });

  it('should handle empty states gracefully', () => {
    // This test assumes there might be empty states for new restaurants
    // The dashboard should handle cases where there's no data yet

    cy.get('[data-testid="metric-card"]').should('exist');

    // Even with no data, the structure should be present
    cy.contains("Today's Orders");
    cy.contains('Recent Activity');
    cy.contains('Quick Actions');
  });

  it('should be responsive on different screen sizes', () => {
    // Test mobile view
    cy.viewport(375, 667);
    cy.get('[data-testid="metric-card"]').should('be.visible');
    cy.get('[data-testid="activity-feed"]').should('be.visible');

    // Test tablet view
    cy.viewport(768, 1024);
    cy.get('[data-testid="metric-card"]').should('be.visible');
    cy.get('[data-testid="quick-actions"]').should('be.visible');

    // Test desktop view
    cy.viewport(1200, 800);
    cy.get('[data-testid="metric-card"]').should('be.visible');
    cy.get('[data-testid="activity-feed"]').should('be.visible');
    cy.get('[data-testid="quick-actions"]').should('be.visible');
  });
});
