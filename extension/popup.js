const inputValue             = document.querySelector(".form textarea"),
      qrCodeColor            = document.querySelector(".form #color"),
      qrCodeBackgroundColor  = document.querySelector(".form #backgroundColor"),
      qrCodeSize             = document.querySelector(".form #size"),
      resetQrCodeSettings    = document.querySelector(".reset-link"),
      generateButton         = document.querySelector(".form .generateBtn"),
      qrCodeImage            = document.querySelector(".qr-code img"),
      errorMessage           = document.querySelector(".error-message"),
      connectionErrorMessage = document.querySelector(".connection-error-message"),
      imageContrastWarning   = document.querySelector(".contrast-warning-message"),
      downloadLink           = document.querySelector(".download-link");
let previousValue,
    previousColor,
    previousBackgroundColor,
    previousSize;

// qr code config
let limit  = 2000,
    apiUrl = "https://api.qrserver.com/v1/create-qr-code/",
    savedImageProperties;

// default image settings ([ color, background color, size ])
let defaultImageSettings = {
    color:           "#000000",
    backgroundColor: "#ffffff",
    size:            "250",
};

// load saved qr code settings
try {
  savedImageProperties = JSON.parse(localStorage.getItem("qrgen-image-properties"));
} catch (error) {
  savedImageProperties = null;
}

if (savedImageProperties) {
  qrCodeColor.value           = savedImageProperties.color;
  qrCodeBackgroundColor.value = savedImageProperties.backgroundColor;
  qrCodeSize.value            = savedImageProperties.size;
      
  // show the reset link
  resetQrCodeSettings.style.display = "block";
} 

// hide the reset link if the user did not change the settings
if (
    qrCodeColor.value           === defaultImageSettings.color &&
    qrCodeBackgroundColor.value === defaultImageSettings.backgroundColor &&
    qrCodeSize.value            === defaultImageSettings.size
) {
  resetQrCodeSettings.style.display = "none";
}

// remove saved qr code settings (reset to default)
function resetSavedProperties() {
  // remove saved settings
  localStorage.removeItem("qrgen-image-properties");
  savedImageProperties = null;

  // reset color and size inputs to their default values
  qrCodeColor.value           = defaultImageSettings.color;
  qrCodeBackgroundColor.value = defaultImageSettings.backgroundColor;
  qrCodeSize.value            = defaultImageSettings.size;

  // hide the reset link
  resetQrCodeSettings.style.display = "none";

  console.debug("[debug] image properties set to default");
}

// attach reset function to the reset link
resetQrCodeSettings.addEventListener("click", resetSavedProperties);

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

// get rgb color luminance - https://www.w3.org/WAI/WCAG21/Understanding/contrast-minimum.html
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
    if (!value) {
        return;
    }

    // does not regenerate if the input, the colors and the size stay the same
    if (
        value === previousValue &&
        color === previousColor &&
        backgroundColor === previousBackgroundColor &&
        size === previousSize
    ) {
        return;
    }

    // does not generate when the input is over the character limit
    if (limit > 0 && value.length > limit) {
        return;
    }

    // convert hex colors to rgb
    let rgbColor           = convertHexToRgb(color);
    let rgbBackgroundColor = convertHexToRgb(backgroundColor);

    // add a warning if the user generated a qr code with bad color contrast
    // the contrast ratio should be over 4.5 (https://www.w3.org/WAI/WCAG21/Techniques/general/G174)
    if (getContrastRatio(rgbColor, rgbBackgroundColor) < 4.5) {
        triggerContrastWarning(rgbColor, rgbBackgroundColor);
     } else {
        // hide the contrast warning message if the contrast is over 4.5
        imageContrastWarning.style.display = "none";
    }

    if (checkProtocols(value)) {
        qrCodeImage.src = "";
        return;
    }

    previousValue           = value;
    previousColor           = color;
    previousBackgroundColor = backgroundColor;
    previousSize            = size;

    qrCodeImage.src =
        `${apiUrl}?size=${encodeURIComponent(size)}x${encodeURIComponent(size)}` +
        `&color=${encodeURIComponent(color)}` +
        `&bgcolor=${encodeURIComponent(backgroundColor)}` +
        `&data=${encodeURIComponent(value)}`;

    qrCodeImage.style.cursor = "pointer";
    qrCodeImage.title        = "Click to copy";

    downloadLink.style.display = "block";

    // save colors and size to localstorage
    let qrCodeProperties = {
        color:           qrCodeColor.value,
        backgroundColor: qrCodeBackgroundColor.value,
        size:            qrCodeSize.value,
    };

    localStorage.setItem("qrgen-image-properties", JSON.stringify(qrCodeProperties));
}

// attach generate function to the generate button
generateButton.addEventListener("click", generate);

// common potentially unsafe protocols
const unsafeProtocols = ["javascript", "data", "file", "vbscript"];

// regular expression filter
const protocolsRegex = new RegExp(`(${unsafeProtocols.join("|")}):`, "i");

function attemptURIDecode(value) {
    try {
        return decodeURIComponent(value);
    } catch {
        return value;
    }
}

// protocol filter function
function checkProtocols(value) {
    let decodedValue = value;

    // decode unicode, html, url
    decodedValue = decodedValue.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    decodedValue = decodedValue.replace(/&#x([0-9a-fA-F]+);/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
    decodedValue = decodedValue.replace(/&#([0-9]+);/g, (_, dec) => String.fromCharCode(parseInt(dec, 10)));

    // double uri decode
    decodedValue = attemptURIDecode(decodedValue);
    decodedValue = attemptURIDecode(decodedValue);

    // delete backslashes
    decodedValue = decodedValue.replace(/\\[tnr0b]/g, "");

    // delete whitespace, null bytes, newlines and tabs
    decodedValue = decodedValue.replace(/[\s\x00-\x1F]/g, "");

    // transform to lowercase
    decodedValue = decodedValue.toLowerCase();

    // final protocol regex test
    const match = decodedValue.match(protocolsRegex);

    // return false if the protocol is safe
    // if the protocol is not safe, return its name
    return match ? match[1] : false;
}

// function to show the protocol warning
function triggerProtocolError(match) {
    errorMessage.textContent = `The "${match}" scheme is blocked for `;
    const a = Object.assign(document.createElement("a"), {
        href: "https://security.duke.edu/security-guides/qr-code-security-guide/",
        target: "_blank",
        rel: "noopener noreferrer",
        textContent: "security reasons",
    });

    // display error message
    errorMessage.appendChild(a);
    errorMessage.appendChild(document.createTextNode("."));
    errorMessage.style.display = "block";

    // hide the download link
    downloadLink.style.display = "none";

    // add error border to the input
    inputValue.classList.add("border-error");

    // disable the generate button
    generateButton.disabled = true;

    // do not generate the qr code if the check fails
    console.error(`[security] ${match} protocol was blocked`);
}

// function to reset protocol error
function resetProtocolError() {
    // enable the generate button if the check passes
    generateButton.disabled = false;

    // clear the error message and border
    errorMessage.style.display = "none";
    inputValue.classList.remove("border-error");

    // reset previous value
    previousValue = "";

    // reset download link visibility
    downloadLink.style.display = qrCodeImage.style.visibility === "visible" ? "block" : "none";
}

// function to show contrast warning message
function triggerContrastWarning(color, backgroundColor) {
    imageContrastWarning.textContent = "This color contrast might render the QR code unreadable.";

    imageContrastWarning.style.display = "block";

    console.warn(`[warning] this color contrast (#${color} - #${backgroundColor}) might render the QR code unreadable`);
}

// check for dangerous protocols on input change
inputValue.addEventListener("input", () => {
    let error = checkProtocols(inputValue.value.trim());

    // remove error message if the check passes
    if (!error) {
        resetProtocolError();
    } else {
        // trigger error message otherwise
        triggerProtocolError(error);
    }

    offlineHandler();
});

// check for contrast ratio on input change (both color and background color input)
[qrCodeColor, qrCodeBackgroundColor].forEach(colorInput => {
    colorInput.addEventListener("input", () => {
        // get current color and background color
        let hexColor           = qrCodeColor.value;
        let hexBackgroundColor = qrCodeBackgroundColor.value;

        // convert hex colors to rgb
        let rgbColor           = convertHexToRgb(hexColor);
        let rgbBackgroundColor = convertHexToRgb(hexBackgroundColor);

        // add a warning if the user generated a qr code with bad color contrast
        if (getContrastRatio(rgbColor, rgbBackgroundColor) < 4.5) {
            triggerContrastWarning(hexColor, hexBackgroundColor);
        } else {
            // hide the contrast warning message if the contrast is over 4.5
            imageContrastWarning.style.display = "none";
        }
    });
});

// check for qr code settings change (displaying the reset link)
const inputs = [ qrCodeColor, qrCodeBackgroundColor, qrCodeSize ];
inputs.forEach(input => {
    input.addEventListener("input", () => {
        // show the reset link, if the settings had been changed
        const isChanged = inputs.some(input => input.value !== defaultImageSettings[input.id]);

        resetQrCodeSettings.style.display = isChanged ? "block" : "none";
    });
});

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
    } catch (downloadError) {
        console.error(`[error] error downloading an image: ${downloadError}`);
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

        console.debug(`[debug] image has been copied to clipboard: ${qrCodeImage.src}`);
    } catch (copyError) {
        console.error(`[error] failed to copy image: ${copyError}`);
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

// removes non-numeric characters in the image size input
qrCodeSize.addEventListener("beforeinput", (event) => {
    if (event.data && /\D/.test(event.data)) {
        event.preventDefault();
    }
});
