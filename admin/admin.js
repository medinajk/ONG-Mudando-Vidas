import { createClient } from 'https://cdn.jsdelivr.net/npm/@supabase/supabase-js@2/+esm'

const supabaseUrl = 'https://wymmlejhukzjxzcazieu.supabase.co/rest/v1/'
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
    loginStatus.style.color = "var(--ink)";

    const { data, error } = await supabase.auth.signInWithPassword({
        email: email,
        password: password,
    });

    if (error) {
        loginStatus.innerText = "E-mail ou senha incorretos";
        loginStatus.style.color = "red";
        btnLogin.disabled = false;
    } else {
        loginSection.classList.add('hidden');
        uploadSection.classList.remove('hidden');
        loginStatus.innerText = "";
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

// Upload
document.getElementById('uploadForm').addEventListener('submit', async (e) => {
    e.preventDefault();
    
    const titulo = document.getElementById('titulo').value;
    const arquivo = document.getElementById('arquivoPdf').files[0];
    const statusText = document.getElementById('status');
    const btn = document.getElementById('btnSubmit');

    btn.disabled = true;
    statusText.innerText = "Enviando arquivo PDF... aguarde.";
    statusText.style.color = "var(--ink)";

    const fileExt = arquivo.name.split('.').pop();
    const fileName = `${Math.random()}.${fileExt}`;

    // Envia para o Storage na pasta 'documents'
    const { data: uploadData, error: uploadError } = await supabase.storage
        .from('documents')
        .upload(fileName, arquivo);

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

    // Salva na tabela do banco de dados (relatorios)
    const { error: dbError } = await supabase
        .from('relatorios')
        .insert([{ titulo: titulo, arquivo_url: pdfUrl, tamanho: tamanhoEmMB }]);

    if (dbError) {
        statusText.innerText = "Erro ao guardar dados: " + dbError.message;
        statusText.style.color = "red";
    } else {
        statusText.innerText = "✅ Relatório publicado com sucesso!";
        statusText.style.color = "var(--green)";
        document.getElementById('uploadForm').reset();
    }
    
    btn.disabled = false;
});