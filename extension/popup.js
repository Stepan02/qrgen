const inputValue             = document.querySelector(".form textarea"),
      generateButton         = document.querySelector(".form .generateBtn"),
      qrCodeImage            = document.querySelector(".qr-code img"),
      errorMessage           = document.querySelector(".error-message"),
      connectionErrorMessage = document.querySelector(".connection-error-message"),
      downloadLink           = document.querySelector(".download-link");
let previousValue;

// qr code config
let limit  = 2000,
    size   = "250x250",
    color  = "0f0e0e",
    apiUrl = "https://api.qrserver.com/v1/create-qr-code/";

// generate a qr code
function generate() {
    const value = inputValue.value.trim();
    
    // does not regenerate on empty input or if the input stays the same
    if (!value || value === previousValue) { return; }

    // does not generate when the input is over the character limit
    if (limit > 0 && value.length > limit) { return; }

    // hide the qr code if the protocol check fails
    if (checkProtocols(value)) {
        qrCodeImage.src = "";
        return;
    }

    previousValue   = value;
    qrCodeImage.src = `${apiUrl}?size=${size}&color=${color}&data=${encodeURIComponent(value)}`;

    qrCodeImage.style.cursor = "pointer";
    qrCodeImage.title        = "Click to copy";

    downloadLink.style.display = "block";
}

// attach generate function to the generate button
generateButton.addEventListener("click", generate);

// check for dangerous protocols on input change
inputValue.addEventListener("input", () => {
    checkProtocols(inputValue.value.trim());
});

// protocol filter function
function checkProtocols(value) {
    const unsafeProtocols = [ "javascript", "data", "file", "vbscript" ]; // common potentially unsafe protocols

    let decodedValue;
    try {
        // decode uri encoding
        decodedValue = decodeURIComponent(value.toLowerCase());
    } catch {
        decodedValue = value.toLowerCase();
    }

    const regex = new RegExp(`\\b(${unsafeProtocols.join("|")}):`, "i"); // regular expression filter

    if (regex.test(decodedValue)) {
        const match = decodedValue.match(regex)[1];

        errorMessage.textContent = `The "${match}" scheme is blocked for `;
        const a = Object.assign(
            document.createElement("a"), {
                href:        "https://security.duke.edu/security-guides/qr-code-security-guide/",
                target:      "_blank",
                rel:         "noopener noreferrer",
                textContent: "security reasons"
        });

        errorMessage.appendChild(a);
        errorMessage.appendChild(document.createTextNode("."));
        errorMessage.style.display = "block";

        downloadLink.style.display = "none";
        inputValue.classList.add("border-error");

        // do not generate the qr code if the check fails
        console.error(`${match} protocol was blocked`);
        return true;
    }

    // generate the qr code if the check passes
    errorMessage.style.display = "none";
    inputValue.classList.remove("border-error");

    previousValue = "";
    downloadLink.style.display = qrCodeImage.style.visibility === "visible" ? "block" : "none";

    return false;
}

// generate a qr code using shift+enter
inputValue.addEventListener("keydown", (pressed) => {
    const { code, shiftKey } = pressed;

    if (code === "Enter" && shiftKey) {
        pressed.preventDefault();
        generate();
    }
});

// copy a qr code using control+shift+c or meta+shift+c
window.addEventListener("keydown", ({ code, shiftKey, ctrlKey, metaKey }) => {
    if (!qrCodeImage) { return; }

    if (code === "KeyC" && shiftKey && (ctrlKey || metaKey)) { void copy(); }
});

// download function
downloadLink.addEventListener("click", async () => {
    const imageUrl = qrCodeImage.src;
    if (!imageUrl) { return; }

    try {
        // fetch the image and download it
        const res  = await fetch(imageUrl),
              blob = await res.blob(),
              link = document.createElement("a");

        link.href     = URL.createObjectURL(blob);
        link.download = "qrcode.png";
        link.click();
    } catch (err) {
        console.error(`Error downloading an image: ${err}`);
    }
});

// copy function
async function copy() {
    try {
        const image = await fetch(qrCodeImage.src),
              blob  = await image.blob();

        // write the image to the clipboard
        const clipboardItem = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([clipboardItem]);

        console.log(`Image has been copied to clipboard: ${qrCodeImage.src}`);
    } catch (copyError) {
        console.error(`Failed to copy image: ${copyError}`);
    }
}

// copy a qr code by clicking the image
qrCodeImage.addEventListener("click", copy);

function updateCounter() {
    const textarea              = document.querySelector("textarea"),
          characterCounter      = document.querySelector(".current-character-counter"),
          textareaMaxLength     = Number(textarea.getAttribute("maxlength")),
          textareaCurrentLength = textarea.value.length,
          maxCharacterCount     = document.querySelector(".character-max-count");

    characterCounter.textContent  = textareaCurrentLength.toString();
    maxCharacterCount.textContent = textareaMaxLength.toString();

    if (textareaCurrentLength === textareaMaxLength) {
        characterCounter.style.color      = "var(--error)";
        characterCounter.style.fontWeight = 900;
    } else {
        characterCounter.style.color      = "gray";
        characterCounter.style.fontWeight = 500;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateCounter();
    offlineHandler();

    const textarea = document.querySelector("textarea");
    if (textarea) {
        textarea.addEventListener("input", updateCounter);
    }

    downloadLink.style.display = "none";
});

window.addEventListener("online",  offlineHandler);
window.addEventListener("offline", offlineHandler);

// offline handler
function offlineHandler() {
    const connection = navigator.onLine;
    
    if (!connection) {
        // display error message
        connectionErrorMessage.textContent   = "You are offline. QR code generation is unavailable.";
        connectionErrorMessage.style.display = "block";

        // hide generate button
        generateButton.style.visibility    = "hidden";
        generateButton.style.pointerEvents = "none";

        // hide download link and qr code
        downloadLink.style.display = "none";

        qrCodeImage.src = "";
    } else {
        connectionErrorMessage.style.display = "none";

        generateButton.style.visibility    = "visible";
        generateButton.style.pointerEvents = "all";
    }
}
