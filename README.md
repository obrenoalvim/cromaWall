# CromaWall — Gerador de Poster/Wallpaper 1080×1920

[![CI](https://github.com/obrenoalvim/cromaWall/actions/workflows/ci.yml/badge.svg)](https://github.com/obrenoalvim/cromaWall/actions/workflows/ci.yml) [![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](LICENSE)

Aplicação web para criar posters e wallpapers minimalistas (1080×1920) a partir de qualquer imagem. A ferramenta extrai automaticamente a paleta de cores, permite personalizar textos e aparência e exportar o resultado em PNG.


## Funcionalidades

- Upload de imagem (JPG, PNG, WebP)
- Extração de cores com ColorThief (cor dominante + paleta)
- Renderização em Canvas (1080×1920)
- Textos personalizados: título, subtítulo, ano/data e descrição
- Controles de aparência: cores (fundo e texto) — com base para evoluir (acento, gradiente, vinheta, exibir paleta)
- Download do resultado em PNG
- Interface responsiva

## Requisitos

- Node.js 18+
- npm (ou pnpm/yarn)

## Como executar

1) Instale as dependências
- bash
  npm install

2) Ambiente de desenvolvimento
- bash
  npm run dev

3) Build de produção e preview
- bash
  npm run build
  npm run preview

## Como usar

1) Faça upload de uma imagem (JPG, PNG, WebP)
2) Edite os textos (Título, Subtítulo, Ano/Data, Descrição)
3) Ajuste as cores básicas (fundo e texto)
4) Clique em "Gerar Wallpaper" para renderizar
5) Baixe o PNG

## Estrutura do projeto

- Raiz
  - index.html — HTML de entrada (Vite)
  - package.json — scripts e dependências
  - vercel.json — configuração de deploy (opcional)
  - dist/ — artefatos de build (gerados)
- src/
  - main.js — bootstrap do app
  - styles/main.css — estilos da interface
  - js/config.js — constantes (canvas, fontes, cores, textos padrão)
  - js/app.js — classe principal (WallpaperGeneratorApp)
  - js/services/
    - canvas-renderer.js — desenho no Canvas (layout do poster)
    - image-processor.js — tratamento/validação de imagens
  - js/utils/
    - color-utils.js — extração de paleta via ColorThief
    - format-utils.js — formatação auxiliar
    - ui-utils.js — loading, erros, metadados, download

## Personalização rápida (código)

- Dimensões/layout: src/js/config.js (CANVAS_CONFIG)
- Cores e fontes: src/js/config.js (COLOR_CONFIG, FONT_CONFIG)
- Textos padrão: src/js/config.js (DEFAULT_TEXTS)
- Lógica de desenho: src/js/services/canvas-renderer.js

## Limitações e dicas

- Tamanho do arquivo: uploads acima de 10 MB são bloqueados
- Paleta de cores: a extração depende da qualidade e variedade cromática da imagem
- Compatibilidade: use navegadores modernos (Canvas, ES Modules)

## Dependências principais

- Vite 5 (dev server e build)
- ColorThief (extração de paleta)

## Contribuição

- Abra issues/PRs descrevendo claramente a mudança
- Mantenha o padrão de código e a separação por camadas (services/utils)
- Atualize este README quando alterar comportamento de build/execução

