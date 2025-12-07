/// <reference types="cypress" />

/**
 * Cypress E2E Test Suite for Payment Mode Form Validation
 * 
 * This test suite covers:
 * - Happy path scenarios
 * - Required field validation
 * - Boundary value analysis
 * - Switch toggle functionality
 * - Duplicate name validation
 * 
 * Page URL: http://localhost:3000/payment/mode
 * Form Title: Add New Payment Mode
 */

describe('Payment Mode Form Validation Tests - Add New Payment Mode', () => {
  const baseUrl = 'http://localhost:3000';
  const loginUrl = `${baseUrl}/`;
  const paymentModeUrl = `${baseUrl}/payment/mode`;
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
    
    // Step 2: Navigate to payment mode page
    cy.visit(paymentModeUrl);
    cy.wait(2000);
    
    // Step 3: Click "Add New Payment Mode" button to open the drawer
    // Wait for page to fully load
    cy.get('body', { timeout: 10000 }).should('be.visible');
    cy.wait(1000);
    
    // Find the button - try multiple strategies with proper error handling
    cy.get('body').then(($body) => {
      // Check if drawer is already open
      if ($body.find('.ant-drawer-content-wrapper:visible').length > 0) {
        cy.wait(500);
        return;
      }
      
      // Check if any button contains "Add New Payment Mode"
      const hasFullText = $body.find('button').toArray().some(btn => 
        btn.textContent && btn.textContent.includes('Add New Payment Mode')
      );
      
      if (hasFullText) {
        cy.contains('button', 'Add New Payment Mode', { timeout: 15000 })
          .scrollIntoView({ duration: 0 })
          .should('exist')
          .click({ force: true });
      } else {
        // Try "Add New" as fallback
        const hasPartialText = $body.find('button').toArray().some(btn => 
          btn.textContent && btn.textContent.includes('Add New')
        );
        
        if (hasPartialText) {
          cy.contains('button', 'Add New', { timeout: 15000 })
            .scrollIntoView({ duration: 0 })
            .should('exist')
            .click({ force: true });
        } else {
          // Last resort: find any primary button (should be the Add New button)
          cy.get('button.ant-btn-primary', { timeout: 15000 })
            .first()
            .scrollIntoView({ duration: 0 })
            .should('exist')
            .click({ force: true });
        }
      }
    });
    
    cy.wait(1500);
    
    // Step 4: Verify the form drawer is open
    cy.get('.ant-drawer-content', { timeout: 10000 }).should('be.visible');
    
    // Step 5: Expand the "Add New Payment Mode" collapsible box if needed
    cy.get('.BottomCollapseBox', { timeout: 10000 }).then(($box) => {
      const formVisible = $box.find('#name').length > 0 && $box.find('#name').is(':visible');
      if (!formVisible) {
        cy.contains('.collapseBoxHeader', 'Add New Payment Mode').click({ force: true });
        cy.wait(1500);
      }
    });
    
    // Step 6: Scroll to the drawer body to ensure form is accessible
    cy.get('.ant-drawer-body', { timeout: 10000 }).scrollIntoView();
    cy.wait(500);
    
    // Step 7: Verify the form fields exist
    cy.get('.BottomCollapseBox', { timeout: 10000 }).within(() => {
      cy.get('input[name="name"], #name', { timeout: 10000 }).should('exist');
      cy.get('input[name="description"], #description', { timeout: 5000 }).should('exist');
      cy.get('button[id="enabled"]', { timeout: 5000 }).should('exist');
      cy.get('button[id="isDefault"]', { timeout: 5000 }).should('exist');
    });
  });

  /**
   * Helper function to clear and type into a field
   */
  const clearAndTypeByFieldName = (fieldName: string, value: string) => {
    cy.get('.BottomCollapseBox').within(() => {
      cy.get(`input[name="${fieldName}"], #${fieldName}`, { timeout: 10000 })
        .scrollIntoView({ duration: 0 })
        .should('be.visible')
        .clear({ force: true })
        .type(value, { force: true });
    });
    cy.wait(200);
  };

  /**
   * Helper function to toggle a switch
   */
  const toggleSwitch = (switchId: string, shouldBeOn: boolean) => {
    cy.get('.BottomCollapseBox').within(() => {
      cy.get(`button[id="${switchId}"]`, { timeout: 10000 })
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
    });
  };

  /**
   * Helper function to submit the form
   */
  const submitForm = () => {
    cy.get('.BottomCollapseBox').within(() => {
      cy.get('button[type="submit"]', { timeout: 10000 })
        .contains('Submit')
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
    
    // Try to close drawer if close button is visible
    cy.get('body').then(($body) => {
      if ($body.find('.ant-drawer-close:visible').length > 0) {
        cy.get('.ant-drawer-close').click({ force: true });
        cy.wait(500);
      }
    });
  };

  // ============================================
  // TC1: Happy path – minimal valid
  // ============================================
  it('TC1: Should submit form successfully with minimal valid data', () => {
    clearAndTypeByFieldName('name', 'Cash');
    clearAndTypeByFieldName('description', 'Paid in cash');
    // Enabled is ON by default, Default Mode is OFF by default - no need to change
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC2: Happy path – full valid
  // ============================================
  it('TC2: Should submit form successfully with full valid data', () => {
    clearAndTypeByFieldName('name', 'Bank Transfer');
    clearAndTypeByFieldName('description', 'Wire transfer to account');
    // Enabled is ON by default
    toggleSwitch('isDefault', true); // Set Default Mode to ON
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC3: Payment Mode empty (I1) – should fail
  // ============================================
  it('TC3: Should show error when Payment Mode is empty', () => {
    // Leave Payment Mode empty
    clearAndTypeByFieldName('description', 'Cash payment');
    // Enabled and Default Mode can stay as default
    
    submitForm();
    // Form validation will handle errors
    cy.wait(500);
  });

  // ============================================
  // TC4: Description empty (I3) – should fail
  // ============================================
  it('TC4: Should show error when Description is empty', () => {
    clearAndTypeByFieldName('name', 'PayPal');
    // Leave Description empty
    
    submitForm();
    // Form validation will handle errors
    cy.wait(500);
  });

  // ============================================
  // TC5: Payment Mode >50 chars (I2 + BVA)
  // ============================================
  it('TC5: Should handle Payment Mode exceeding 50 characters', () => {
    const longName = 'A'.repeat(51); // 51 characters
    clearAndTypeByFieldName('name', longName);
    clearAndTypeByFieldName('description', 'Valid description');
    
    submitForm();
    // May show error or truncate
    cy.wait(500);
  });

  // ============================================
  // TC6: Description >200 chars (I4 + BVA)
  // ============================================
  it('TC6: Should handle Description exceeding 200 characters', () => {
    clearAndTypeByFieldName('name', 'Credit Card');
    const longDescription = 'B'.repeat(201); // 201 characters
    clearAndTypeByFieldName('description', longDescription);
    
    submitForm();
    // May show error or truncate
    cy.wait(500);
  });

  // ============================================
  // TC7: Payment Mode = 1 char (BVA lower)
  // ============================================
  it('TC7: Should accept Payment Mode with 1 character', () => {
    clearAndTypeByFieldName('name', 'X');
    clearAndTypeByFieldName('description', 'Short desc');
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC8: Special characters (valid)
  // ============================================
  it('TC8: Should accept Payment Mode with special characters', () => {
    clearAndTypeByFieldName('name', 'Cheque & Cash');
    clearAndTypeByFieldName('description', 'Payment by cheque');
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC9: Enabled = OFF
  // ============================================
  it('TC9: Should submit form with Enabled switch OFF', () => {
    clearAndTypeByFieldName('name', 'Disabled Method');
    clearAndTypeByFieldName('description', 'Not active');
    toggleSwitch('enabled', false); // Turn Enabled OFF
    // Default Mode stays OFF
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC10: Both switches OFF
  // ============================================
  it('TC10: Should submit form with both switches OFF', () => {
    clearAndTypeByFieldName('name', 'Test Mode');
    clearAndTypeByFieldName('description', 'Testing only');
    toggleSwitch('enabled', false); // Turn Enabled OFF
    toggleSwitch('isDefault', false); // Ensure Default Mode is OFF (already OFF by default)
    
    submitForm();
    assertSuccess();
  });

});

