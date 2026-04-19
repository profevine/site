/**
 * Professor Vine - Main JavaScript
 * Funcionalidades: Dark mode, citações nerd e sistema de abas
 */

(function() {
    'use strict';

    // --- Dark Mode Toggle ---
    const THEME_KEY = 'profevine-theme';

    function initTheme() {
        const savedTheme = localStorage.getItem(THEME_KEY);
        const prefersDark = window.matchMedia('(prefers-color-scheme: dark)').matches;
        const theme = savedTheme || (prefersDark ? 'dark' : 'light');
        setTheme(theme);
    }

    function setTheme(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        localStorage.setItem(THEME_KEY, theme);
        updateToggleButton(theme);
    }

    function toggleTheme() {
        const current = document.documentElement.getAttribute('data-theme');
        const newTheme = current === 'dark' ? 'light' : 'dark';
        setTheme(newTheme);
    }

    function updateToggleButton(theme) {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        btn.textContent = theme === 'dark' ? '☀️ Modo Claro' : '🌙 Modo Escuro';
    }

    // --- Citações Nerd ---
    const quotes = [
        '"Vida longa e próspera" - Spock',
        '"Eu sou seu pai" - Darth Vader',
        '"Faça ou não faça. Tentativa não há" - Yoda',
        '"O bolo é uma mentira" - Portal',
        '"O inverno está chegando" - Ned Stark',
        '"Elementar, meu caro Watson" - Sherlock Holmes',
        '"Por que tão sério?" - Coringa',
        '"Com grandes poderes vêm grandes responsabilidades" - Tio Ben',
        '"Bazinga!" - Sheldon Cooper',
        '"A noite é escura e cheia de horrores" - Melisandre',
        '"Eu sou Groot" - Groot',
        '"O medo é o caminho para o lado negro" - Yoda',
        '"Hasta la vista, baby" - Exterminador do Futuro',
        '"Eu sou Batman" - Batman',
        '"Meu precioso..." - Gollum',
        '"Eu escolho você!" - Ash Ketchum',
        '"Para o infinito e além!" - Buzz Lightyear',
        '"A força está com você" - Obi-Wan Kenobi',
        '"Eu sou inevitável" - Thanos',
        '"Vingadores, Avante!" - Capitão América',
        '"42" - Guia do Mochileiro das Galáxias',
        '"Você não passará!" - Gandalf',
        '"Viver muito e prosperar" - Spock',
        '"A Matrix está em todo lugar" - Morpheus',
        '"Que a Força esteja com você" - Star Wars',
        '"O conhecimento é poder" - Francis Bacon (e muitos nerds)',
        '"Não entre em pânico" - O Guia do Mochileiro das Galáxias',
        '"Um anel para todos governar" - O Senhor dos Anéis',
        '"Eu entendi a referência!" - Capitão América',
        '"Isso é o que eu faço: eu bebo e sei das coisas" - Tyrion Lannister',
        '"Onde vamos, não precisamos de estradas" - De Volta para o Futuro',
        '"Mantenha seus amigos por perto e seus inimigos mais perto ainda" - O Poderoso Chefão',
        '"Tudo o que temos de decidir é o que fazer com o tempo que nos é dado" - Gandalf',
        '"Lute como um herói ou viva o suficiente para se tornar o vilão" - Batman: O Cavaleiro das Trevas',
        '"Wubba Lubba Dub Dub!" - Rick Sanchez',
        '"Este é o caminho" - O Mandaloriano',
        '"Pikachu, eu escolho você!" - Ash Ketchum',
        '"Kamehameha!" - Goku',
        '"Shinzou wo Sasageyo!" - Attack on Titan',
        '"O mundo não é feito de átomos; é feito de histórias" - Stan Lee',
        '"Pressione F para prestar homenagem" - Call of Duty',
        '"É perigoso ir sozinho! Tome isto" - The Legend of Zelda'
    ];

    let currentQuote = "";

    function setRandomQuote() {
        const el = document.getElementById('nerd-quote');
        if (!el) return;
        const idx = Math.floor(Math.random() * quotes.length);
        currentQuote = quotes[idx];
        el.textContent = currentQuote;
    }

    function shareQuote() {
        const shareData = {
            title: 'Citação Nerd do Professor Vine',
            text: currentQuote + ' - Visto em profevine.com.br',
            url: 'https://profevine.com.br'
        };

        if (navigator.share) {
            navigator.share(shareData)
                .catch((err) => console.log('Erro ao compartilhar:', err));
        } else {
            // Fallback: Copiar para o clipboard
            const textArea = document.createElement("textarea");
            textArea.value = shareData.text;
            document.body.appendChild(textArea);
            textArea.select();
            try {
                document.execCommand('copy');
                alert('Citação copiada para a área de transferência!');
            } catch (err) {
                console.error('Erro ao copiar:', err);
            }
            document.body.removeChild(textArea);
        }
    }

    // --- Sistema de Abas ---
    function initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');
        
        console.log('Botões de aba encontrados:', tabButtons.length);
        console.log('Painéis de aba encontrados:', tabPanels.length);

        tabButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');
                console.log('Aba clicada:', tabId);

                // Remove active class from all buttons and panels
                tabButtons.forEach(function(b) {
                    b.classList.remove('active');
                    b.setAttribute('aria-selected', 'false');
                });
                tabPanels.forEach(function(p) {
                    p.classList.remove('active');
                });

                // Add active class to clicked button and corresponding panel
                this.classList.add('active');
                this.setAttribute('aria-selected', 'true');
                const targetPanel = document.getElementById(tabId);
                console.log('Painel de destino encontrado:', !!targetPanel);
                if (targetPanel) {
                    targetPanel.classList.add('active');
                }

                // If blog tab is clicked, render posts
                if (tabId === 'blog') {
                    renderPosts();
                }
            });
        });
    }

    // --- Blog Logic ---
    const API_URL = 'https://girls-any-buying-brunette.trycloudflare.com/api';
    let blogPosts = [];

    async function loadPosts() {
        try {
            const response = await fetch(\`\${API_URL}/posts\`);
            if (!response.ok) throw new Error(\`Erro HTTP: \${response.status}\`);
            blogPosts = await response.json();
            return blogPosts;
        } catch (error) {
            console.error('Erro ao carregar posts:', error);
            return { error: true, message: error.message };
        }
    }

    async function renderPosts() {
        const container = document.getElementById('blog-posts');
        if (!container) return;

        container.innerHTML = '<div class="loading-spinner">Carregando pensamentos...</div>';
        
        const result = await loadPosts();
        container.innerHTML = '';

        if (result.error) {
            container.innerHTML = \`
                <div class="error-msg" style="padding: 20px; text-align: center; color: var(--text-muted);">
                    <p>⚠️ Não foi possível carregar os posts.</p>
                    <p><small>Verifique se a porta 5000 está aberta no roteador e se o IP externo está correto.</small></p>
                    <p><small>Erro: \${result.message}</small></p>
                </div>\`;
            return;
        }

        if (result.length === 0) {
            container.innerHTML = '<p>Nenhum post ainda.</p>';
            return;
        }

        result.forEach(post => {
            const card = document.createElement('article');
            card.className = 'blog-card';
            card.innerHTML = \`
                <span class="blog-category">\${post.category}</span>
                <span class="blog-date">\${formatDate(post.date)}</span>
                <h3>\${post.title}</h3>
                <div class="blog-excerpt">\${post.content}</div>
            \`;
            container.appendChild(card);
        });
    }

    function formatDate(dateStr) {
        if (!dateStr) return '';
        const options = { day: '2-digit', month: 'long', year: 'numeric' };
        return new Date(dateStr).toLocaleDateString('pt-BR', options);
    }

    // --- Admin Logic ---
    const ADMIN_TOKEN_KEY = 'profevine-admin-token';
    
    function initAdmin() {
        const loginLink = document.getElementById('admin-login-link');
        const loginModal = document.getElementById('login-modal');
        const loginForm = document.getElementById('login-form');
        const postModal = document.getElementById('post-modal');
        const postForm = document.getElementById('post-form');
        const newPostBtn = document.getElementById('new-post-btn');
        const closeModals = document.querySelectorAll('.close-modal');

        // Check if already logged in (check for token)
        if (localStorage.getItem(ADMIN_TOKEN_KEY)) {
            document.getElementById('admin-controls').style.display = 'block';
        }

        loginLink.addEventListener('click', (e) => {
            e.preventDefault();
            loginModal.style.display = 'flex';
        });

        loginForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const username = document.getElementById('username').value;
            const password = document.getElementById('password').value;

            try {
                const response = await fetch(\`\${API_URL}/login\`, {
                    method: 'POST',
                    headers: { 'Content-Type': 'application/json' },
                    body: JSON.stringify({ username, password })
                });

                if (response.ok) {
                    const data = await response.json();
                    localStorage.setItem(ADMIN_TOKEN_KEY, data.token);
                    document.getElementById('admin-controls').style.display = 'block';
                    loginModal.style.display = 'none';
                    alert('Bem-vindo, Professor!');
                    loginForm.reset();
                } else {
                    alert('Acesso negado!');
                }
            } catch (error) {
                alert('Erro ao conectar ao servidor!');
            }
        });

        newPostBtn.addEventListener('click', () => {
            postModal.style.display = 'flex';
        });

        postForm.addEventListener('submit', async (e) => {
            e.preventDefault();
            const token = localStorage.getItem(ADMIN_TOKEN_KEY);
            if (!token) {
                alert('Sessão expirada. Faça login novamente.');
                return;
            }

            const newPost = {
                title: document.getElementById('post-title').value,
                category: document.getElementById('post-category').value,
                date: new Date().toISOString().split('T')[0],
                content: document.getElementById('post-content').value
            };

            try {
                const response = await fetch(\`\${API_URL}/posts\`, {
                    method: 'POST',
                    headers: { 
                        'Content-Type': 'application/json',
                        'Authorization': \`Bearer \${token}\`
                    },
                    body: JSON.stringify(newPost)
                });

                if (response.ok) {
                    postModal.style.display = 'none';
                    postForm.reset();
                    renderPosts();
                } else if (response.status === 401 || response.status === 403) {
                    alert('Sessão inválida. Faça login novamente.');
                    localStorage.removeItem(ADMIN_TOKEN_KEY);
                    document.getElementById('admin-controls').style.display = 'none';
                } else {
                    alert('Erro ao publicar post.');
                }
            } catch (error) {
                alert('Erro de conexão!');
            }
        });

        closeModals.forEach(btn => {
            btn.addEventListener('click', () => {
                loginModal.style.display = 'none';
                postModal.style.display = 'none';
            });
        });

        // Close on background click
        window.addEventListener('click', (e) => {
            if (e.target === loginModal) loginModal.style.display = 'none';
            if (e.target === postModal) postModal.style.display = 'none';
        });
    }

    // --- Inicialização ---
    document.addEventListener('DOMContentLoaded', function() {
        console.log('Script carregado e DOM pronto.');
        
        try {
            initTheme();
        } catch (e) { console.error('Erro no tema:', e); }

        try {
            setRandomQuote();
        } catch (e) { console.error('Erro nas citações:', e); }

        try {
            initTabs();
        } catch (e) { console.error('Erro nas abas:', e); }

        try {
            initAdmin();
        } catch (e) { console.error('Erro no admin:', e); }

        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
        }

        const shareBtn = document.getElementById('share-quote-btn');
        if (shareBtn) {
            shareBtn.addEventListener('click', shareQuote);
        }
    });
})();
