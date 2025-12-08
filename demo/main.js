const inputValue     = document.querySelector(".form textarea"),
      generateButton = document.querySelector(".form .generateButton"),
      qrCode         = document.querySelector(".qr-code img");
let preValue;

// qr code config
let limit  = 2000,
    size   = "250x250",
    color  = "0f0e0e",
    apiUrl = "https://api.qrserver.com/v1/create-qr-code/";

qrCode.style.cursor = "pointer";

// create download link
let downloadLink = document.createElement("div");

downloadLink.className     = "download-link";
downloadLink.style.display = "none";
downloadLink.textContent   = "Download";

qrCode.parentNode.appendChild(downloadLink);

// create protocol error message element
let errorMessage = document.createElement("span");

errorMessage.className     = "error-message";
errorMessage.style.display = "none";

qrCode.parentNode.appendChild(errorMessage);

// create connection error message element
let connectionError = document.createElement("span");

connectionError.className     = "error-message";
connectionError.style.display = "none";

qrCode.parentNode.appendChild(connectionError);

// generate a qr code
function generate() {
    const value = inputValue.value.trim();

    // does not regenerate on empty input or if the input stays the same
    if (!value || value === preValue) { return; }

    // does not generate when the input is over the character limit
    if (limit > 0 && value.length > limit) { return; }
    
    if (checkProtocols(value)) {
        qrCode.src = "";
        return;
    }

    preValue   = value;
    qrCode.src = `${apiUrl}?size=${size}&color=${color}&data=${encodeURIComponent(value)}`;

    qrCode.style.cursor = "pointer";
    qrCode.title        = "Click to copy";

    downloadLink.style.display = "block";
}

// attach generate function to the generate button
generateButton.addEventListener("click", generate);

// check for dangerous protocols on input change
inputValue.addEventListener("input", () => {
    checkProtocols(inputValue.value.trim());
    offlineHandler();
});

// protocol filter function
function checkProtocols(value) {
    const unsafeProtocols = ["javascript", "data", "file", "vbscript"]; // common potentially unsafe protocols

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

        // display error message
        errorMessage.appendChild(a);
        errorMessage.appendChild(document.createTextNode("."));
        errorMessage.style.display = "block";

        // hide the download link
        downloadLink.style.display = "none";

        // add error border to the input
        inputValue.classList.add("border-error");

        // do not generate the qr code if the check fails
        console.error(`${match} protocol was blocked`);
        return true;
    }

    // generate the qr code if the check passes
    errorMessage.style.display = "none";
    inputValue.classList.remove("border-error");

    preValue = "";
    
    downloadLink.style.display = qrCode.style.visibility === "visible" ? "block" : "none";

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

// download function
downloadLink.addEventListener("click", async () => {
    const imageUrl = qrCode.src;
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

// copy a qr code using control+shift+c or meta+shift+c
window.addEventListener("keydown", ({ code, shiftKey, ctrlKey, metaKey }) => {
    if (!qrCode) { return; }

    if (code === "KeyC" && shiftKey && (ctrlKey || metaKey)) { copy(); }
});

// copy a qr code by clicking the image
qrCode.addEventListener("click", copy);

// copy function
async function copy() {
    try {
        const image = await fetch(qrCode.src),
              blob  = await image.blob();

        // write the image to the clipboard
        const clipboardItem = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([clipboardItem]);

        console.log(`Image has been copied to clipboard: ${qrCode.src}`);
    } catch (copyError) {
        console.error(`Failed to copy image: ${copyError}`);
    }
}

function updateCounter() {
    const textarea      = document.querySelector("textarea"),
          counter       = document.querySelector(".current-character-counter"),
          maxLength     = Number(textarea.getAttribute("maxlength")),
          currentLength = textarea.value.length,
          maxCounter    = document.querySelector(".character-max-count");

    counter.textContent    = currentLength.toString();
    maxCounter.textContent = maxLength.toString();

    if (currentLength === maxLength) {
        counter.style.color      = "var(--error)";
        counter.style.fontWeight = 900;
    } else {
        counter.style.color      = "gray";
        counter.style.fontWeight = 500;
    }
}

window.onload = function() {
    updateCounter();
    offlineHandler();
    downloadLink.style.display = "none";
};

window.addEventListener("online",  offlineHandler);
window.addEventListener("offline", offlineHandler);

// offline handler
function offlineHandler() {
    const connection = navigator.onLine;

    if (!connection) {
        // display error message
        connectionError.textContent   = "You are offline. QR code generation is unavailable.";
        connectionError.style.display = "block";

        // hide generate button
        generateButton.style.display       = "none";
        generateButton.style.pointerEvents = "none";

        // hide download link and qr code
        downloadLink.style.display = "none";

        qrCode.src = "";
    } else {
        connectionError.style.display = "none";

        generateButton.style.display       = "block";
        generateButton.style.pointerEvents = "all";
    }
}
