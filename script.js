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

// Funcionalidade Completa do Carrossel (Automático e Manual)
const container = document.querySelector('.carousel-container');
const slides = document.querySelector('.carousel-slides');
const images = document.querySelectorAll('.carousel-slides img');
const prevBtn = document.querySelector('.carousel-prev');
const nextBtn = document.querySelector('.carousel-next');
const dots = document.querySelectorAll('.dot');

console.log('Carrossel Debug:');
console.log('Container:', container);
console.log('Slides:', slides);
console.log('Imagens:', images.length);
console.log('Prev Btn:', prevBtn);
console.log('Next Btn:', nextBtn);
console.log('Dots:', dots.length);

let counter = 0;
const slideCount = images.length;
let autoSlideInterval;

// Função principal que move o carrossel
function updateCarousel() {
    slides.style.transform = `translateX(${-counter * 100}%)`;
    
    // Atualiza o estado dos pontos
    dots.forEach((dot, index) => {
        dot.classList.toggle('active', index === counter);
    });
}

// Função para o próximo slide
function nextSlide() {
    counter = (counter + 1) % slideCount;
    updateCarousel();
}

// Função para o slide anterior
function prevSlide() {
    counter = (counter - 1 + slideCount) % slideCount;
    updateCarousel();
}

// Inicia o movimento automático (a cada 4 segundos)
function startAutoSlide() {
    autoSlideInterval = setInterval(nextSlide, 4000);
}

// Para o movimento automático (ao clicar manualmente)
function stopAutoSlide() {
    clearInterval(autoSlideInterval);
}

// Event Listeners (para os botões)
if (container && slides && prevBtn && nextBtn) {
    nextBtn.addEventListener('click', () => {
        stopAutoSlide(); // Para o automático ao clicar
        nextSlide();
        startAutoSlide(); // Reinicia o automático
    });
    
    prevBtn.addEventListener('click', () => {
        stopAutoSlide();
        prevSlide();
        startAutoSlide();
    });
    
    // Permite navegar clicando nos pontos
    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            stopAutoSlide();
            counter = index;
            updateCarousel();
            startAutoSlide();
        });
    });
    
    // Inicia tudo
    startAutoSlide();
}