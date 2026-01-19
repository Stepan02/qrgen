// custom commands import
import "../support/commands.js";

describe("QR API test", () => {
  beforeEach(() => {
    cy.visit("/extension/popup.html");

    // aliases
    cy.get("textarea").as("input");
    cy.get(".generateBtn").as("generateBtn");
    cy.get(".qr-code img").as("qrImg");
    cy.get(".download-link").as("downloadLink");
    cy.get(".error-message").as("errorMessage");
    cy.get(".connection-error-message").as("connectionErrorMessage");
    cy.get(".current-character-counter").as("characterCounter");
    cy.get(".contract-warning-message").as("contractWarningMessage");
  });

  it("Does not generate a blank QR code", () => {
    cy.get("@qrImg").should("have.attr", "src", "");

    cy.get("@generateBtn").click();
    
    cy.get("@qrImg").should("have.attr", "src", "");               // the qr code should not appear
    cy.get("@downloadLink").should("not.be.visible");              // no download link and error messages should appear
    cy.get("@errorMessage").should("not.be.visible");
    cy.get("@connectionErrorMessage").should("not.be.visible");
    cy.get(".contract-warning-message").should("not.be.visible");  // no contrast warning should appear
  });

  it.skip("Generates QR code", () => {
    const testUserInput = "Hello World!";
    cy.generate(testUserInput);

    cy.get("@qrImg")
      .should("have.attr", "src")                                 // the qr code should appear
      .and("include", encodeURIComponent(testUserInput));         // the user input should be part of the img source
    cy.get("@downloadLink").should("be.visible");                 // the download link should be visible
    cy.get("@errorMessage").should("not.be.visible");             // no errors should be visible
    cy.get(".contract-warning-message").should("not.be.visible"); // no contrast warning should appear
  });

  it.skip("Generates QR code by pressing Shift+Enter", () => {
    const input = "Hello World!{shift+enter}";

    cy.get("@input").clear()
                    .type(input);
    cy.get("@qrImg").should("be.visible"); // the img should appear
  });

  it.skip("Does not repeat when the input stays the same", () => {
    const testText = "Hello World!";
    cy.generate(testText);

    cy.get("@qrImg").invoke("attr", "src").then((src1) => {
      cy.get("@generateBtn").click();

      cy.get("@qrImg").invoke("attr", "src")
                      .should("eq", src1);                         // first qr code should appear
      cy.get("@downloadLink").should("be.visible");                // the download link should be visible

      cy.get("@errorMessage").should("not.be.visible");             // no errors should be visible
      cy.get("@connectionErrorMessage").should("not.be.visible");
      cy.get(".contract-warning-message").should("not.be.visible"); // no contrast warning should appear
    });
  });

  it.skip("Character counter updates", () => {
    cy.get("@input").clear()
                    .type("abcd");
    cy.get("@characterCounter").should("have.text", "4");
  });

  it.skip("Character counter turns red when the limit is reached", () => {
    const safeText = "a";
    const maxLengthText = safeText.repeat(2000);

    cy.generate(safeText);

    cy.get("@characterCounter").should("not.have.css",
                                      "color",
                                      "rgb(233, 74, 132)"); // the character counter should not turn red

    cy.get("@input").clear()
                    .invoke("val", maxLengthText) 
                    .trigger("input");            // brute force input over the limit
    cy.get("@generateBtn").click();

    cy.get("@characterCounter").should("have.have.css",
                                       "color",
                                       "rgb(233, 74, 132)") // the character counter should be red
                               .and("have.css",
                                    "font-weight",
                                    "900");                 // and bold

    cy.generate(safeText);
    cy.get("@characterCounter").should("not.have.css",
                                       "color",
                                       "rgb(233, 74, 132)"); // the character counter should not be red
  });

  it.skip("Does not overflow", () => {
    const safeText = "qwerty";
    const overflow = "A".repeat(2500);

    cy.generate(safeText);

    cy.get("@qrImg")
      .should("be.visible") 
      .invoke("attr", "src")                        // the qr code should be visible and have content
      .then((initialSrc) => {
        cy.get("@input").clear()
                        .invoke("val", overflow)
                        .trigger("input");         // force the input over the limit
        cy.get("@generateBtn").click();

        cy.get("@qrImg")
          .invoke("attr", "src")
          .should("eq", initialSrc);
        cy.get("@errorMessage").should("not.be.visible");           // no errors should be visible
        cy.get("@connectionErrorMessage").should("not.be.visible");
        cy.get("@downloadLink").should("not.be.visible");           // the download link should not be visible
      });
    cy.get("@errorMessage").should("not.be.visible");               // no errors should be visible
    cy.get("@connectionErrorMessage").should("not.be.visible");
    cy.get(".contract-warning-message").should("not.be.visible");   // no contrast warning should appear
  });

  const dangerousProtocols = [
    { input: "javascript:alert(document.domain)", expected: "javascript", description: "javascript" },
    { input: "JaVaScRiPt:alert(document.domain)", expected: "javascript", description: "JaVaScRiPt" },
    { input: "javascript%3Aalert(document.domain)", expected: "javascript", description: "javascript%3A" },
    { input: "data:text/html;base64,PHNjcmlwdD5hbGVydChkb2N1bWVudC5kb21haW4pPC9zY3JpcHQ+",
      expected: "data", description: "data:text/html;base64,PHNjcmlwdD5hbGVydChkb2N1bWVudC5kb21haW4pPC9zY3JpcHQ+" },
    { input: "file:///etc/passwd", expected: "file", description: "file" },
    { input: " file:///etc/passwd", expected: "file", description: " file" },
    { input: "text\n file:///etc/passwd", expected: "file", description: "text\\n file" },
    { input: "text\ntext file:///etc/passwd", expected: "file", description: "text\\ntext file" },
    { input: "text\ntext file:///etc/passwd text", expected: "file", description: "text\\ntext file\\ntext" }
  ];

  dangerousProtocols.forEach(({ input, expected, description }) => {
    it.skip(`Does not generate QR codes with potentially malicious input: ${description}`, () => {
      cy.get("@input").clear()
                      .invoke("val", input)
                      .trigger("input");
      cy.get("@generateBtn").click();

      cy.get("@qrImg").should("not.be.visible");                    // the qr code should not generate

      cy.get("@downloadLink").should("not.be.visible");             // the download link should not be visible
      cy.get("@errorMessage").should("be.visible")
                            .and("contain", expected);              // the error message should appear
      cy.get("@connectionErrorMessage").should("not.be.visible");   // no connection error message should be visible
      cy.get(".contract-warning-message").should("not.be.visible"); // no contrast warning should appear
    });
  });
});
