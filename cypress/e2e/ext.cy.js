describe("QR API test", () => {
  beforeEach(() => {
    cy.visit("/extension/popup.html");

    // aliases
    cy.get("textarea").as("input");
    cy.get(".generateBtn").as("generateBtn");
    cy.get(".qr-code img").as("qrImg");
    cy.get(".download-link").as("downloadLink");
    cy.get(".error-mess").as("errorMessage");
    cy.get(".con-error-mess").as("connectionErrorMessage");
    cy.get("#char-counter").as("characterCounter");
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
    cy.get("@downloadLink").should("not.be.visible");
    cy.get("@errorMessage").should("not.be.visible");
    cy.get("@connectionErrorMessage").should("not.be.visible");
  });

  it("Generates QR code", () => {
    const testUserInput = "Hello World!";
    generateQR(testUserInput);

    cy.get("@qrImg")
      .should("have.attr", "src")
      .and("include", encodeURIComponent(testUserInput));
    cy.get("@downloadLink").should("be.visible");
    cy.get("@errorMessage").should("not.be.visible");
  });

  it("Does not repeat when the input stays the same", () => {
    const testText = "Hello World!";
    generateQR(testText);

    cy.get("@qrImg").invoke("attr", "src").then((src1) => {
      cy.get("@generateBtn").click();

      cy.get("@qrImg").invoke("attr", "src").should("eq", src1);
      cy.get("@downloadLink").should("be.visible");

      cy.get("@errorMessage").should("not.be.visible");
      cy.get("@connectionErrorMessage").should("not.be.visible");
    });
  });

  it("Character counter updates", () => {
    cy.get("@input").clear().type("abcd");
    cy.get("@characterCounter").should("have.text", "4");
  });

  it("Character counter turns red when the limit is reached", () => {
    const safeText = "a";
    const maxLenghtText = safeText.repeat(2000);

    generateQR(safeText);

    cy.get("@characterCounter").should("not.have.css", "color", "rgb(233, 74, 132)");

    cy.get("@input").clear().invoke("val", maxLenghtText).trigger("input");
    cy.get("@generateBtn").click();

    cy.get("@characterCounter").should("have.have.css", "color", "rgb(233, 74, 132)").and("have.css", "font-weight", "900");

    generateQR(safeText);
    cy.get("@characterCounter").should("not.have.css", "color", "rgb(233, 74, 132)");
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
        cy.get("@errorMessage").should("not.be.visible");
        cy.get("@downloadLink").should("not.be.visible");
        cy.get("@connectionErrorMessage").should("not.be.visible");
      });
    cy.get("@errorMessage").should("not.be.visible");
    cy.get("@connectionErrorMessage").should("not.be.visible");
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

      cy.get("@downloadLink").should("not.be.visible");
      cy.get("@errorMessage").should("be.visible").and("contain", expected);
      cy.get("@connectionErrorMessage").should("not.be.visible");
    });
  });
});
