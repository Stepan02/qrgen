const inputValue = document.querySelector(".form textarea"),
    generateBtn = document.querySelector(".form .generateBtn"),
    qrCode = document.querySelector(".qr-code img");
let preValue;
let limit = 2000;

qrCode.style.cursor = "pointer";

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

generateBtn.addEventListener("click", () => {
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
        qrCode.title = "Click to download";
    }
});

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
        inputValue.classList.add("err");
        console.error(`${cleanProtocol} protocol was blocked`);
        return true;
    } else {
        alert.style.display = "none";
        inputValue.classList.remove("err");
        return false;
    }
}

// download function
qrCode.addEventListener("click", () => {
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
        qrCode.src = "";
    } else {
        connectionError.style.display = "none";
        generateBtn.style.display = "block";
        generateBtn.style.pointerEvents = "all";
    }
}
