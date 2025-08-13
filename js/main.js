// jquery import
var jQueryScript = document.createElement("script");
jQueryScript.setAttribute("src","https://ajax.googleapis.com/ajax/libs/jquery/3.2.1/jquery.min.js");
document.head.appendChild(jQueryScript);

function download() {
    window.location.href = "https://github.com/Stepan02/qrgen/tree/main/extension";
}

function changelog() {
    window.location.href = "changelog.htm";
}

function tutorial() {
    window.location.href = "tutorial.htm";
}

function demo() {
    const modal = document.querySelector("dialog#demo"),
        exitText = document.querySelector(".head p");

    // open the modal
    modal.showModal();

    // disable scrolling when the modal is open
    $("body").css({"overflow":"hidden"});

    // close the modal when the user clicks the exit text
    exitText.addEventListener("click", modal.close.bind(modal));

    // re-enable scrolling when the modal is opened
    modal.addEventListener("close", () => {
        $(document).off("scroll"); 
        $("body").css({"overflow":"visible"});
   });
}

function home() {
    window.location.href = "main.htm";
}

function clippy() {
    const clippymodal = document.querySelector("#clippy");

    // open the modal
    clippymodal.showModal();
    document.querySelector("body").style.overflow = "hidden"; // disable scrolling when the modal is opened
}

function copyClippy() {
    const button = document.querySelector("#clippy .normal");
    
    // copy the emoji to the user's clipboard
    navigator.clipboard.writeText("📎").then(() => button.innerHTML = "📋 Copied!");
}

// show current url endpoint on the 404 page
const url = document.location.pathname,
    place = document.querySelector(".url");

if (place) {
    place.innerHTML = url; // show the url if place element exists
}
