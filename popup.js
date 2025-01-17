const inputValue = document.querySelector(".form textarea"),
generateBtn = document.querySelector(".form .generateBtn"),
qrCode = document.querySelector(".qr-code img"),
container = document.querySelector('.container')
let preValue

generateBtn.addEventListener("click", () => {
    let value = inputValue.value.trim() 
    if(!value || value === preValue) return
    preValue = value
    qrCode.src =` https://api.qrserver.com/v1/create-qr-code/?size=200x200&data=${value} `
})