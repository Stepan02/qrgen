const inputValue = document.querySelector(".form textarea"),
      generateBtn = document.querySelector(".form .generateBtn"),
      qrCode = document.querySelector(".qr-code img"),
      alert = document.querySelector(".error-mess");
let preValue;

generateBtn.addEventListener("click", () => {
    const value = inputValue.value.trim();
    let limit = 2000;
    
    if (!value || value === preValue) { return; }
    if (limit > 0 && value.length > limit) { return; };

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
        alert.textContent = `The "${cleanProtocol}" scheme is blocked for security reasons.`;
        alert.style.display = "block";
        return;
    } else {
        alert.style.display = "none";
    }

    preValue = value;
    qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`;
    qrCode.style.cursor = "pointer";
    qrCode.title = "Click to download";
});

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
        counter.style.fontWeight = 900;
    } else {
        counter.style.color = "gray";
        counter.style.fontWeight = 500;
    }
}

document.addEventListener("DOMContentLoaded", () => {
    updateCounter();
    const textarea = document.querySelector("textarea");
    if (textarea) {
        textarea.addEventListener("input", updateCounter);
    }
});
