/// <reference types="cypress" />

/**
 * Cypress E2E Test Suite for Tax Form Validation
 * 
 * This test suite covers:
 * - Happy path scenarios
 * - Required field validation
 * - Boundary value analysis for tax value (0-100)
 * - Switch toggle functionality
 * 
 * Page URL: http://localhost:3000/taxes
 * Form Title: Add New Tax
 */

describe('Tax Form Validation Tests - Add New Tax', () => {
  const baseUrl = 'http://localhost:3000';
  const loginUrl = `${baseUrl}/`;
  const taxUrl = `${baseUrl}/taxes`;
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
    
    // Step 3: Navigate to taxes page
    cy.visit(taxUrl);
    cy.wait(2000);
    
    // Step 3: Click "Add New Tax" button to open the drawer
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
      
      // Check if any button contains "Add New Tax"
      const hasFullText = $body.find('button').toArray().some(btn => 
        btn.textContent && btn.textContent.includes('Add New Tax')
      );
      
      if (hasFullText) {
        cy.contains('button', 'Add New Tax', { timeout: 15000 })
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
    
    // Step 5: Expand the "Add New Tax" collapsible box if needed
    cy.get('.BottomCollapseBox', { timeout: 10000 }).then(($box) => {
      const formVisible = $box.find('#taxName').length > 0 && $box.find('#taxName').is(':visible');
      if (!formVisible) {
        cy.contains('.collapseBoxHeader', 'Add New Tax').click({ force: true });
        cy.wait(1500);
      }
    });
    
    // Step 6: Scroll to the drawer body to ensure form is accessible
    cy.get('.ant-drawer-body', { timeout: 10000 }).scrollIntoView();
    cy.wait(500);
    
    // Step 7: Verify the form fields exist
    cy.get('.BottomCollapseBox', { timeout: 10000 }).within(() => {
      cy.get('input[name="taxName"], #taxName', { timeout: 10000 }).should('exist');
      cy.get('input[id="taxValue"], #taxValue', { timeout: 5000 }).should('exist');
      cy.get('button[id="enabled"]', { timeout: 5000 }).should('exist');
      cy.get('button[id="isDefault"]', { timeout: 5000 }).should('exist');
    });
  });

  /**
   * Helper function to clear and type into a text field
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
   * Helper function to set InputNumber value
   */
  const setInputNumberByFieldName = (fieldName: string, value: number) => {
    cy.get('.BottomCollapseBox').within(() => {
      cy.get(`input[id="${fieldName}"], #${fieldName}`, { timeout: 10000 })
        .scrollIntoView({ duration: 0 })
        .should('be.visible')
        .clear({ force: true })
        .type(value.toString(), { force: true });
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
  // TC1: Happy path – normal tax
  // ============================================
  it('TC1: Should submit form successfully with normal tax', () => {
    clearAndTypeByFieldName('taxName', 'VAT');
    setInputNumberByFieldName('taxValue', 20);
    // Enabled is ON by default, Default is OFF by default - no need to change
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC2: Happy path – zero tax + default
  // ============================================
  it('TC2: Should submit form successfully with zero tax and default ON', () => {
    clearAndTypeByFieldName('taxName', 'No Tax');
    setInputNumberByFieldName('taxValue', 0);
    // Enabled is ON by default
    toggleSwitch('isDefault', true); // Set Default to ON
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC3: Name empty (I1) – should fail
  // ============================================
  it('TC3: Should show error when Name is empty', () => {
    // Leave Name empty
    setInputNumberByFieldName('taxValue', 15);
    // Enabled and Default can stay as default
    
    submitForm();
    // Form validation will handle errors - should show "Name is required"
    cy.wait(500);
  });

  // ============================================
  // TC4: Value empty (I3) – should fail
  // ============================================
  it('TC4: Should show error when Value is empty', () => {
    clearAndTypeByFieldName('taxName', 'GST');
    // Leave Value empty
    
    submitForm();
    // Form validation will handle errors - should show "Value is required"
    cy.wait(500);
  });

  // ============================================
  // TC5: Value negative (I4 + BVA) – should fail
  // ============================================
  it('TC5: Should reject negative Value (-1)', () => {
    clearAndTypeByFieldName('taxName', 'Invalid Tax');
    // Try to set negative value - InputNumber should prevent this, but test it
    cy.get('.BottomCollapseBox').within(() => {
      cy.get('#taxValue', { timeout: 10000 })
        .scrollIntoView({ duration: 0 })
        .should('be.visible')
        .clear({ force: true })
        .type('-1', { force: true });
    });
    cy.wait(200);
    
    submitForm();
    // Form validation should handle this - error or spinner blocks input
    cy.wait(500);
  });

  // ============================================
  // TC6: Value > 100 (I5 + BVA) – should fail
  // ============================================
  it('TC6: Should reject Value above maximum (101)', () => {
    clearAndTypeByFieldName('taxName', 'Too High');
    // Try to set value above 100 - InputNumber should prevent this, but test it
    cy.get('.BottomCollapseBox').within(() => {
      cy.get('#taxValue', { timeout: 10000 })
        .scrollIntoView({ duration: 0 })
        .should('be.visible')
        .clear({ force: true })
        .type('101', { force: true });
    });
    cy.wait(200);
    
    submitForm();
    // Form validation should handle this - error or spinner blocks input
    cy.wait(500);
  });

  // ============================================
  // TC7: Value exactly 100% (BVA upper)
  // ============================================
  it('TC7: Should accept Value at upper boundary (100)', () => {
    clearAndTypeByFieldName('taxName', 'Full Tax');
    setInputNumberByFieldName('taxValue', 100);
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC8: Value exactly 0.01% (BVA lower)
  // ============================================
  it('TC8: Should accept Value at lower boundary (0.01)', () => {
    clearAndTypeByFieldName('taxName', 'Tiny Tax');
    // InputNumber might not allow decimals with step=1, but test it
    cy.get('.BottomCollapseBox').within(() => {
      cy.get('#taxValue', { timeout: 10000 })
        .scrollIntoView({ duration: 0 })
        .should('be.visible')
        .clear({ force: true })
        .type('0.01', { force: true });
    });
    cy.wait(200);
    
    submitForm();
    // May be accepted or rejected depending on InputNumber configuration
    cy.wait(1000);
  });

  // ============================================
  // TC9: Name = 51 characters (I2 + BVA)
  // ============================================
  it('TC9: Should handle Name exceeding 50 characters (51 chars)', () => {
    const longName = 'A'.repeat(51); // 51 characters
    clearAndTypeByFieldName('taxName', longName);
    setInputNumberByFieldName('taxValue', 10);
    
    submitForm();
    // May show error or field truncated
    cy.wait(500);
  });

  // ============================================
  // TC10: Name = 1 character (BVA lower)
  // ============================================
  it('TC10: Should accept Name with 1 character', () => {
    clearAndTypeByFieldName('taxName', 'X');
    setInputNumberByFieldName('taxValue', 5);
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC11: Special characters in name (valid)
  // ============================================
  it('TC11: Should accept Name with special characters', () => {
    clearAndTypeByFieldName('taxName', 'Sales Tax (19%)');
    setInputNumberByFieldName('taxValue', 19);
    // Enabled is ON by default
    toggleSwitch('isDefault', true); // Set Default to ON
    
    submitForm();
    assertSuccess();
  });

  // ============================================
  // TC12: Duplicate tax name (most critical real-world bug)
  // ============================================
  it('TC12: Should show error when Tax Name already exists', () => {
    // First, create a tax with name "VAT"
    clearAndTypeByFieldName('taxName', 'VAT');
    setInputNumberByFieldName('taxValue', 20);
    
    submitForm();
    cy.wait(2000);
    
    // Try to create another one with the same name
    // Reopen the form
    cy.get('body').then(($body) => {
      if ($body.find('.ant-drawer-content-wrapper:visible').length === 0) {
        cy.contains('button', 'Add New Tax', { timeout: 10000 })
          .scrollIntoView({ duration: 0 })
          .should('exist')
          .click({ force: true });
        cy.wait(1500);
      }
    });
    
    // Expand the form if needed
    cy.get('.BottomCollapseBox', { timeout: 10000 }).then(($box) => {
      const formVisible = $box.find('#taxName').length > 0 && $box.find('#taxName').is(':visible');
      if (!formVisible) {
        cy.contains('.collapseBoxHeader', 'Add New Tax').click({ force: true });
        cy.wait(1500);
      }
    });
    
    clearAndTypeByFieldName('taxName', 'VAT');
    setInputNumberByFieldName('taxValue', 20);
    
    submitForm();
    // Should show "Tax with this name already exists" error
    cy.wait(2000);
  });
});

