// faz o nav aparecer e desaparecer quando o botão é clicado no mobile
const menuButton = document.querySelector(".menu-button");
const navLinks = document.querySelector(".nav-links");

menuButton.addEventListener("click", () => {
    const isOpen = navLinks.classList.toggle("is-open");
    menuButton.setAttribute("aria-expanded", String(isOpen));
});

navLinks.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
        navLinks.classList.remove("is-open");
        menuButton.setAttribute("aria-expanded", "false");
    }
});

// copiar chave pix
function copiarPix() {
    const chave = document
        .getElementById("chavePix")
        .innerText;

    navigator.clipboard.writeText(chave);

    alert("Chave PIX copiada!");
}