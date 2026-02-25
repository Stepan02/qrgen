const inputValue             = document.querySelector(".form textarea"),
      generateButton         = document.querySelector(".form .generateBtn"),
      qrCodeImage            = document.querySelector(".qr-code img"),
      qrCodeColor            = document.querySelector(".form #color"),
      qrCodeBackgroundColor  = document.querySelector(".form #backgroundColor"),
      qrCodeSize             = document.querySelector(".form #size"),
      errorMessage           = document.querySelector(".error-message"),
      connectionErrorMessage = document.querySelector(".connection-error-message"),
      imageContrastWarning   = document.querySelector(".contrast-warning-message"),
      downloadLink           = document.querySelector(".download-link");
let previousValue,
    previousColor,
    previousBackgroundColor,
    previousSize;

// qr code config
let limit = 2000,
    apiUrl = "https://api.qrserver.com/v1/create-qr-code/";

qrCodeImage.style.cursor = "pointer";

// convert hex color to rgb
function convertHexToRgb(hex) {
    // cut # from the hex
    hex = hex.replace("#", "");

    // expand shorthand code
    if (hex.length === 3) {
        hex = hex.split("").map(c => c + c).join("");
    }
    const r = parseInt(hex.slice(0, 2), 16);
    const g = parseInt(hex.slice(2, 4), 16);
    const b = parseInt(hex.slice(4, 6), 16);

    return { r, g, b };
}

// get rgb color luminance - https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html?utm_source=copilot.com
function luminance(r, g, b) {
    const a = [r, g, b].map((v) => {
        v /= 255;
        return v <= 0.03928
            ? v / 12.92
            : Math.pow((v + 0.055) / 1.055, 2.4);
    });

    return a[0] * 0.2126 + a[1] * 0.7152 + a[2] * 0.0722;
}

// get contrast ratio between 2 rgb colors
function getContrastRatio(rgb1, rgb2) {
    const luminance1 = luminance(rgb1.r, rgb1.g, rgb1.b);
    const luminance2 = luminance(rgb2.r, rgb2.g, rgb2.b);

    const bright = Math.max(luminance1, luminance2);
    const dark   = Math.min(luminance1, luminance2);

    return (bright + 0.05) / (dark + 0.05);
}

// generate a qr code
function generate() {
    const value           = inputValue.value.trim(),
          color           = qrCodeColor.value.substring(1, 7),           // remove # from the hex code
          backgroundColor = qrCodeBackgroundColor.value.substring(1, 7), // remove # from the hex code
          size            = qrCodeSize.value;

    // does not generate on empty input
    if (!value) { return; }

    // does not regenerate if the input, the colors and the size stay the same
    if (value === previousValue &&
        color === previousColor &&
        backgroundColor === previousBackgroundColor &&
        size === previousSize) {
        return;
    }

    // does not generate when the input is over the character limit
    if (limit > 0 && value.length > limit) { return; }

    // convert hex colors to rgb
    let rgbColor           = convertHexToRgb(color);
    let rgbBackgroundColor = convertHexToRgb(backgroundColor);

    // add a warning if the user generated a qr code with bad color contrast 
    // the contrast ratio should be over 4.5 (https://www.w3.org/WAI/WCAG21/Techniques/general/G174)
    if (getContrastRatio(rgbColor, rgbBackgroundColor) < 4.5) {
        imageContrastWarning.textContent = "This color combination might render the QR code unreadable.";

        imageContrastWarning.style.display = "block";

        console.warn(`This color combination (#${color} - #${backgroundColor}) might render the QR code unreadable`);
    } else {
        imageContrastWarning.style.display = "none";
    }

    if (checkProtocols(value)) {
        qrCodeImage.src = "";
        return;
    }

    previousValue           = value;
    previousColor           = color;
    previousBackgroundColor = backgroundColor;

    qrCodeImage.src = `${apiUrl}?size=${encodeURIComponent(size)}x${encodeURIComponent(size)}`
                             + `&color=${encodeURIComponent(color)}`
                             + `&bgcolor=${encodeURIComponent(backgroundColor)}`
                             + `&data=${encodeURIComponent(value)}`;

    qrCodeImage.style.cursor = "pointer";
    qrCodeImage.title        = "Click to copy";

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

// copy a qr code using control+shift+c or meta+shift+c
window.addEventListener("keydown", ({ code, shiftKey, ctrlKey, metaKey }) => {
    if (!qrCodeImage) { return; }

    if (code === "KeyC" && shiftKey && (ctrlKey || metaKey)) { copy(); }
});

// copy a qr code by clicking the image
qrCodeImage.addEventListener("click", copy);

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
        connectionErrorMessage.textContent   = "You are offline. QR code generation is unavailable.";
        connectionErrorMessage.style.display = "block";

        // hide generate button
        generateButton.style.display       = "none";
        generateButton.style.pointerEvents = "none";

        // hide download link and qr code
        downloadLink.style.display = "none";

        qrCodeImage.src = "";
    } else {
        connectionErrorMessage.style.display = "none";

        generateButton.style.display       = "block";
        generateButton.style.pointerEvents = "all";
    }
}

// removes non-numeric characters in the image size input
qrCodeSize.addEventListener("beforeinput", (event) => {
    if (event.data && /\D/.test(event.data)) {
        event.preventDefault();
    }
});
