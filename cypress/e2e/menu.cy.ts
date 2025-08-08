describe('Menu Management', () => {
  beforeEach(() => {
    // Login before each test
    cy.visit('/');
    cy.get('input[type="email"]').type('demo@restaurant.com');
    cy.get('input[type="password"]').type('demo123');
    cy.get('button[type="submit"]').click();
    cy.url().should('include', '/dashboard');

    // Navigate to menu page
    cy.get('[data-testid="sidebar-menu"]').click();
    cy.url().should('include', '/menu');
  });

  it('should display menu page with categories', () => {
    cy.contains('Menu Management');
    cy.contains('Manage your restaurant menu items');

    // Check for category tabs
    cy.get('[data-testid="category-tab"]').should('exist');
    cy.contains('All Items');
  });

  it('should display menu items in grid layout', () => {
    // Wait for menu items to load
    cy.get('[data-testid="menu-item-card"]', { timeout: 10000 }).should(
      'exist'
    );

    // Check menu item card content
    cy.get('[data-testid="menu-item-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="item-image"]').should('be.visible');
        cy.get('[data-testid="item-name"]').should('be.visible');
        cy.get('[data-testid="item-price"]').should('be.visible');
        cy.get('[data-testid="item-category"]').should('be.visible');
      });
  });

  it('should filter items by category', () => {
    // Wait for items to load
    cy.get('[data-testid="menu-item-card"]', { timeout: 10000 }).should(
      'exist'
    );

    // Click on a specific category tab
    cy.get('[data-testid="category-tab"]').contains('Appetizers').click();

    // Verify only appetizer items are shown
    cy.get('[data-testid="menu-item-card"]').each($card => {
      cy.wrap($card).within(() => {
        cy.get('[data-testid="item-category"]').should('contain', 'Appetizers');
      });
    });
  });

  it('should search for menu items', () => {
    // Wait for items to load
    cy.get('[data-testid="menu-item-card"]', { timeout: 10000 }).should(
      'exist'
    );

    // Use search functionality
    cy.get('[data-testid="search-input"]').type('burger');

    // Verify search results
    cy.get('[data-testid="menu-item-card"]').should('exist');
    cy.get('[data-testid="menu-item-card"]').each($card => {
      cy.wrap($card).within(() => {
        cy.get('[data-testid="item-name"]').should('contain.text', 'burger');
      });
    });
  });

  it('should toggle item availability', () => {
    // Wait for items to load
    cy.get('[data-testid="menu-item-card"]', { timeout: 10000 }).should(
      'exist'
    );

    // Find an available item and toggle it
    cy.get('[data-testid="menu-item-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="availability-toggle"]').click();
      });

    // Verify the item shows as unavailable
    cy.get('[data-testid="menu-item-card"]')
      .first()
      .within(() => {
        cy.contains('Unavailable').should('be.visible');
      });
  });

  it('should open add new item form', () => {
    cy.get('[data-testid="add-item-button"]').click();

    // Check if add item modal/form is displayed
    cy.get('[data-testid="menu-item-form"]').should('be.visible');
    cy.contains('Add New Menu Item');

    // Check form fields
    cy.get('input[name="name"]').should('be.visible');
    cy.get('textarea[name="description"]').should('be.visible');
    cy.get('input[name="price"]').should('be.visible');
    cy.get('select[name="category"]').should('be.visible');
  });

  it('should create a new menu item', () => {
    cy.get('[data-testid="add-item-button"]').click();
    cy.get('[data-testid="menu-item-form"]').should('be.visible');

    // Fill out the form
    cy.get('input[name="name"]').type('Test Burger');
    cy.get('textarea[name="description"]').type('A delicious test burger');
    cy.get('input[name="price"]').type('15.99');
    cy.get('select[name="category"]').select('Main Courses');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Verify the item was added
    cy.contains('Test Burger').should('be.visible');
    cy.contains('15.99').should('be.visible');
  });

  it('should edit an existing menu item', () => {
    // Wait for items to load
    cy.get('[data-testid="menu-item-card"]', { timeout: 10000 }).should(
      'exist'
    );

    // Click edit on first item
    cy.get('[data-testid="menu-item-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="edit-button"]').click();
      });

    // Check if edit form is displayed
    cy.get('[data-testid="menu-item-form"]').should('be.visible');
    cy.contains('Edit Menu Item');

    // Update the name
    cy.get('input[name="name"]').clear().type('Updated Item Name');

    // Submit the form
    cy.get('button[type="submit"]').click();

    // Verify the item was updated
    cy.contains('Updated Item Name').should('be.visible');
  });

  it('should delete a menu item', () => {
    // Wait for items to load
    cy.get('[data-testid="menu-item-card"]', { timeout: 10000 }).should(
      'exist'
    );

    // Get the name of the first item to verify deletion
    cy.get('[data-testid="menu-item-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="item-name"]').invoke('text').as('itemName');
      });

    // Click delete on first item
    cy.get('[data-testid="menu-item-card"]')
      .first()
      .within(() => {
        cy.get('[data-testid="delete-button"]').click();
      });

    // Confirm deletion
    cy.get('[data-testid="confirm-delete"]').click();

    // Verify the item was deleted
    cy.get('@itemName').then(itemName => {
      cy.contains(itemName as string).should('not.exist');
    });
  });

  it('should handle image upload for menu items', () => {
    cy.get('[data-testid="add-item-button"]').click();
    cy.get('[data-testid="menu-item-form"]').should('be.visible');

    // Test image URL input
    cy.get('input[name="imageUrl"]').type('https://example.com/burger.jpg');

    // Verify image preview
    cy.get('[data-testid="image-preview"]').should('be.visible');
    cy.get('[data-testid="image-preview"]').should(
      'have.attr',
      'src',
      'https://example.com/burger.jpg'
    );
  });
});
