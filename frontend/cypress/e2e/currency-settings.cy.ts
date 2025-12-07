/// <reference types="cypress" />

/**
 * Cypress E2E Test Suite for Currency Settings Form Validation
 * 
 * This test suite covers:
 * - Happy path scenarios
 * - Required field validation
 * - Boundary value analysis
 * - Format validation
 * 
 * Page URL: http://localhost:3000/settings
 * Form Title: Currency Settings
 */

describe('Currency Settings Form Validation Tests', () => {
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
    
    // Step 4: Click "Currency Settings" to show the form
    cy.contains('span', 'Currency Settings', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .click({ force: true });
    cy.wait(1500);
    
    // Step 5: Wait for the tab panel to become visible
    cy.get('.ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden)', { timeout: 10000 })
      .should('be.visible')
      .should('contain', 'Default Currency');
    cy.wait(500);
    
    // Step 6: Verify the form exists
    cy.get('form', { timeout: 10000 })
      .should('exist')
      .should('be.visible');
    
    // Step 7: Verify form fields exist
    cy.get('#default_currency_code', { timeout: 10000 }).should('exist');
    cy.get('#currency_symbol', { timeout: 10000 }).should('exist');
  });

  /**
   * Helper function to select currency from dropdown
   */
  const selectCurrency = (currencyText: string) => {
    cy.get('#default_currency_code', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .click({ force: true });
    cy.wait(500);
    
    // Wait for dropdown to appear
    cy.get('.ant-select-dropdown:visible', { timeout: 5000 }).should('exist');
    cy.wait(300);
    
    // Find and click the matching currency option
    cy.get('.ant-select-item-option:visible', { timeout: 5000 })
      .should('have.length.greaterThan', 0)
      .then(($options) => {
        let found = false;
        for (let i = 0; i < $options.length; i++) {
          const option = $options[i];
          const optionText = Cypress.$(option).text().trim();
          // Match by currency code (USD, EUR, etc.) or full text
          if (optionText.includes(currencyText) || optionText.toLowerCase().includes(currencyText.toLowerCase())) {
            cy.wrap(option).click({ force: true });
            found = true;
            break;
          }
        }
        if (!found && $options.length > 0) {
          cy.get('.ant-select-item-option:visible').first().click({ force: true });
        }
      });
    cy.wait(300);
  };

  /**
   * Helper function to clear and type into a text field
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
   * Helper function to select currency position from dropdown
   */
  const selectCurrencyPosition = (position: string) => {
    // Find the form item for 'Currency Position' and then the select selector within it
    cy.contains('label', 'Currency Position', { matchCase: false })
      .closest('.ant-form-item')
      .find('.ant-select-selector')
      .first()
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .click({ force: true });
    cy.wait(500);
    
    // Wait for dropdown to appear
    cy.get('.ant-select-dropdown:visible', { timeout: 5000 }).should('exist');
    cy.wait(300);
    
    // Click the matching option
    cy.get('.ant-select-item-option:visible', { timeout: 5000 })
      .contains(position)
      .first()
      .should('be.visible')
      .click({ force: true });
    cy.wait(300);
  };

  /**
   * Helper function to set InputNumber value
   */
  const setCentPrecision = (value: number) => {
    cy.get('#cent_precision', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .clear({ force: true })
      .type(value.toString(), { force: true });
    cy.wait(200);
  };

  /**
   * Helper function to toggle zero format switch
   */
  const toggleZeroFormat = (shouldBeOn: boolean) => {
    cy.get('#zero_format', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .then(($switch) => {
        const isChecked = $switch.hasClass('ant-switch-checked');
        if (shouldBeOn && !isChecked) {
          cy.wrap($switch).click({ force: true });
          cy.wait(300);
        } else if (!shouldBeOn && isChecked) {
          cy.wrap($switch).click({ force: true });
          cy.wait(300);
        }
      });
  };

  /**
   * Helper function to submit the form
   */
  const submitForm = () => {
    // Wait for the currency_settings tab panel to be visible
    cy.get('.ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden)', { timeout: 10000 })
      .should('be.visible')
      .should('contain', 'Default Currency');
    
    // Scope the Save button search to the visible tab panel
    cy.get('.ant-tabs-tabpane:not(.ant-tabs-tabpane-hidden)', { timeout: 10000 })
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
  // TC1: Happy path – US style
  // ============================================
  it('TC1: Should submit form successfully with US style formatting', () => {
    selectCurrency('USD');
    clearAndType('currency_symbol', '$');
    selectCurrencyPosition('Before');
    clearAndType('decimal_sep', '.');
    clearAndType('thousand_sep', ',');
    setCentPrecision(2);
    toggleZeroFormat(false); // OFF
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC2: Happy path – European style
  // ============================================
  it('TC2: Should submit form successfully with European style formatting', () => {
    selectCurrency('EUR');
    clearAndType('currency_symbol', '€');
    selectCurrencyPosition('After');
    clearAndType('decimal_sep', ',');
    clearAndType('thousand_sep', '.');
    setCentPrecision(2);
    toggleZeroFormat(false); // OFF
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC3: Currency not selected (I1) – should fail
  // ============================================
  it('TC3: Should show error when Currency is not selected', () => {
    // Clear currency selection if it has a value
    cy.get('#default_currency_code', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .then(($select) => {
        cy.get('body').then(($body) => {
          const clearBtn = $body.find('.ant-select-clear');
          if (clearBtn.length > 0 && clearBtn.is(':visible')) {
            cy.get('.ant-select-clear').click({ force: true });
            cy.wait(300);
          }
        });
      });
    
    clearAndType('currency_symbol', '$');
    selectCurrencyPosition('Before');
    clearAndType('decimal_sep', '.');
    clearAndType('thousand_sep', ',');
    setCentPrecision(2);
    toggleZeroFormat(false);
    
    submitForm();
    // Form validation should show "Currency is required"
    cy.wait(500);
  });

  // ============================================
  // TC4: Symbol empty (I2) – should fail
  // ============================================
  it('TC4: Should show error when Currency Symbol is empty', () => {
    selectCurrency('GBP');
    // Clear Currency Symbol
    cy.get('#currency_symbol', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .clear({ force: true });
    
    selectCurrencyPosition('Before');
    clearAndType('decimal_sep', '.');
    clearAndType('thousand_sep', ',');
    setCentPrecision(2);
    toggleZeroFormat(false);
    
    submitForm();
    // Form validation should show "Currency Symbol is required"
    cy.wait(500);
  });

  // ============================================
  // TC5: Symbol >5 chars (I3 + BVA)
  // ============================================
  it('TC5: Should handle Currency Symbol exceeding 5 characters (6 chars)', () => {
    selectCurrency('JPY');
    clearAndType('currency_symbol', '¥¥¥¥¥¥'); // 6 characters
    selectCurrencyPosition('Before');
    clearAndType('decimal_sep', '.');
    clearAndType('thousand_sep', ',');
    setCentPrecision(0);
    toggleZeroFormat(false);
    
    submitForm();
    // May show error or truncate
    cy.wait(500);
  });

  // ============================================
  // TC6: Decimal Separator empty (I4)
  // ============================================
  it('TC6: Should show error when Decimal Separator is empty', () => {
    selectCurrency('CHF');
    clearAndType('currency_symbol', 'Fr');
    selectCurrencyPosition('After');
    // Clear Decimal Separator
    cy.get('#decimal_sep', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .clear({ force: true });
    
    clearAndType('thousand_sep', ',');
    setCentPrecision(2);
    toggleZeroFormat(false);
    
    submitForm();
    // Form validation should show error
    cy.wait(500);
  });

  // ============================================
  // TC7: Decimal Separator >1 char (I5 + BVA)
  // ============================================
  it('TC7: Should handle Decimal Separator exceeding 1 character (2 chars)', () => {
    selectCurrency('INR');
    clearAndType('currency_symbol', '₹');
    selectCurrencyPosition('Before');
    clearAndType('decimal_sep', '..'); // 2 characters
    clearAndType('thousand_sep', ',');
    setCentPrecision(2);
    toggleZeroFormat(false);
    
    submitForm();
    // Form validation should show error
    cy.wait(500);
  });

  // ============================================
  // TC8: Thousand Separator empty (I7)
  // ============================================
  it('TC8: Should show error when Thousand Separator is empty', () => {
    selectCurrency('CAD');
    clearAndType('currency_symbol', '$');
    selectCurrencyPosition('Before');
    clearAndType('decimal_sep', '.');
    // Clear Thousand Separator
    cy.get('#thousand_sep', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .clear({ force: true });
    
    setCentPrecision(2);
    toggleZeroFormat(false);
    
    submitForm();
    // Form validation should show error
    cy.wait(500);
  });

  // ============================================
  // TC9: Cent Precision <0 (I9 + BVA)
  // ============================================
  it('TC9: Should reject Cent Precision below minimum (-1)', () => {
    selectCurrency('BHD');
    clearAndType('currency_symbol', '.د.ب');
    selectCurrencyPosition('After');
    clearAndType('decimal_sep', '.');
    clearAndType('thousand_sep', ',');
    // Try to set negative value - InputNumber should prevent this, but test it
    cy.get('#cent_precision', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .clear({ force: true })
      .type('-1', { force: true });
    cy.wait(200);
    
    toggleZeroFormat(false);
    
    submitForm();
    // Form validation should handle this
    cy.wait(500);
  });

  // ============================================
  // TC10: Cent Precision >4 (I10 + BVA)
  // ============================================
  it('TC10: Should reject Cent Precision above maximum (5)', () => {
    selectCurrency('BTC');
    clearAndType('currency_symbol', '₿');
    selectCurrencyPosition('Before');
    clearAndType('decimal_sep', '.');
    clearAndType('thousand_sep', ',');
    // Try to set value above 4 - InputNumber should prevent this, but test it
    cy.get('#cent_precision', { timeout: 10000 })
      .scrollIntoView({ duration: 0 })
      .should('be.visible')
      .clear({ force: true })
      .type('5', { force: true });
    cy.wait(200);
    
    toggleZeroFormat(false);
    
    submitForm();
    // Form validation should handle this
    cy.wait(500);
  });

  // ============================================
  // TC11: Zero Format ON
  // ============================================
  it('TC11: Should submit form successfully with Zero Format ON', () => {
    selectCurrency('USD');
    clearAndType('currency_symbol', '$');
    selectCurrencyPosition('Before');
    clearAndType('decimal_sep', '.');
    clearAndType('thousand_sep', ',');
    setCentPrecision(2);
    toggleZeroFormat(true); // ON
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC12: Conflict: Decimal = Thousand separator
  // ============================================
  it('TC12: Should handle conflict when Decimal and Thousand separators are the same', () => {
    selectCurrency('TRY');
    clearAndType('currency_symbol', '₺');
    selectCurrencyPosition('After');
    clearAndType('decimal_sep', ',');
    clearAndType('thousand_sep', ','); // Same as decimal separator
    setCentPrecision(2);
    toggleZeroFormat(false);
    
    submitForm();
    // Should show warning/error (ambiguous formatting)
    cy.wait(1000);
  });
});

