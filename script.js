// Importa o cliente Supabase
import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

// 🔴 IMPORTANTE: COLOQUE AQUI A SUA URL E CHAVE DO SUPABASE!
// Para pegar esses dados: vá no painel do Supabase → Project Settings → API
const supabaseUrl = 'COLOQUE_SUA_URL_AQUI' // ex: 'https://seu-projeto.supabase.co'
const supabaseKey = 'COLOQUE_SUA_CHAVE_ANON_AQUI' // ex: 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9...'
const supabase = createClient(supabaseUrl, supabaseKey)

// Carrega os relatórios na página principal
async function carregarRelatorios() {
    const relatoriosList = document.getElementById('relatorios-list');
    if (!relatoriosList) return;

    console.log('Carregando relatórios...');
    const { data: relatorios, error } = await supabase
        .from('relatorios')
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
        <a href="${relatorio.arquivo_url}" target="_blank" class="block p-6 bg-brand-bg rounded-2xl border border-brand-purple/20 hover:border-brand-purple transition-all duration-300 hover:shadow-md">
            <div class="flex justify-between items-center">
                <div>
                    <h4 class="font-bold text-lg text-black mb-1">${relatorio.titulo}</h4>
                    <p class="text-black text-sm">${relatorio.tamanho}</p>
                </div>
                <svg xmlns="http://www.w3.org/2000/svg" class="h-8 w-8 text-brand-purple" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                    <path stroke-linecap="round" stroke-linejoin="round" stroke-width="2" d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
                </svg>
            </div>
        </a>
    `).join('');
}

// Chama a função para carregar relatórios quando a página carregar
document.addEventListener('DOMContentLoaded', () => {
    carregarRelatorios();
});

// faz o nav aparecer e desaparecer quando o botão é clicado no mobile
const menuButton = document.getElementById("menuButton");
const mobileMenu = document.getElementById("mobileMenu");

menuButton.addEventListener("click", () => {
    mobileMenu.classList.toggle("hidden");
});

mobileMenu.addEventListener("click", (event) => {
    if (event.target.tagName === "A") {
        mobileMenu.classList.add("hidden");
    }
});

// copiar chave pix
function copiarPix() {
    const chave = document.getElementById("chavePix").innerText;
    navigator.clipboard.writeText(chave).then(() => {
        alert("Chave PIX copiada!");
    }).catch(err => {
        console.error('Erro ao copiar:', err);
    });
}

// 1. Selecionamos todos os elementos que vamos precisar manipular
const slidesContainer = document.getElementById('carouselSlides');
const slides = slidesContainer.querySelectorAll('img');
const prevButton = document.getElementById('carouselPrev');
const nextButton = document.getElementById('carouselNext');
const dots = document.querySelectorAll('.dot');

// 2. Criamos uma variável para rastrear em qual slide estamos (começa no 0)
let currentIndex = 0;
const totalSlides = slides.length;

// Atualiza a classe active no dot
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

// 3. Função principal que atualiza a posição do carrossel e os pontinhos
function updateCarousel() {
    // Calcula a largura de uma imagem para saber o quanto deslizar
    const slideWidth = slides[0].clientWidth;
    
    // Move o contêiner usando a propriedade CSS transform
    slidesContainer.style.transform = `translateX(-${currentIndex * slideWidth}px)`;

    updateDots();
}

// 4. Ação do Botão Próximo (❯)
nextButton.addEventListener('click', () => {
    // Avança 1. Se chegar no último, volta para o primeiro (0)
    currentIndex = (currentIndex + 1) % totalSlides;
    updateCarousel();
});

// 5. Ação do Botão Anterior (❮)
prevButton.addEventListener('click', () => {
    // Volta 1. Se estiver no primeiro (0), vai para o último
    currentIndex = (currentIndex - 1 + totalSlides) % totalSlides;
    updateCarousel();
});

// 6. Ação de clicar diretamente nos pontinhos
dots.forEach((dot, index) => {
    dot.addEventListener('click', () => {
        // O slide atual passa a ser o número do pontinho clicado
        currentIndex = index;
        updateCarousel();
    });
});

// 7. Extra: Recalcula a posição se a janela do navegador for redimensionada
window.addEventListener('resize', updateCarousel);

// Inicializa os dots
updateDots();
