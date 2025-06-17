const inputValue = document.querySelector(".form textarea"),
      generateBtn = document.querySelector(".form .generateBtn"),
      qrCode = document.querySelector(".qr-code img");
let preValue;

generateBtn.addEventListener("click", () => {
    const value = inputValue.value.trim();
    let limit = 2000;
    
    if (!value || value === preValue) { return; }
    if (limit > 0 && value.length > limit) { return; };

    const unsafeProtocols = ["javascript:", "data:", "file:", "vbscript:"];
    if (unsafeProtocols.some(protocol => value.toLowerCase().startsWith(protocol))) { return; }

    preValue = value;
    qrCode.src = `https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${encodeURIComponent(value)}`;
});
