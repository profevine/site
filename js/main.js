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
        '"A Matrix está em todo lugar" - Morpheus'
    ];

    function setRandomQuote() {
        const el = document.getElementById('nerd-quote');
        if (!el) return;
        const idx = Math.floor(Math.random() * quotes.length);
        el.textContent = quotes[idx];
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

    // --- Inicialização ---
    document.addEventListener('DOMContentLoaded', function() {
        initTheme();
        setRandomQuote();
        initTabs();

        const toggleBtn = document.getElementById('theme-toggle');
        if (toggleBtn) {
            toggleBtn.addEventListener('click', toggleTheme);
        }
    });
})();
