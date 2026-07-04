// Cypress command to interact with the vanilla-colorful color picker
Cypress.Commands.add("pickColor", { prevSubject: "element" }, (subject, colorHex) => {
    const element = subject[0];
    element.color = colorHex;

    const event = new CustomEvent("color-changed", {
        bubbles: true,
        composed: true,
        detail: { value: colorHex },
    });
    element.dispatchEvent(event);
});
