const inputValue = document.querySelector(".form textarea"),
generateBtn = document.querySelector(".form .generateBtn"),
qrCode = document.querySelector(".qr-code img"),
container = document.querySelector(".container")
let preValue

qrCode.style.cursor = "pointer";

generateBtn.addEventListener("click", () => {
    let value = inputValue.value.trim();
    let limit = 2000;

    if (!value || value === preValue) return;
    if (limit > 0 && value.length > limit) return;
    
    const unsafeProtocols = ['javascript:', 'data:', 'file:', 'vbscript:'];
    if (unsafeProtocols.some(protocol => value.toLowerCase().startsWith(protocol))) {
        return;
    }

    preValue = value;
    qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`; 
});

// download function
qrCode.addEventListener("click", () => {
    const imageUrl = qrCode.src;
    if (!imageUrl) return;

    fetch(imageUrl)
        .then(response => response.blob())
        .then(blob => {
            const link = document.createElement("a");
            link.href = URL.createObjectURL(blob);
            link.download = "qrcode.png";
            link.click();
        })
        .catch(error => console.error("Error downloading an image:", error));
});

function updateCounter() {
    const textarea = document.querySelector("textarea");
    const counter = document.getElementById("char-counter");
    const maxLength = textarea.getAttribute("maxlength");
    const currentLength = textarea.value.length;
    const maxCounter = document.querySelector("#char-max");

    counter.textContent = currentLength;
    maxCounter.textContent = maxLength;

    if (currentLength == maxLength) {
        counter.style.color = "var(--error)"
    } else {
        counter.style.color = "gray"
    }
}

window.onload = function() {
    updateCounter();
};
