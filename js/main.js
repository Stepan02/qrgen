const modal = document.querySelector("dialog#demo"),
    exitText = document.querySelector(".header p"),
    body = document.querySelector("body");

// close the modal when the user clicks the exit text
exitText.addEventListener("click", closeModal);

// re-enable scrolling when the modal is closed
modal.addEventListener("close", closeModal);

function demo() {
    // open the modal
    modal.showModal();

    // disable scrolling when the modal is open
    body.classList.add("no-scroll");
}

function closeModal() {
    // re-enable scrolling
    body.classList.remove("no-scroll");

    // close the modal
    modal.close();
}

// navbar links
function home() {
    window.location.href = "main.htm";
}

function download() {
    window.location.href = "https://github.com/Stepan02/qrgen/tree/main/extension";
}

function changelog() {
    window.location.href = "changelog.htm";
}

function tutorial() {
    window.location.href = "tutorial.htm";
}

function clippy() {
    const clippymodal = document.querySelector("#clippy");

    // open the modal
    clippymodal.showModal();
    document.querySelector("body").style.overflow = "hidden"; // disable scrolling when the modal is opened
}

function copyClippy() {
    const button = document.querySelector("#clippy .normal-button");
    
    // copy the emoji to the user's clipboard
    navigator.clipboard.writeText("📎").then(() => button.innerHTML = "📋 Copied!");
}

// show current url endpoint on the 404 page
const url = document.location.pathname,
    place = document.querySelector(".url");

if (place) {
    place.innerHTML = url; // show the url if place element exists
}
