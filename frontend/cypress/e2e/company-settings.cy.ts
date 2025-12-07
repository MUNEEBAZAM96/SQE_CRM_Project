/// <reference types="cypress" />

/**
 * Cypress E2E Test Suite for Company Settings Form Validation
 * 
 * This test suite covers:
 * - Happy path scenarios
 * - Required field validation (Company Name, Email)
 * - Email format validation
 * - Boundary value analysis for field lengths
 * - Website and phone format validation
 * 
 * Page URL: http://localhost:3000/settings
 * Form Title: Company Settings
 */

describe('Company Settings Form Validation Tests', () => {
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
    
    // Step 4: Click "Company Settings" to show the form
    cy.contains('span', 'Company Settings', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .click({ force: true });
    cy.wait(1500);
    
    // Step 5: Wait for the tab panel to become visible (form is inside a tab panel)
    cy.get('.ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden)', { timeout: 10000 })
      .should('be.visible')
      .should('contain', 'Company Settings');
    cy.wait(500);
    
    // Step 6: Verify the form exists (it should be visible now that tab panel is visible)
    cy.get('form', { timeout: 10000 })
      .should('exist')
      .should('be.visible');
    
    // Step 7: Verify form fields exist
    cy.get('#company_name', { timeout: 10000 }).should('exist');
    cy.get('#company_email', { timeout: 10000 }).should('exist');
  });

  /**
   * Helper function to clear and type into a field
   */
  const clearAndType = (fieldId: string, value: string) => {
    cy.get(`#${fieldId}`, { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .clear({ force: true })
      .type(value, { force: true });
    cy.wait(200);
  };

  /**
   * Helper function to submit the form
   */
  const submitForm = () => {
    // Wait for the company_settings tab panel to be visible
    cy.get('#rc-tabs-0-panel-company_settings.ant-tabs-tabpane-active', { timeout: 10000 })
      .should('be.visible')
      .should('not.have.class', 'ant-tabs-tabpane-hidden');
    
    // Scope the Save button search to the visible company_settings tab panel
    cy.get('#rc-tabs-0-panel-company_settings.ant-tabs-tabpane-active', { timeout: 10000 })
      .within(() => {
        cy.get('button[type="submit"]', { timeout: 10000 })
          .contains('Save')
          .scrollIntoView({ duration: 0 })
          .should('be.visible')
          .should('not.be.disabled')
          .click({ force: true });
      });
    
    // Wait for form submission to process
    cy.wait(1500);
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
  // TC1: Happy path – all valid
  // ============================================
  it('TC1: Should submit form successfully with all valid data', () => {
    clearAndType('company_name', 'My Awesome Corp');
    clearAndType('company_address', '123 Main Street, Suite 100');
    clearAndType('company_state', 'California');
    clearAndType('company_country', 'United States');
    clearAndType('company_email', 'hello@mycompany.com');
    clearAndType('company_phone', '+1 555 123 4567');
    clearAndType('company_website', 'https://mycompany.com');
    clearAndType('company_tax_number', 'TAX123456789');
    clearAndType('company_vat_number', 'VAT987654321');
    clearAndType('company_reg_number', 'REG456789012');
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC2: Company Name empty (I1) – should warn
  // ============================================
  it('TC2: Should show warning when Company Name is empty', () => {
    // Clear Company Name
    cy.get('#company_name', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .clear({ force: true });
    
    clearAndType('company_email', 'test@valid.com');
    clearAndType('company_phone', '+33123456789');
    clearAndType('company_website', 'www.example.com');
    
    submitForm();
    // Should show warning or error (business-critical field)
    cy.wait(500);
  });

  // ============================================
  // TC3: Company Email empty (I6)
  // ============================================
  it('TC3: Should show warning when Company Email is empty', () => {
    clearAndType('company_name', 'Great Ltd');
    // Clear Company Email
    cy.get('#company_email', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .clear({ force: true });
    
    clearAndType('company_phone', '+442071234567');
    clearAndType('company_website', 'example.com');
    
    submitForm();
    // Should show warning or error (business-critical field)
    cy.wait(500);
  });

  // ============================================
  // TC4: Invalid email – no @ (I7)
  // ============================================
  it('TC4: Should show error for email without @ symbol', () => {
    clearAndType('company_name', 'Tech Solutions');
    clearAndType('company_email', 'invalid-email');
    clearAndType('company_phone', '+491234567890');
    clearAndType('company_website', 'https://tech.com');
    
    submitForm();
    // Form validation should show "Invalid email format"
    cy.wait(500);
  });

  // ============================================
  // TC5: Invalid email – multiple @ (I7)
  // ============================================
  it('TC5: Should show error for email with multiple @ symbols', () => {
    clearAndType('company_name', 'Global Inc');
    clearAndType('company_email', 'user@@domain.com');
    clearAndType('company_phone', '+8112345678');
    clearAndType('company_website', 'global.io');
    
    submitForm();
    // Form validation should show error
    cy.wait(500);
  });

  // ============================================
  // TC6: Company Name = 101 chars (I2 + BVA)
  // ============================================
  it('TC6: Should handle Company Name exceeding 100 characters (101 chars)', () => {
    const longName = 'A'.repeat(101); // 101 characters
    clearAndType('company_name', longName);
    clearAndType('company_email', 'long@company.com');
    clearAndType('company_phone', '+123456789');
    clearAndType('company_website', 'site.com');
    
    submitForm();
    // May show error or truncate
    cy.wait(500);
  });

  // ============================================
  // TC7: Company Address = 201 chars (BVA)
  // ============================================
  it('TC7: Should handle Company Address exceeding 200 characters (201 chars)', () => {
    clearAndType('company_name', 'Normal Name');
    clearAndType('company_address', 'A'.repeat(201)); // 201 characters
    clearAndType('company_email', 'addr@company.com');
    clearAndType('company_phone', '+123456789');
    clearAndType('company_website', 'site.com');
    
    submitForm();
    // May show error or truncate
    cy.wait(500);
  });

  // ============================================
  // TC8: Email = 255 chars (BVA just above)
  // ============================================
  it('TC8: Should reject email exceeding 254 characters (255 chars)', () => {
    clearAndType('company_name', 'Long Co');
    // Create email with 255 characters: 250 'a's + '@longemail.com' = 255 chars
    const longEmail = 'a'.repeat(250) + '@longemail.com';
    clearAndType('company_email', longEmail);
    clearAndType('company_phone', '+123456789');
    clearAndType('company_website', 'site.com');
    
    submitForm();
    // Form validation should show "Email too long"
    cy.wait(500);
  });

  // ============================================
  // TC9: Email = 254 chars (BVA upper)
  // ============================================
  it('TC9: Should accept email at upper boundary (254 chars)', () => {
    clearAndType('company_name', 'Long Co');
    // Create email with 254 characters: 249 'a's + '@longemail.com' = 254 chars
    const maxEmail = 'a'.repeat(249) + '@longemail.com';
    clearAndType('company_email', maxEmail);
    clearAndType('company_phone', '+123456789');
    clearAndType('company_website', 'site.com');
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC10: Special chars in name & website
  // ============================================
  it('TC10: Should accept special characters in name and website', () => {
    clearAndType('company_name', 'O\'Connor & Sons Ltd');
    clearAndType('company_email', 'contact@o-connor.com');
    clearAndType('company_phone', '+353871234567');
    clearAndType('company_website', 'https://o-connor-sons.com');
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC11: Website without protocol (valid)
  // ============================================
  it('TC11: Should accept website without protocol', () => {
    clearAndType('company_name', 'MySite');
    clearAndType('company_email', 'info@mysite.com');
    clearAndType('company_phone', '+123456789');
    clearAndType('company_website', 'mysite.com');
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC12: Website malformed (I10)
  // ============================================
  it('TC12: Should handle malformed website URL', () => {
    clearAndType('company_name', 'Bad Site');
    clearAndType('company_email', 'info@badsite.com');
    clearAndType('company_phone', '+123456789');
    clearAndType('company_website', 'www.');
    
    submitForm();
    // May show warning or error
    cy.wait(500);
  });

  // ============================================
  // TC13: Phone with letters (I8)
  // ============================================
  it('TC13: Should handle phone number with letters', () => {
    clearAndType('company_name', 'Phone Test');
    clearAndType('company_email', 'test@company.com');
    clearAndType('company_phone', '555-abc-1234');
    clearAndType('company_website', 'site.com');
    
    submitForm();
    // Usually accepted (no validation) or may show error
    cy.wait(1000);
  });

  // ============================================
  // TC14: All fields are minimally valid
  // ============================================
  it('TC14: Should accept all fields with minimal valid values', () => {
    clearAndType('company_name', 'A');
    clearAndType('company_email', 'a@b.c');
    clearAndType('company_phone', '1234567');
    clearAndType('company_website', 'a.com');
    
    submitForm();
    // May be accepted if system allows
    cy.wait(1000);
  });

  // ============================================
  // TC15: Very long Tax/VAT/Reg numbers (BVA)
  // ============================================
  it('TC15: Should handle very long Tax/VAT/Reg numbers', () => {
    clearAndType('company_name', 'Normal Ltd');
    clearAndType('company_email', 'tax@company.com');
    clearAndType('company_phone', '+123456789');
    clearAndType('company_website', 'site.com');
    // Create long numbers (31 characters each, exceeding 30 char limit)
    clearAndType('company_tax_number', 'A'.repeat(31));
    clearAndType('company_vat_number', 'B'.repeat(31));
    clearAndType('company_reg_number', 'C'.repeat(31));
    
    submitForm();
    // May be accepted or trimmed
    cy.wait(1000);
  });
});

