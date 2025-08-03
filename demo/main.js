const inputValue = document.querySelector(".form textarea"),
    generateBtn = document.querySelector(".form .generateBtn"),
    qrCode = document.querySelector(".qr-code img");
let preValue;
let limit = 2000;

qrCode.style.cursor = "pointer";

// create download link
let downloadLink = document.createElement("div");
downloadLink.className = "download-link";
downloadLink.style.display = "none";
downloadLink.textContent = "Download";
qrCode.parentNode.appendChild(downloadLink);

// create protocol error message element
let alert = document.createElement("span");
alert.className = "error-mess";
alert.style.display = "none";
qrCode.parentNode.appendChild(alert);

// create connection error message element
let connectionError = document.createElement("span");
connectionError.className = "error-mess";
connectionError.style.display = "none";
qrCode.parentNode.appendChild(connectionError);

// generate a qr code
function generate() {
    const value = inputValue.value.trim();

    if (!value || value === preValue) { return; };
    if (limit > 0 && value.length > limit) { return; }; 
    
   if (checkProtocols(value)) {
        qrCode.src = "";
        return;
    } else {
        preValue = value;
        qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`;
        qrCode.style.cursor = "pointer";
        qrCode.title = "Click to copy";
        downloadLink.style.display = "block";
    }
}

// attach generate function to the generate button
generateBtn.addEventListener("click", generate);

// check for dangerous protocols on input change
inputValue.addEventListener("input", () => {
    checkProtocols(inputValue.value.trim());
    offlineHandler();
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
        const match = decodedValue.match(regex);
        const cleanProtocol = match[1];
        alert.textContent = `The "${cleanProtocol}" scheme is blocked for `;
        const a = document.createElement("a");
        a.href = "https://security.duke.edu/security-guides/qr-code-security-guide/";
        a.target = "_blank";
        a.rel = "noopener noreferrer";
        a.textContent = "security reasons";
        alert.appendChild(a);
        alert.appendChild(document.createTextNode("."));
        alert.style.display = "block";
        downloadLink.style.display = "none";
        inputValue.classList.add("err");
        console.error(`${cleanProtocol} protocol was blocked`);
        return true;
    } else {
        alert.style.display = "none";
        inputValue.classList.remove("err");
        preValue = "";
        if (qrCode.style.visibility === "visible") {
            downloadLink.style.display = "block";
        } else {
            downloadLink.style.display = "none";
        }
        return false;
    }
}

// generate a qr code using shift+enter
inputValue.addEventListener("keydown", (pressed) => {
    if (pressed.key === "Enter" && pressed.shiftKey) {
        pressed.preventDefault();
        generate();
    }
});

// download function
downloadLink.addEventListener("click", () => {
    const imageUrl = qrCode.src;
    if (!imageUrl) { return; };

    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "qrcode.png";
            link.click();
        })
        .catch(error => console.error("Error downloading an image: ", error));
});

// copy function
qrCode.addEventListener("click", async () => {
    try {
        const image = await fetch(qrCode.src);
        const blob = await image.blob();

        const clipboardItem = new ClipboardItem({ [blob.type]: blob });
        await navigator.clipboard.write([clipboardItem]);
        console.log("Image has been copied to clipboard: ", qrCode.src);
    } catch (copyError) {
        console.error("Failed to copy image: ", copyError);
    }
});

function updateCounter() {
    const textarea = document.querySelector("textarea"),
        counter = document.getElementById("char-counter"),
        maxLength = Number(textarea.getAttribute("maxlength")),
        currentLength = textarea.value.length,
        maxCounter = document.querySelector("#char-max");

    counter.textContent = currentLength;
    maxCounter.textContent = maxLength;

    if (currentLength === maxLength) {
        counter.style.color = "var(--error)";
    } else {
        counter.style.color = "gray";
    }
}

window.onload = function() {
    updateCounter();
    offlineHandler();
    downloadLink.style.display = "none";
};

window.addEventListener("online", offlineHandler);
window.addEventListener("offline", offlineHandler);

// offline handler
function offlineHandler() {
    const connection = navigator.onLine;

    if (!connection) {
        connectionError.textContent = "You are offline. QR code generation is unavailable.";
        connectionError.style.display = "block";
        generateBtn.style.display = "none";
        generateBtn.style.pointerEvents = "none";
        downloadLink.style.display = "none";
        qrCode.src = "";
    } else {
        connectionError.style.display = "none";
        generateBtn.style.display = "block";
        generateBtn.style.pointerEvents = "all";
    }
}
