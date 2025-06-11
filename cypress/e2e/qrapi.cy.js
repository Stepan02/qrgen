describe("QR API test", () => {
  beforeEach(() => {
    cy.visit("http://127.0.0.1:5500/main.htm");
    cy.get("#openmodal").click();

    // aliases
    cy.get("textarea").as("input");
    cy.get(".generateBtn").as("generateBtn");
    cy.get(".qr-code img").as("qrImg");
  });

  // function to generate a QR code
  const generateQR = (text) => {
    cy.get("@input").clear().type(text);
    cy.get("@generateBtn").click();
  };

  it("Does not generate a blank QR code", () => {
    cy.get("@qrImg").should("have.attr", "src", "");

    cy.get("@generateBtn").click();
    
    cy.get("@qrImg").should("have.attr", "src", "");
  });

  it("Generates QR code", () => {
    const testUserInput = "Hello World!";
    generateQR(testUserInput);

    cy.get("@qrImg")
      .should("have.attr", "src")
      .and("include", encodeURIComponent(testUserInput));
  });

  it("Does not repeat when the input stays the same", () => {
    const testText = "Hello World!";
    generateQR(testText);

    cy.get("@qrImg").invoke("attr", "src").then((src1) => {
      cy.get("@generateBtn").click();
      cy.get("@qrImg").invoke("attr", "src").should("eq", src1);
    });
  });

  it("Character counter updates", () => {
    cy.get("@input").clear().type("abcd");
    cy.get("#char-counter").should("have.text", "4");
  });

  it("Does not overflow", () => {
    const safeText = "qwerty";
    const overflow = "A".repeat(2500);

    generateQR(safeText);

    cy.get("@qrImg")
      .should("be.visible")
      .invoke("attr", "src")
      .then((initialSrc) => {
        cy.get("@input").clear().invoke("val", overflow).trigger("input");
        cy.get("@generateBtn").click();

        cy.get("@qrImg")
          .invoke("attr", "src")
          .should("eq", initialSrc);
      });
  });

  ["javascript:", "data:", "file:", "vbscript:"].forEach((protocol) => {
    it(`Does not generate QR codes with dangerous protocol: ${protocol}`, () => {
      cy.get("@input").clear().invoke("val", protocol).trigger("input");
      cy.get("@generateBtn").click();

      cy.get("@qrImg").should("not.be.visible");
    });
  });
});
