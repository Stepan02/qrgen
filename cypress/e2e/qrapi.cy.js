// custom commands import
import "../support/commands.js";

describe("QR API test", () => {
  beforeEach(() => {
    cy.visit("http://127.0.0.1:5500/main.htm");
    cy.get("#openmodal").click();

    // aliases
    cy.get("textarea").as("input");
    cy.get(".generateBtn").as("generateBtn");
    cy.get(".qr-code img").as("qrImg");
    cy.get(".download-link").as("downloadLink");
    cy.get(".error-mess").as("errorMessage");
    cy.get("#char-counter").as("characterCounter");
  });
  
  it("Does not generate a blank QR code", () => {
    cy.get("@qrImg").should("have.attr", "src", "");

    cy.get("@generateBtn").click();
    
    cy.get("@qrImg").should("have.attr", "src", "");
    cy.get("@downloadLink").should("not.be.visible");
    cy.get("@errorMessage").should("not.be.visible");
  });

  it("Generates QR code", () => {
    const testUserInput = "Hello World!";
    cy.generate(testUserInput);

    cy.get("@qrImg")
      .should("have.attr", "src")
      .and("include", encodeURIComponent(testUserInput));
    cy.get("@downloadLink").should("be.visible");
    cy.get("@errorMessage").should("not.be.visible");
  });

  it("Generates QR code by pressing Shift+Enter", () => {
    const input = "Hello World!{shift+enter}";

    cy.get("@input").clear().type(input);
    cy.get("@qrImg").should("be.visible");
  });

  it("Does not repeat when the input stays the same", () => {
    const testText = "Hello World!";
    cy.generate(testText);

    cy.get("@qrImg").invoke("attr", "src").then((src1) => {
      cy.get("@generateBtn").click();

      cy.get("@qrImg").invoke("attr", "src").should("eq", src1);
      cy.get("@downloadLink").should("be.visible");

      cy.get("@errorMessage").should("not.be.visible");
    });
  });

  it("Character counter updates", () => {
    cy.get("@input").clear().type("abcd");
    cy.get("@characterCounter").should("have.text", "4");
  });

  it("Character counter turns red when the limit is reached", () => {
    const safeText = "a";
    const maxLenghtText = safeText.repeat(2000);

    cy.generate(safeText);

    cy.get("@characterCounter").should("not.have.css", "color", "rgb(233, 74, 132)");

    cy.get("@input").clear().invoke("val", maxLenghtText).trigger("input");
    cy.get("@generateBtn").click();

    cy.get("@characterCounter").should("have.css", "color", "rgb(233, 74, 132)").and("have.css", "font-weight", "900");

    cy.generate(safeText);
    cy.get("@characterCounter").should("not.have.css", "color", "rgb(233, 74, 132)").and("have.css", "font-weight", "500");
  });

  it("Does not overflow", () => {
    const safeText = "qwerty";
    const overflow = "A".repeat(2500);

    cy.generate(safeText);

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
      });
      cy.get("@errorMessage").should("not.be.visible");
  });

  const dangerousProtocols = [
    { input: "javascript:alert(document.domain)", expected: "javascript", description: "javascript" },
    { input: "JaVaScRiPt:alert(document.domain)", expected: "javascript", description: "JaVaScRiPt" },
    { input: "javascript%3Aalert(document.domain)", expected: "javascript", description: "javascript%3A" },
    { input: "data:text/html;base64,PHNjcmlwdD5hbGVydChkb2N1bWVudC5kb21haW4pPC9zY3JpcHQ+", expected: "data", description: "data:text/html;base64,PHNjcmlwdD5hbGVydChkb2N1bWVudC5kb21haW4pPC9zY3JpcHQ+" },
    { input: "file:///etc/passwd", expected: "file", description: "file" },
    { input: " file:///etc/passwd", expected: "file", description: " file" },
    { input: "text\n file:///etc/passwd", expected: "file", description: "text\\n file" },
    { input: "text\ntext file:///etc/passwd", expected: "file", description: "text\\ntext file" },
    { input: "text\ntext file:///etc/passwd text", expected: "file", description: "text\\ntext file\\ntext" }
  ];

  dangerousProtocols.forEach(({ input, expected, description }) => {
    it(`Does not generate QR codes with potentially malicious input: ${description}`, () => {
      cy.get("@input").clear().invoke("val", input).trigger("input");
      cy.get("@generateBtn").click();

      cy.get("@qrImg").should("not.be.visible");

      cy.get("@downloadLink").should("not.be.visible");
      cy.get("@errorMessage").should("be.visible").and("contain", expected);
    });
  });
});
