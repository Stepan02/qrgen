// command to generate a QR code
Cypress.Commands.add('generate', (text) => {
    cy.get("@input").clear().type(text);
    cy.get('@generateBtn').click();
});