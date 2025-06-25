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
    const modal = document.querySelector("#demo");
    modal.showModal();
    $("body").css({"overflow":"hidden"});
    let exitText = document.querySelector(".head p");
    exitText.addEventListener("click", () => {
        modal.close();
   });
   modal.addEventListener("close", () => {
    $(document).off("scroll"); 
    $("body").css({"overflow":"visible"});
   });
}
function home() {
    window.location.href = "main.htm";
}
const clippymodal = document.querySelector("#clippy");
if (clippymodal !== null) {
    clippymodal.onkeydown = function( event ) {
        if ( event.keyCode === 27 ) {
            event.preventDefault();
        }
    };
}
function clippy() {
    clippymodal.showModal();
    document.querySelector("body").style.overflow = "hidden";
}
function copyClippy() {
    const button = document.querySelector("#clippy .normal");
    navigator.clipboard.writeText("📎").then(() => button.innerHTML = "📋 Copied!");
}

const url = document.location.pathname;
const place = document.querySelector(".url");

if (place) {
    place.innerHTML = url;
}
