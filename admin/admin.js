import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://wymmlejhukzjxzcazieu.supabase.co'
const supabaseKey = 'sb_publishable_qRR3cPHhT53OR9RFGkJ2TA_RlOlQgsW'
const supabase = createClient(supabaseUrl, supabaseKey)

const loginSection = document.getElementById('loginSection');
const uploadSection = document.getElementById('uploadSection');

// Verificar se o usuário já tem sessão iniciada ao abrir a página
async function verificarSessao() {
    const { data: { session } } = await supabase.auth.getSession();
    if (session) {
        loginSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        carregarRelatoriosAdmin();
    }
}
verificarSessao();

// Login
document.getElementById('loginForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('email').value;
    const password = document.getElementById('password').value;
    const loginStatus = document.getElementById('loginStatus');
    const btnLogin = document.getElementById('btnLogin');

    btnLogin.disabled = true;
    loginStatus.innerText = "Verificando...";
    loginStatus.style.color = "#000000";

    console.log('Tentando login com:', email);

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    console.log('Resposta do login:', { data, error });

    if (error) {
        console.error('Erro de login:', error);
        loginStatus.innerText = "Erro: " + error.message;
        loginStatus.style.color = "red";
        btnLogin.disabled = false;
    } else {
        loginSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        loginStatus.innerText = "";
        carregarRelatoriosAdmin();
    }
});

// Logout
document.getElementById('btnLogout').addEventListener('click', async () => {
    await supabase.auth.signOut();
    uploadSection.classList.add('hidden');
    loginSection.classList.remove('hidden');
    document.getElementById('loginForm').reset();
    document.getElementById('uploadForm').reset();
    document.getElementById('status').innerText = "";
    document.getElementById('btnLogin').disabled = false;
});

// Função para carregar relatórios na área admin
async function carregarRelatoriosAdmin() {
    const relatoriosListAdmin = document.getElementById('relatoriosListAdmin');
    if (!relatoriosListAdmin) return;

    const { data: relatorios, error } = await supabase
        .from('transparencia')
        .select('*')
        .order('id', { ascending: false });

    if (error) {
        console.error('Erro ao carregar relatórios:', error);
        relatoriosListAdmin.innerHTML = '<p class="text-red-500 text-base">Erro ao carregar relatórios: ' + error.message + '</p>';
        return;
    }

    if (relatorios.length === 0) {
        relatoriosListAdmin.innerHTML = '<p class="text-gray-500 text-base">Nenhum relatório publicado ainda.</p>';
        return;
    }

    relatoriosListAdmin.innerHTML = relatorios.map(relatorio => `
        <div class="flex justify-between items-center p-4 bg-brand-bg rounded-xl border border-brand-purple/20">
            <div>
                <h4 class="font-bold text-base text-black">${relatorio.title}</h4>
                <p class="text-black text-xs">${relatorio.size}</p>
            </div>
            <div class="flex gap-2">
                <a href="${relatorio.file}" target="_blank" class="bg-brand-purple text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-brand-dark transition">Visualizar</a>
                <button onclick="excluirRelatorio(${relatorio.id})" class="bg-red-500 text-white px-3 py-2 rounded-lg text-xs font-bold hover:bg-red-600 transition">Excluir</button>
            </div>
        </div>
    `).join('');
}

// Função para excluir relatório
window.excluirRelatorio = async function(id) {
    if (!confirm('Tem certeza que deseja excluir este relatório?')) {
        return;
    }

    const { error } = await supabase
        .from('transparencia')
        .delete()
        .eq('id', id);

    if (error) {
        alert('Erro ao excluir relatório: ' + error.message);
        console.error('Erro ao excluir:', error);
    } else {
        alert('Relatório excluído com sucesso!');
        carregarRelatoriosAdmin();
    }
};

// Upload
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const titulo = document.getElementById('titulo').value;
    const arquivo = document.getElementById('arquivoPdf').files[0];
    const statusText = document.getElementById('status');
    const btn = document.getElementById('btnSubmit');

    btn.disabled = true;
    statusText.innerText = "Enviando arquivo PDF... aguarde.";
    statusText.style.color = "#000000";

    console.log('Iniciando upload do arquivo:', arquivo.name);

    const fileExt = arquivo.name.split('.').pop();
    const fileName = `${Date.now()}-${Math.random().toString(36).substring(2, 10)}.${fileExt}`;

    console.log('Nome do arquivo para upload:', fileName);

    // Envia para o Storage na pasta 'documents'
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, arquivo);

    console.log('Resultado do upload:', { uploadData, uploadError });

    if (uploadError) {
        statusText.innerText = "Erro ao enviar arquivo: " + uploadError.message;
        statusText.style.color = "red";
        btn.disabled = false;
        return;
    }

    // Pega a URL pública
    const { data: urlData } = supabase.storage
        .from('documents')
        .getPublicUrl(fileName);
    
    const pdfUrl = urlData.publicUrl;
    const tamanhoEmMB = (arquivo.size / (1024 * 1024)).toFixed(1) + " MB";

    console.log('URL pública do PDF:', pdfUrl);

    // Salva na tabela do banco de dados (transparencia)
    const { error: dbError } = await supabase
        .from('transparencia')
        .insert([{ title: titulo, file: pdfUrl, size: tamanhoEmMB }]);

    console.log('Resultado da inserção no banco:', { dbError });

    if (dbError) {
        statusText.innerText = "Erro ao guardar dados: " + dbError.message;
        statusText.style.color = "red";
    } else {
        statusText.innerText = "✅ Relatório publicado com sucesso!";
        statusText.style.color = "#4ade80";
        document.getElementById('uploadForm').reset();
        carregarRelatoriosAdmin();
    }
    
    btn.disabled = false;
});
