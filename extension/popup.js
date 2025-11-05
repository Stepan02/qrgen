const inputValue = document.querySelector(".form textarea"),
      generateBtn = document.querySelector(".form .generateBtn"),
      qrCode = document.querySelector(".qr-code img"),
      errorMessage = document.querySelector(".error-message"),
      connectionError = document.querySelector(".connection-error-message"),
      downloadLink = document.querySelector(".download-link");
let preValue;

// qr code config
let limit = 2000;
let size = "250x250";
let color = "0f0e0e";

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

    preValue = value;
    qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=${size}&color=${color}&data=${encodeURIComponent(value)}`;
    qrCode.style.cursor = "pointer";
    qrCode.title = "Click to copy";
    downloadLink.style.display = "block";
}

// attach generate function to the generate button
generateBtn.addEventListener("click", generate);

// check for dangerous protocols on input change
inputValue.addEventListener("input", () => {
    checkProtocols(inputValue.value.trim());
});

// protocol filter function
function checkProtocols(value) {
    const unsafeProtocols = ["javascript", "data", "file", "vbscript"];

    let decodedValue;
    try {
        decodedValue = decodeURIComponent(value.toLowerCase());
    } catch {
        decodedValue = value.toLowerCase();
    }

    const regex = new RegExp(`\\b(${unsafeProtocols.join("|")}):`, "i");

    if (regex.test(decodedValue)) {
        const match = decodedValue.match(regex)[1];

        errorMessage.textContent = `The "${match}" scheme is blocked for `;
        const a = Object.assign(document.createElement("a"), {
            href: "https://security.duke.edu/security-guides/qr-code-security-guide/",
            target: "_blank",
            rel: "noopener noreferrer",
            textContent: "security reasons"
        });

        errorMessage.appendChild(a);
        errorMessage.appendChild(document.createTextNode("."));
        errorMessage.style.display = "block";

        downloadLink.style.display = "none";
        inputValue.classList.add("border-error");

        console.error(`${match} protocol was blocked`);
        return true;
    }

    errorMessage.style.display = "none";
    inputValue.classList.remove("border-error");

    preValue = "";
    downloadLink.style.display = qrCode.style.visibility === "visible" ? "block" : "none";

    return false;
}

// generate a qr code using shift+enter
inputValue.addEventListener("keydown", (pressed) => {
    const { code, shiftKey} = pressed;

    if (code === "Enter" && shiftKey) {
        pressed.preventDefault();
        generate();
    }
});

// copy a qr code using control+shift+c or meta+shift+c
window.addEventListener("keydown", ({ code, shiftKey, ctrlKey, metaKey }) => {
    if (!qrCode) { return; }

    if (code === "KeyC" && shiftKey && (ctrlKey || metaKey)) { copy(); }
});

// download function
downloadLink.addEventListener("click", async () => {
    const imageUrl = qrCode.src;
    if (!imageUrl) { return; }

    try {
        const res = await fetch(imageUrl),
            blob = await res.blob(),
            link = document.createElement("a");
        
        link.href = URL.createObjectURL(blob);
        link.download = "qrcode.png";
        link.click();
    } catch (err) {
        console.error(`Error downloading an image: ${err}`);
    }
});

// copy function
async function copy() {
    try {
        const image = await fetch(qrCode.src);
        const blob = await image.blob();

        const clipboardItem = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([clipboardItem]);

        console.log(`Image has been copied to clipboard: ${qrCode.src}`);
    } catch (copyError) {
        console.error(`Failed to copy image: ${copyError}`);
    }
}

// copy a qr code by clicking the image
qrCode.addEventListener("click", copy);

function updateCounter() {
    const textarea = document.querySelector("textarea"),
        counter = document.querySelector(".current-character-counter"),
        maxLength = Number(textarea.getAttribute("maxlength")),
        currentLength = textarea.value.length,
        maxCounter = document.querySelector(".character-max-count");

    counter.textContent = currentLength;
    maxCounter.textContent = maxLength;

    if (currentLength === maxLength) {
        counter.style.color = "var(--error)";
        counter.style.fontWeight = 900;
    } else {
        counter.style.color = "gray";
        counter.style.fontWeight = 500;
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

window.addEventListener("online", offlineHandler);
window.addEventListener("offline", offlineHandler);

// offline handler
function offlineHandler() {
    const connection = navigator.onLine;
    
    if (!connection) {
        connectionError.textContent = "You are offline. QR code generation is unavailable.";
        connectionError.style.display = "block";

        generateBtn.style.visibility = "hidden";
        generateBtn.style.pointerEvents = "none";

        downloadLink.style.display = "none";
        qrCode.src = "";
    } else {
        connectionError.style.display = "none";

        generateBtn.style.visibility = "visible";
        generateBtn.style.pointerEvents = "all";
    }
}
