// Tema claro/escuro — mesmo script do blog (blog.profevine.com.br/js/theme.js).
// Carregado no <head> (sem defer) para aplicar o tema antes da primeira pintura, sem piscar.
// Sem escolha salva, segue o tema do sistema (e acompanha se ele mudar); o botão grava a escolha.
(() => {
    const media = window.matchMedia('(prefers-color-scheme: dark)');
    const saved = () => { try { return localStorage.getItem('theme'); } catch { return null; } };
    const current = () => saved() || (media.matches ? 'dark' : 'light');

    function apply(theme) {
        document.documentElement.setAttribute('data-theme', theme);
        document.documentElement.style.colorScheme = theme;
        const btn = document.getElementById('theme-toggle');
        if (btn) {
            const label = theme === 'dark' ? 'Ativar modo claro' : 'Ativar modo escuro';
            btn.setAttribute('aria-label', label);
            btn.title = label;
        }
        document.dispatchEvent(new CustomEvent('themechange', { detail: theme }));
    }

    apply(current());
    media.addEventListener('change', () => { if (!saved()) apply(current()); });

    document.addEventListener('DOMContentLoaded', () => {
        const btn = document.getElementById('theme-toggle');
        if (!btn) return;
        apply(current());
        btn.addEventListener('click', () => {
            const next = current() === 'dark' ? 'light' : 'dark';
            try { localStorage.setItem('theme', next); } catch {}
            apply(next);
        });
    });
})();
