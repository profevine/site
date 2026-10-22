/**
 * Professor Vine - Main JavaScript
 * Funcionalidades: citações nerd, sistema de abas,
 * voltar ao topo, ano dinâmico e animações on-scroll
 * (o tema claro/escuro fica em js/theme.js, igual ao blog)
 */

(function() {
    'use strict';

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

    let currentQuoteIdx = -1;

    function setRandomQuote() {
        const el = document.getElementById('nerd-quote');
        if (!el) return;
        let idx;
        do { idx = Math.floor(Math.random() * quotes.length); } while (idx === currentQuoteIdx);
        currentQuoteIdx = idx;
        const quote = quotes[idx];
        el.textContent = quote;
        el.setAttribute('data-quote', quote);

        const shareBtn = document.getElementById('share-quote-btn');
        if (shareBtn) {
            shareBtn.onclick = function() { shareQuote(quote); };
        }
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

    // --- Inicialização ---
    document.addEventListener('DOMContentLoaded', function() {
        setRandomQuote();
        initTabs();
        initBackToTop();
        updateYear();
        initScrollAnimations();

        const shuffleBtn = document.getElementById('shuffle-quote-btn');
        if (shuffleBtn) {
            shuffleBtn.addEventListener('click', setRandomQuote);
        }
    });
})();
