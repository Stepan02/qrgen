describe('QR API test', () => {
  beforeEach(() => {
    cy.visit('http://127.0.0.1:5500/main.htm');
    cy.get('#openmodal').click();
  });

  it('Does not generate a blank QR code', () => {
    cy.get('.qr-code img').should('have.attr', 'src', '');

    cy.get('.generateBtn').click();
    
    cy.get('.qr-code img').should('have.attr', 'src', '');
  })

  if('Generates QR code', () => {
    const testUserInput = 'Hello World!';

    cy.get('textarea').clear().type(testUserInput);
    cy.get('.generateBtn').click();

    cy.get('.qr-code img').should('have.attr', 'src').and('include', encodeURIComponent(testUserInput));
  });

  it('Does not repeat when the input stays the same', () => {
      const testText = 'Hello World!';

      cy.get('textarea').clear().type(testText);
      cy.get('.generateBtn').click();
      cy.get('.qr-code img').invoke('attr', 'src').then((src1) => {
        cy.get('.generateBtn').click();
        cy.get('.qr-code img').invoke('attr', 'src').should('eq', src1);
      });
    });

  it('Character counter updates', () => {
    cy.get('textarea').clear().type('abcd');
    cy.get('#char-counter').should('have.text', '4');
  });

  it('Does not overflow', () => {
    cy.get('textarea').clear().type('qwerty');
    cy.get('.generateBtn').click();

    const overflow = 'A'.repeat(2500);
    
    cy.get('.qr-code img')
      .should('be.visible')
      .invoke('attr', 'src')
      .then((initialSrc) => {
        cy.get('textarea').clear().invoke('val', overflow).trigger('input');
        cy.get('.generateBtn').click();

        cy.get('.qr-code img')
          .invoke('attr', 'src')
          .should('eq', initialSrc);
      });
  })
})
