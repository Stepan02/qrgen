function download() {
    window.location.href = 'v1/Download/v1.zip'; /* UDĚLAT ZIP VERZE 1 */
}
function changelog() {
    window.location.href = 'changelog.htm';
}
function tutorial() {
    window.location.href = 'tutorial.htm';
}
function demo() {
    const modal = document.querySelector('#demo');
        modal.showModal();
}
function home() {
    window.location.href = 'main.htm';
}

const clippymodal = document.querySelector('#clippy');
clippymodal.onkeydown = function( event ) {
    if ( event.keyCode == 27 ) {
        event.preventDefault();
    }
};
function clippy() {
    const clippymodal = document.querySelector('#clippy');
        clippymodal.showModal()
        document.querySelector("body").style.overflow = 'hidden';
}
function copyClippy() {
    navigator.clipboard.writeText('📎').then(() => alert('🎉 Copied, enjoy! 🎉'))
}
