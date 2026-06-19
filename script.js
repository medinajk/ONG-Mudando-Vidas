// Importa o cliente Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 🔴 IMPORTANTE: COLOQUE AQUI A SUA URL E CHAVE DO SUPABASE!
// Para pegar esses dados: vá no painel do Supabase → Project Settings → API
const supabaseUrl = 'https://wymmlejhukzjxzcazieu.supabase.co'
const supabaseKey = 'sb_publishable_qRR3cPHhT53OR9RFGkJ2TA_RlOlQgsW'
const supabase = createClient(supabaseUrl, supabaseKey)

// Carrega os relatórios na página principal
async function carregarRelatorios() {
    const relatoriosList = document.getElementById('relatorios-list');
    if (!relatoriosList) return;

    console.log('Carregando relatórios...');
    const { data: relatorios, error } = await supabase
        .from('transparencia')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Erro ao carregar relatórios:', error);
        relatoriosList.innerHTML = '<p class="text-red-500 text-base">Erro ao carregar relatórios: ' + error.message + '</p>';
        return;
    }

    console.log('Relatórios carregados:', relatorios);

    if (relatorios.length === 0) {
        relatoriosList.innerHTML = '<p class="text-gray-600 text-base">Nenhum relatório publicado ainda.</p>';
        return;
    }

    // Renderiza os relatórios
    relatoriosList.innerHTML = relatorios.map(relatorio => `
        <a href="${relatorio.file}" target="_blank" class="block p-6 bg-brand-bg rounded-2xl border border-brand-purple/20 hover:border-brand-purple transition-all duration-300 hover:shadow-md">
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="font-bold text-lg text-black mb-1">${relatorio.title}</h4>
                    <p class="text-black text-sm">${relatorio.size}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            </div>
        </a>
    `).join('');
}

// faz o nav aparecer e desaparecer quando o botão é clicado no mobile
const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");

if (menuButton && mobileMenu) {
    menuButton.addEventListener("click", () => {
        mobileMenu.classList.toggle("hidden");
    });

    mobileMenu.addEventListener("click", (event) => {
        if (event.target.tagName === "A") {
            mobileMenu.classList.add("hidden");
        }
    });
}

// copiar chave pix - método mais compatível
function copiarPix() {
    const chave = document.getElementById("chavePix");
    const mensagem = document.getElementById("mensagemCopiar");
    if (!chave || !mensagem) return;
    const textoChave = chave.innerText;
    
    // Função para exibir mensagem temporária
    function exibirMensagem(texto) {
        mensagem.textContent = texto;
        mensagem.style.opacity = '1';
        setTimeout(() => {
            mensagem.style.opacity = '0';
            setTimeout(() => {
                mensagem.textContent = '';
            }, 300);
        }, 2000);
    }
    
    // Tenta usar o método moderno (navigator.clipboard)
    if (navigator.clipboard && navigator.clipboard.writeText) {
        navigator.clipboard.writeText(textoChave).then(() => {
            exibirMensagem("Chave PIX copiada com sucesso!");
        }).catch(err => {
            fallbackCopy(textoChave, exibirMensagem);
        });
    } else {
        // Método fallback para navegadores antigos
        fallbackCopy(textoChave, exibirMensagem);
    }
}

function fallbackCopy(texto, exibirMensagem) {
    const textarea = document.createElement('textarea');
    textarea.value = texto;
    textarea.style.position = 'fixed';
    textarea.style.opacity = '0';
    document.body.appendChild(textarea);
    textarea.select();
    try {
        document.execCommand('copy');
        exibirMensagem("Chave PIX copiada com sucesso!");
    } catch (err) {
        console.error('Erro ao copiar:', err);
        exibirMensagem("Não foi possível copiar a chave PIX automaticamente. Por favor, copie manualmente.");
    }
    document.body.removeChild(textarea);
}

// Função genérica para inicializar um carrossel
function initCarousel(slidesContainerId, prevButtonId, nextButtonId, dotsClass) {
    const slidesContainer = document.getElementById(slidesContainerId);
    if (!slidesContainer) return;
    
    const slides = slidesContainer.querySelectorAll('img');
    const prevButton = document.getElementById(prevButtonId);
    const nextButton = document.getElementById(nextButtonId);
    const dots = document.querySelectorAll(dotsClass);

    if (slides.length === 0) return;

    let currentIndex = 0;
    const totalSlides = slides.length;
    let autoSlideInterval;

    function updateDots() {
        dots.forEach((dot, index) => {
            if (index === currentIndex) {
                dot.classList.add('bg-brand-dark');
                dot.classList.remove('bg-brand-purple/40');
            } else {
                dot.classList.remove('bg-brand-dark');
                dot.classList.add('bg-brand-purple/40');
            }
        });
    }

    function updateCarousel() {
        const slideWidth = slides[0].clientWidth;
        slidesContainer.style.transform = `translateX(-${currentIndex * slideWidth}px)`;
        updateDots();
    }

    function nextSlide() {
        currentIndex = (currentIndex + 1) % totalSlides;
        updateCarousel();
        resetAutoSlide();
    }

    function prevSlide() {
        currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
        updateCarousel();
        resetAutoSlide();
    }

    function startAutoSlide() {
        autoSlideInterval = setInterval(nextSlide, 5000);
    }

    function resetAutoSlide() {
        clearInterval(autoSlideInterval);
        startAutoSlide();
    }

    if (nextButton) {
        nextButton.addEventListener('click', nextSlide);
    }

    if (prevButton) {
        prevButton.addEventListener('click', prevSlide);
    }

    dots.forEach((dot, index) => {
        dot.addEventListener('click', () => {
            currentIndex = index;
            updateCarousel();
            resetAutoSlide();
        });
    });

    window.addEventListener('resize', updateCarousel);
    
    // Wait for all images to load before starting carousel
    let imagesLoaded = 0;
    slides.forEach((img) => {
        if (img.complete) {
            imagesLoaded++;
            if (imagesLoaded === slides.length) {
                updateCarousel();
                startAutoSlide();
            }
        } else {
            img.addEventListener('load', () => {
                imagesLoaded++;
                if (imagesLoaded === slides.length) {
                    updateCarousel();
                    startAutoSlide();
                }
            });
        }
    });
    
    updateDots();
}

// Chama a função para carregar relatórios e inicializa os carrosséis quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarRelatorios();
    
    // Adiciona listener para o botão de copiar PIX
    const copiarPixBtn = document.getElementById('copiarPixBtn');
    if (copiarPixBtn) {
        copiarPixBtn.addEventListener('click', copiarPix);
    }
    
    // Inicializa o carrossel da página principal (Acolhimento Warao)
    initCarousel('carouselSlides', 'carouselPrev', 'carouselNext', '.carousel-dot');
    
    // Inicializa o carrossel da página de história
    initCarousel('historyCarouselSlides', 'historyCarouselPrev', 'historyCarouselNext', '.history-carousel-dot');
});
