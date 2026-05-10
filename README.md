# Professor Vine - Página Pessoal

Site pessoal do Professor Vine - Educador em Computação & Idiomas.

🌐 **URL:** https://profevine.com.br

## 🚀 Funcionalidades

- ✅ **Dark Mode** com persistência em localStorage
- ✅ **Design Responsivo** (mobile-first)
- ✅ **Acessibilidade** (skip links, foco visível, ARIA labels)
- ✅ **Performance** (imagens WebP, lazy loading, preconnect)
- ✅ **SEO** (meta tags, Open Graph, Schema.org markup)
- ✅ **Animações** suaves com Intersection Observer
- ✅ **Botão voltar ao topo** com scroll suave
- ✅ **Ano dinâmico** no footer
- ✅ **Compartilhamento** de citações nerd

## 📁 Estrutura

```
site/
├── index.html          # Página principal
├── css/
│   └── style.css       # Estilos e temas
├── js/
│   └── main.js         # JavaScript funcional
├── images/             # Imagens (WebP + originais)
├── assets/             # Outros assets
├── .gitignore          # Git ignore rules
├── README.md           # Este arquivo
├── robots.txt          # Robots.txt
├── sitemap.xml         # Sitemap
└── .well-known/        # Verificações de domínio
```

## 🛠️ Desenvolvimento

### Pré-requisitos

- Navegador moderno (Chrome, Firefox, Edge, Safari)
- Opcional: ImageMagick para converter imagens

### Convertendo Imagens para WebP

```bash
cd images
for img in *.jpg *.jpeg *.png; do
    convert "$img" -quality 85 "${img%.*}.webp"
done
```

### Servidor Local

```bash
# Python 3
python -m http.server 8000

# Node.js
npx serve

# PHP
php -S localhost:8000
```

Acesse: http://localhost:8000

## 📊 Performance

- Imagens otimizadas em WebP (~30-50% menores)
- Lazy loading para imagens abaixo do fold
- CSS e JS minificáveis para produção
- Preconnect para domínios externos

## 🔧 Melhorias Futuras

- [ ] PWA com Service Worker
- [ ] Google Fonts (Inter, Poppins)
- [ ] Integração com API do GitHub (últimos projetos)
- [ ] Integração com API da Twitch (últimas lives)
- [ ] Formulário de contato
- [ ] Analytics (Plausible/Umami)
- [ ] Minificação de CSS/JS para produção

## 📄 Licença

Todos os direitos reservados © Professor Vine

## 📞 Contato

- Email: lordehenry@gmail.com
- TikTok: [@profevin3](https://www.tiktok.com/@profevin3)
- YouTube: [lordehenry](https://youtube.com/lordehenry)
- Twitch: [profevine](https://twitch.tv/profevine)
