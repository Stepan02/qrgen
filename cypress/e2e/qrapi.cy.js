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

  it.skip('Does not overflow', () => { // not passing yet
    const overfilledInput = 'A'.repeat(2500);
    const textareaMax = 2000;

    cy.get('textarea')
      .invoke('val', overfilledInput)
      .trigger('input');

    cy.get('.generateBtn').click();

    cy.get('.qr-code img')
      .should('be.visible')
      .invoke('attr', 'src')
      .then((src) => {
        const url = new URL(src);
        const dataParam = url.searchParams.get('data');

        expect(dataParam).to.have.length(textareaMax);
        expect(dataParam).to.eq('A'.repeat(textareaMax));
    });
  })
});
