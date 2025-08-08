/// <reference types="cypress" />

// Custom command for login
Cypress.Commands.add(
  'login',
  (email = 'demo@mobilify.com', password = 'demo123') => {
    cy.visit('/login');
    cy.get('input[type="email"]').type(email);
    cy.get('input[type="password"]').type(password);
    cy.get('button[type="submit"]').click();

    // Wait for redirect to dashboard
    cy.url().should('include', '/dashboard');
    cy.get('[data-testid="dashboard-page"]', { timeout: 10000 }).should(
      'be.visible'
    );
  }
);

// Custom command for logout
Cypress.Commands.add('logout', () => {
  cy.get('[data-testid="logout-button"]').click();
  cy.url().should('include', '/login');
});

// Custom command to seed test data
Cypress.Commands.add('seedTestData', () => {
  cy.visit('/admin');
  cy.get('[data-testid="seed-data-button"]').click();
  cy.get('[data-testid="seed-success-message"]', { timeout: 15000 }).should(
    'be.visible'
  );
});

// Custom command to clear test data
Cypress.Commands.add('clearTestData', () => {
  cy.visit('/admin');
  cy.get('[data-testid="clear-data-button"]').click();
  cy.get('[data-testid="clear-success-message"]', { timeout: 15000 }).should(
    'be.visible'
  );
});

// Command to wait for loading to finish
Cypress.Commands.add('waitForLoading', () => {
  cy.get('[data-testid="loading-spinner"]').should('not.exist');
});

// Command to check if element is visible and contains text
Cypress.Commands.add(
  'shouldBeVisibleAndContain',
  { prevSubject: 'element' },
  (subject, text) => {
    cy.wrap(subject).should('be.visible').and('contain.text', text);
  }
);

// Command to fill form field
Cypress.Commands.add('fillField', (selector: string, value: string) => {
  cy.get(selector).clear().type(value);
});

// Command to select dropdown option
Cypress.Commands.add('selectOption', (selector: string, value: string) => {
  cy.get(selector).select(value);
});

// Command to upload file
Cypress.Commands.add('uploadFile', (selector: string, fileName: string) => {
  cy.get(selector).selectFile(`cypress/fixtures/${fileName}`);
});

// Command to check notification
Cypress.Commands.add(
  'checkNotification',
  (message: string, type: 'success' | 'error' | 'info' = 'success') => {
    cy.get(`[data-testid="notification-${type}"]`)
      .should('be.visible')
      .and('contain.text', message);
  }
);

// Command to wait for API call
Cypress.Commands.add('waitForApi', (alias: string) => {
  cy.wait(alias).its('response.statusCode').should('eq', 200);
});

// Command to mock Firebase responses
Cypress.Commands.add('mockFirebase', () => {
  cy.intercept('POST', '**/identitytoolkit.googleapis.com/**', {
    statusCode: 200,
    body: {
      idToken: 'mock-id-token',
      email: 'demo@mobilify.com',
      refreshToken: 'mock-refresh-token',
      expiresIn: '3600',
      localId: 'mock-user-id',
    },
  }).as('firebaseAuth');

  cy.intercept('POST', '**/firestore.googleapis.com/**', {
    statusCode: 200,
    body: { documents: [] },
  }).as('firestoreQuery');
});

declare global {
  // eslint-disable-next-line @typescript-eslint/no-namespace
  namespace Cypress {
    interface Chainable {
      waitForLoading(): Chainable<void>;
      shouldBeVisibleAndContain(text: string): Chainable<void>;
      fillField(selector: string, value: string): Chainable<void>;
      selectOption(selector: string, value: string): Chainable<void>;
      uploadFile(selector: string, fileName: string): Chainable<void>;
      checkNotification(
        message: string,
        type?: 'success' | 'error' | 'info'
      ): Chainable<void>;
      waitForApi(alias: string): Chainable<void>;
      mockFirebase(): Chainable<void>;
    }
  }
}
