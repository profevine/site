/**
 * Professor Vine - Main JavaScript
 * Funcionalidades: Dark mode, citações nerd, sistema de abas,
 * voltar ao topo, ano dinâmico e animações on-scroll
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
        // Atualiza meta theme-color
        updateMetaThemeColor(theme);
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
        btn.setAttribute('aria-label', theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro');
    }

    function updateMetaThemeColor(theme) {
        let metaThemeColor = document.querySelector('meta[name="theme-color"]');
        if (!metaThemeColor) {
            metaThemeColor = document.createElement('meta');
            metaThemeColor.name = 'theme-color';
            document.head.appendChild(metaThemeColor);
        }
        metaThemeColor.content = theme === 'dark' ? '#0f1419' : '#1e3a5f';
    }

    // --- Citações Nerd com Compartilhamento ---
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
        '"A Matrix está em todo lugar" - Morpheus'
    ];

    function setRandomQuote() {
        const el = document.getElementById('nerd-quote');
        if (!el) return;
        const idx = Math.floor(Math.random() * quotes.length);
        const quote = quotes[idx];
        el.textContent = quote;
        el.setAttribute('data-quote', quote);
        
        // Adiciona botão de compartilhar
        const shareBtn = document.createElement('button');
        shareBtn.className = 'quote-share-btn';
        shareBtn.textContent = '🔗 Compartilhar';
        shareBtn.setAttribute('aria-label', 'Compartilhar citação');
        shareBtn.addEventListener('click', function() {
            shareQuote(quote);
        });
        el.appendChild(shareBtn);
    }

    function shareQuote(quote) {
        const text = `${quote} — via profevine.com.br`;
        const url = 'https://profevine.com.br';
        
        if (navigator.share) {
            navigator.share({
                title: 'Citação Nerd',
                text: text,
                url: url
            }).catch(() => copyToClipboard(text));
        } else {
            copyToClipboard(text);
        }
    }

    function copyToClipboard(text) {
        navigator.clipboard.writeText(text).then(() => {
            showToast('Citação copiada! 📋');
        }).catch(() => {
            showToast('Não foi possível copiar 😕');
        });
    }

    function showToast(message) {
        const toast = document.createElement('div');
        toast.className = 'toast-notification';
        toast.textContent = message;
        document.body.appendChild(toast);
        
        setTimeout(() => toast.classList.add('visible'), 10);
        setTimeout(() => {
            toast.classList.remove('visible');
            setTimeout(() => toast.remove(), 300);
        }, 2000);
    }

    // --- Sistema de Abas ---
    function initTabs() {
        const tabButtons = document.querySelectorAll('.tab-btn');
        const tabPanels = document.querySelectorAll('.tab-panel');

        tabButtons.forEach(function(btn) {
            btn.addEventListener('click', function() {
                const tabId = this.getAttribute('data-tab');

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
                document.getElementById(tabId).classList.add('active');
            });
        });
    }

    // --- Botão Voltar ao Topo ---
    function initBackToTop() {
        const btn = document.getElementById('back-to-top');
        if (!btn) return;

        function toggleButton() {
            if (window.scrollY > 300) {
                btn.classList.add('visible');
            } else {
                btn.classList.remove('visible');
            }
        }

        btn.addEventListener('click', function() {
            window.scrollTo({
                top: 0,
                behavior: 'smooth'
            });
        });

        // Usa Intersection Observer para performance
        const observer = new IntersectionObserver(
            function(entries) {
                entries.forEach(function(entry) {
                    if (!entry.isIntersecting) {
                        toggleButton();
                    }
                });
            },
            { threshold: 0, rootMargin: '-300px 0px 0px 0px' }
        );

        observer.observe(document.body);
        
        // Fallback para scroll direto
        window.addEventListener('scroll', toggleButton, { passive: true });
        toggleButton(); // Check inicial
    }

    // --- Ano Dinâmico no Footer ---
    function updateYear() {
        const yearEl = document.getElementById('current-year');
        if (yearEl) {
            yearEl.textContent = new Date().getFullYear();
        }
    }

    // --- Animações com Intersection Observer ---
    function initScrollAnimations() {
        const animatedElements = document.querySelectorAll('.area-card, .formacao-item, .skill-group, .card');
        
        const observer = new IntersectionObserver(
            function(entries) {
                entries.forEach(function(entry) {
                    if (entry.isIntersecting) {
                        entry.target.classList.add('animate-in');
                        observer.unobserve(entry.target);
                    }
                });
            },
            {
                threshold: 0.1,
                rootMargin: '0px 0px -50px 0px'
            }
        );

        animatedElements.forEach(function(el) {
            el.classList.add('animate-on-scroll');
            observer.observe(el);
        });
    }

    // --- Lazy Loading para Imagens (fallback para browsers antigos) ---
    function initLazyLoading() {
        if ('loading' in HTMLImageElement.prototype) {
            // Browser suporta loading="lazy" nativamente
            const images = document.querySelectorAll('img[loading="lazy"]');
            images.forEach(function(img) {
                img.src = img.src;
            });
        } else {
            // Fallback para browsers antigos
            const script = document.createElement('script');
            script.src = 'https://cdnjs.cloudflare.com/ajax/libs/lozad.js/1.16.0/lozad.min.js';
            script.onload = function() {
                const observer = lozad();
                observer.observe();
            };
            document.head.appendChild(script);
        }
    }

    // --- Preload de Fontes (se usar Google Fonts no futuro) ---
    function preloadResources() {
        // Exemplo para quando adicionar Google Fonts
        // const link = document.createElement('link');
        // link.rel = 'preload';
        // link.as = 'style';
        // link.href = 'https://fonts.googleapis.com/css2?family=Inter:wght@400;600;700&display=swap';
        // document.head.appendChild(link);
    }

    // --- Inicialização ---
    document.addEventListener('DOMContentLoaded', function() {
        initTheme();
        setRandomQuote();
        initTabs();
        initBackToTop();
        updateYear();
        initScrollAnimations();
        initLazyLoading();
        preloadResources();

        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
        }
    });

    // --- Service Worker Registration (opcional, para PWA) ---
    if ('serviceWorker' in navigator) {
        // Descomentar quando tiver sw.js
        // navigator.serviceWorker.register('/sw.js')
        //     .then(function(registration) {
        //         console.log('SW registrado:', registration.scope);
        //     })
        //     .catch(function(error) {
        //         console.log('SW falhou:', error);
        //     });
    }
})();
