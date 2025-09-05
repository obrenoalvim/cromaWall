
import { CANVAS_CONFIG, FONT_CONFIG, COLOR_CONFIG, DEFAULT_TEXTS } from '../config.js';
import { wrapText } from '../utils/format-utils.js';

export class CanvasRenderer {
    constructor(canvasId) {
        this.canvas = document.getElementById(canvasId);
        this.ctx = this.canvas.getContext('2d');
        this.settings = {};
        this.lastImageRect = null;
    }

    async reset() {
        const { WIDTH, HEIGHT } = CANVAS_CONFIG;
        this.settings = {};
        try {
            this.ctx.setTransform(1, 0, 0, 1, 0, 0);
            this.ctx.globalCompositeOperation = 'source-over';
            this.ctx.clearRect(0, 0, WIDTH, HEIGHT);
        } catch (_) {  }
    }

    getTextColor() {
        return this.settings?.textColor || COLOR_CONFIG.TEXT;
    }

    async renderWallpaper(data, settings = null) {
        const { WIDTH, HEIGHT } = CANVAS_CONFIG;
        this.settings = settings || {};

        this.ctx.setTransform(1, 0, 0, 1, 0, 0);
        this.ctx.globalCompositeOperation = 'source-over';
        this.ctx.imageSmoothingEnabled = true;
        this.ctx.imageSmoothingQuality = 'high';
        this.ctx.clearRect(0, 0, WIDTH, HEIGHT);

        // Fundo baseado nas configurações
        this.ctx.fillStyle = this.settings?.bgColor || COLOR_CONFIG.BACKGROUND;
        this.ctx.fillRect(0, 0, WIDTH, HEIGHT);

        // Moldura preta
        this.renderFrame();

        // Renderizar imagem principal
        await this.renderMainImage(data.albumCover);

        // Renderizar paleta de cores
        this.renderColorPalette(data.palette || []);

        // Renderizar título à direita
        this.renderTitle(data.trackTitle || DEFAULT_TEXTS.TITLE);

        // Renderizar descrições abaixo da paleta
        this.renderDescriptions(data);
    }

    renderFrame() {
        // Moldura removida - sem borda preta
    }
    async renderMainImage(imageUrl) {
        const { WIDTH, IMAGE, FRAME } = CANVAS_CONFIG;
        const x = (WIDTH - IMAGE.WIDTH) / 2;
        const y = IMAGE.Y_POSITION;
        
        await this.drawImage(imageUrl, x, y, IMAGE.WIDTH, IMAGE.HEIGHT);
    }

    renderColorPalette(palette) {
        const { IMAGE, PALETTE, FRAME } = CANVAS_CONFIG;
        const startX = FRAME.INNER_MARGIN;
        const startY = IMAGE.Y_POSITION + IMAGE.HEIGHT + PALETTE.Y_OFFSET;

        (palette || []).slice(0, 5).forEach((color, index) => {
            const x = startX + (PALETTE.SQUARE_SIZE + PALETTE.GAP) * index;
            const y = startY;
            
            this.ctx.fillStyle = color;
            this.ctx.fillRect(x, y, PALETTE.SQUARE_SIZE, PALETTE.SQUARE_SIZE);
            
            // Borda sutil nos quadrados
            this.ctx.strokeStyle = 'rgba(0, 0, 0, 0.0)';
            this.ctx.lineWidth = 3;
            this.ctx.strokeRect(x + 0.5, y + 0.5, PALETTE.SQUARE_SIZE - 1, PALETTE.SQUARE_SIZE - 1);
        });
    }

    renderTitle(title) {
        const { WIDTH, IMAGE, PALETTE, TEXT, FRAME } = CANVAS_CONFIG;
        const titleX = WIDTH - FRAME.INNER_MARGIN;
        const titleY = IMAGE.Y_POSITION + IMAGE.HEIGHT + PALETTE.Y_OFFSET;

        this.ctx.fillStyle = this.getTextColor();
        this.ctx.font = FONT_CONFIG.TITLE;
        this.ctx.textAlign = 'right';
        this.ctx.textBaseline = 'top';
        
        const titleText = (title || '').toUpperCase();
        this.ctx.fillText(titleText, titleX, titleY);
    }

    renderDescriptions(data) {
        const { IMAGE, PALETTE, TEXT, FRAME } = CANVAS_CONFIG;
        const startX = FRAME.INNER_MARGIN;
        const startY = IMAGE.Y_POSITION + IMAGE.HEIGHT + PALETTE.Y_OFFSET + PALETTE.SQUARE_SIZE + TEXT.DESCRIPTION_Y_OFFSET;

        this.ctx.fillStyle = this.getTextColor();
        this.ctx.textAlign = 'left';
        this.ctx.textBaseline = 'top';
        
        let currentY = startY;
        
        // Subtítulo (ex: JAPÃO)
        if (data.subtitleText) {
            this.ctx.font = FONT_CONFIG.SUBTITLE;
            this.ctx.fillText(data.subtitleText.toUpperCase(), startX, currentY);
            currentY += 45;
        }
        
        // Ano/Data (ex: 2024)
        if (data.durationText) {
            this.ctx.font = FONT_CONFIG.DURATION;
            this.ctx.fillText(data.durationText, startX, currentY);
            currentY += 40;
        }
        
        // Descrição longa
        if (data.description) {
            currentY += 15;
            this.ctx.font = FONT_CONFIG.DESCRIPTION;
            const descLines = wrapText(this.ctx, data.description, TEXT.MAX_DESCRIPTION_WIDTH);
            descLines.forEach((line, index) => {
                this.ctx.fillText(line, startX, currentY + (index * 30));
            });
        }
    }
    async drawImage(src, x, y, targetWidth, targetHeight) {
        return new Promise((resolve, reject) => {
            const img = new Image();
            img.crossOrigin = 'anonymous';
            img.referrerPolicy = 'no-referrer';

            img.onload = () => {
                const iw = img.naturalWidth || img.width;
                const ih = img.naturalHeight || img.height;

                // Cover: preenche o retângulo alvo mantendo proporção e cortando o excedente
                const scale = Math.max(targetWidth / iw, targetHeight / ih);
                const sw = Math.round(targetWidth / scale);
                const sh = Math.round(targetHeight / scale);

                // Recorte centralizado
                const sx = Math.max(0, Math.floor((iw - sw) / 2));
                const sy = Math.max(0, Math.floor((ih - sh) / 2));

                this.ctx.drawImage(img, sx, sy, sw, sh, x, y, targetWidth, targetHeight);

                this.lastImageRect = {
                    x,
                    y,
                    width: targetWidth,
                    height: targetHeight,
                    crop: { sx, sy, sw, sh },
                    scale
                };

                resolve();
            };

            img.onerror = () => reject(new Error('Erro ao carregar imagem'));
            img.src = src;
        });
    }
}