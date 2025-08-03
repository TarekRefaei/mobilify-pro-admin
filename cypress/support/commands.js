// ***********************************************
// This example commands.js shows you how to
// create various custom commands and overwrite
// existing commands.
//
// For more comprehensive examples of custom
// commands please read more here:
// https://on.cypress.io/custom-commands
// ***********************************************
//
//
// -- This is a parent command --
// Cypress.Commands.add('login', (email, password) => { ... })
//
//
// -- This is a child command --
// Cypress.Commands.add('drag', { prevSubject: 'element'}, (subject, options) => { ... })
//
//
// -- This is a dual command --
// Cypress.Commands.add('dismiss', { prevSubject: 'optional'}, (subject, options) => { ... })
//
//
// -- This will overwrite an existing command --
// Cypress.Commands.overwrite('visit', (originalFn, url, options) => { ... })

// Custom login command
Cypress.Commands.add('login', (email = 'demo@restaurant.com', password = 'demo123') => {
  cy.visit('/');
  cy.get('input[type="email"]').type(email);
  cy.get('input[type="password"]').type(password);
  cy.get('button[type="submit"]').click();
  cy.url().should('include', '/dashboard');
});

// Custom logout command
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="user-menu"]').click();
  cy.contains('Sign Out').click();
  cy.url().should('include', '/login');
});

// Seed test data command
Cypress.Commands.add('seedTestData', () => {
  // This would typically make API calls to seed the database
  // For now, we'll just visit the admin page to seed data
  cy.visit('/admin');
  cy.contains('Seed Database').click();
  cy.contains('Database seeded successfully', { timeout: 10000 });
});

// Clear test data command
Cypress.Commands.add('clearTestData', () => {
  // This would typically make API calls to clear test data
  // For now, we'll just visit the admin page
  cy.visit('/admin');
  cy.contains('Clear Database').click();
  cy.contains('Database cleared successfully', { timeout: 10000 });
});
