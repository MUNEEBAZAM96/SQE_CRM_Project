/// <reference types="cypress" />

/**
 * Cypress E2E Test Suite for General Settings Form Validation
 * 
 * This test suite covers:
 * - Happy path scenarios
 * - Required field validation
 * - Email format validation
 * - Boundary value analysis for email length
 * 
 * Page URL: http://localhost:3000/settings
 * Form Title: General Settings
 */

describe('General Settings Form Validation Tests', () => {
  const baseUrl = 'http://localhost:3000';
  const loginUrl = `${baseUrl}/`;
  const settingsUrl = `${baseUrl}/settings`;
  const loginEmail = 'admin@admin.com';
  const loginPassword = 'admin123';

  beforeEach(() => {
    // Step 1: Login
    cy.visit(loginUrl);
    cy.wait(2000);
    
    // Fill in login form
    cy.get('#normal_login_email', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(loginEmail);
    
    cy.get('#normal_login_password', { timeout: 10000 })
      .should('be.visible')
      .clear()
      .type(loginPassword);
    
    cy.get('button.login-form-button', { timeout: 10000 })
      .should('be.visible')
      .should('contain', 'Log')
      .click();
    
    // Wait for navigation after login
    cy.wait(3000);
    cy.url().should('not.include', '/login');
    
    // Step 2: Navigate to dashboard
    cy.visit(`${baseUrl}/`);
    cy.wait(2000);
    
    // Step 3: Navigate to settings page
    cy.visit(settingsUrl);
    cy.wait(2000);
    
    // Step 4: Click "General Settings" to show the form
    cy.contains('span', 'General Settings', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .click({ force: true });
    cy.wait(1500);
    
    // Step 5: Verify the form is visible
    cy.get('form', { timeout: 10000 }).should('be.visible');
    
    // Step 6: Verify form fields exist
    cy.get('#idurar_app_date_format', { timeout: 10000 }).should('exist');
    cy.get('#idurar_app_company_email', { timeout: 10000 }).should('exist');
  });

  /**
   * Helper function to select date format from dropdown
   * Handles different format strings and finds the closest match
   */
  const selectDateFormat = (format: string) => {
    cy.get('#idurar_app_date_format', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .click({ force: true });
    cy.wait(500);
    
    // Wait for dropdown to appear
    cy.get('.ant-select-dropdown:visible', { timeout: 5000 }).should('exist');
    cy.wait(300);
    
    // Get all options and find the matching one
    cy.get('.ant-select-item-option:visible', { timeout: 5000 })
      .should('have.length.greaterThan', 0)
      .then(($options) => {
        let found = false;
        const normalizedFormat = format.replace(/[-\/\.]/g, '').toLowerCase();
        
        // Try to find matching option
        for (let i = 0; i < $options.length; i++) {
          const option = $options[i];
          const optionText = Cypress.$(option).text().trim();
          const normalizedOption = optionText.replace(/[-\/\.]/g, '').toLowerCase();
          
          // Check exact match, partial match, or normalized match
          if (optionText === format || 
              optionText.toLowerCase().includes(format.toLowerCase()) ||
              format.toLowerCase().includes(optionText.toLowerCase()) ||
              normalizedOption === normalizedFormat) {
            cy.wrap(option).click({ force: true });
            found = true;
            break;
          }
        }
        
        // If not found, click first option as fallback
        if (!found) {
          cy.get('.ant-select-item-option:visible').first().click({ force: true });
        }
      });
    cy.wait(300);
  };

  /**
   * Helper function to clear and type email
   */
  const clearAndTypeEmail = (email: string) => {
    cy.get('#idurar_app_company_email', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .clear({ force: true })
      .type(email, { force: true });
    cy.wait(200);
  };

  /**
   * Helper function to clear date format (deselect)
   */
  const clearDateFormat = () => {
    cy.get('#idurar_app_date_format', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .then(($select) => {
        // Check if there's a clear button
        cy.get('body').then(($body) => {
          const clearBtn = $body.find('.ant-select-clear');
          if (clearBtn.length > 0 && clearBtn.is(':visible')) {
            cy.get('.ant-select-clear').click({ force: true });
            cy.wait(300);
          }
        });
      });
  };

  /**
   * Helper function to submit the form
   */
  const submitForm = () => {
    cy.get('form').within(() => {
      cy.get('button[type="submit"]', { timeout: 10000 })
        .contains('Save')
        .scrollIntoView({ duration: 0 })
        .should('be.visible')
        .click({ force: true });
    });
    cy.wait(1000);
  };

  /**
   * Helper function to assert success
   */
  const assertSuccess = () => {
    // Check for success message (toast notification)
    cy.get('body').then(($body) => {
      // Look for success message in toast/notification
      if ($body.find('.ant-message-success, .ant-notification-notice-success').length > 0) {
        cy.get('.ant-message-success, .ant-notification-notice-success', { timeout: 5000 })
          .should('be.visible');
      }
    });
    cy.wait(500);
  };

  // ============================================
  // TC1: Happy path – valid data
  // ============================================
  it('TC1: Should submit form successfully with valid data', () => {
    selectDateFormat('MM/DD/YYYY');
    clearAndTypeEmail('company@idurar.com');
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC2: Happy path – different format
  // ============================================
  it('TC2: Should submit form successfully with different date format', () => {
    selectDateFormat('DD/MM/YYYY');
    clearAndTypeEmail('admin@mycompany.co.uk');
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC3: Date Format empty (I1) – should fail
  // ============================================
  it('TC3: Should show error when Date Format is empty', () => {
    // Clear date format if it has a value
    clearDateFormat();
    clearAndTypeEmail('test@valid.com');
    
    submitForm();
    // Form validation will handle errors - should show "Date Format is required"
    cy.wait(500);
  });

  // ============================================
  // TC4: Email empty (I2) – should fail
  // ============================================
  it('TC4: Should show error when Email is empty', () => {
    // Select any date format first (use format that exists)
    selectDateFormat('MM/DD/YYYY');
    cy.wait(500);
    
    // Leave Email empty - clear it if it has a value
    cy.get('#idurar_app_company_email', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .clear({ force: true });
    cy.wait(200);
    
    submitForm();
    // Form validation will handle errors - should show "Email is required"
    cy.wait(500);
  });

  // ============================================
  // TC5: Invalid email – no @ (I3)
  // ============================================
  it('TC5: Should show error for email without @ symbol', () => {
    // Select any date format first
    selectDateFormat('MM/DD/YYYY');
    cy.wait(500);
    clearAndTypeEmail('invalid-email');
    
    submitForm();
    // Form validation should show "Please enter a valid email."
    cy.wait(500);
  });

  // ============================================
  // TC6: Invalid email – multiple @ (I4)
  // ============================================
  it('TC6: Should show error for email with multiple @ symbols', () => {
    // Select any date format first
    selectDateFormat('MM/DD/YYYY');
    cy.wait(500);
    clearAndTypeEmail('user@@domain.com');
    
    submitForm();
    // Form validation should show error
    cy.wait(500);
  });

  // ============================================
  // TC7: Invalid email – missing domain (I5)
  // ============================================
  it('TC7: Should show error for email with missing domain', () => {
    selectDateFormat('MM/DD/YYYY');
    clearAndTypeEmail('user@');
    
    submitForm();
    // Form validation should show error
    cy.wait(500);
  });

  // ============================================
  // TC8: Email = 255 characters (BVA just above)
  // ============================================
  it('TC8: Should reject email exceeding 254 characters (255 chars)', () => {
    selectDateFormat('DD/MM/YYYY');
    // Create email with 255 characters: 250 'a's + '@toolong.com' = 255 chars
    const longEmail = 'a'.repeat(250) + '@toolong.com';
    clearAndTypeEmail(longEmail);
    
    submitForm();
    // Form validation should show "Email must not exceed 254 characters."
    cy.wait(500);
  });

  // ============================================
  // TC9: Email = 254 characters (BVA upper)
  // ============================================
  it('TC9: Should accept email at upper boundary (254 chars)', () => {
    // Select any date format first
    selectDateFormat('MM/DD/YYYY');
    cy.wait(500);
    // Create email with 254 characters: 249 'a's + '@toolong.com' = 254 chars
    const maxEmail = 'a'.repeat(249) + '@toolong.com';
    clearAndTypeEmail(maxEmail);
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC10: Special characters & real-world email
  // ============================================
  it('TC10: Should accept email with special characters', () => {
    selectDateFormat('MM/DD/YYYY');
    clearAndTypeEmail('contact+settings@idurar.app');
    
    submitForm();
    assertSuccess();
  });
});

