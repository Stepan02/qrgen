describe("QR API test", () => {
  beforeEach(() => {
    cy.visit("/extension/popup.html");

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

  const dangerousProtocols = [
    { input: "javascript:alert(document.domain)", expected: "javascript" },
    { input: "JaVaScRiPt:alert(document.domain)", expected: "javascript" },
    { input: "javascript%3Aalert(document.domain)", expected: "javascript" },
    { input: "data:text/html;base64,PHNjcmlwdD5hbGVydChkb2N1bWVudC5kb21haW4pPC9zY3JpcHQ+", expected: "data" },
    { input: "file:///etc/passwd", expected: "file" },
    { input: " file:///etc/passwd", expected: "file" },
    { input: "text\n file:///etc/passwd", expected: "file" },
    { input: "text\ntext file:///etc/passwd", expected: "file" },
    { input: "text\ntext file:///etc/passwd text", expected: "file" }
  ];

  dangerousProtocols.forEach(({ input, expected }) => {
    it(`Does not generate QR codes with dangerous protocol: ${input}`, () => {
      cy.get("@input").clear().invoke("val", input).trigger("input");
      cy.get("@generateBtn").click();

      cy.get("@qrImg").should("not.be.visible");

      cy.get(".error-mess").should("be.visible").and("contain", expected);
    });
  });
});
