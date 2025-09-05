
import { CanvasRenderer } from './services/canvas-renderer.js';
import { ImageProcessor } from './services/image-processor.js';
import { extractPalette } from './utils/color-utils.js';
import { DEFAULT_TEXTS } from './config.js';
import { 
    showLoading, 
    showError, 
    hideError, 
    updateMetadata, 
    downloadWallpaper, 
    copyPromptToClipboard
} from './utils/ui-utils.js';

export class WallpaperGeneratorApp {
    constructor() {
        this.renderer = new CanvasRenderer('canvas');
        this.imageProcessor = new ImageProcessor();
        this.currentWallpaperData = null;
        
        this.init();
    }

    init() {
        this.setupEventListeners();
    }


    resetCustomizationToDefaults() {
        const defaults = {
            bgColor: '#000000',
            textColor: '#ffffff',
            accentColor: '',
            gradientStrength: 1,
            gradientDirection: 'vertical',
            vignetteIntensity: 0,
            showPalette: true,
        };

        const setValue = (id, value) => {
            const el = document.getElementById(id);
            if (!el) return;
            if (el.type === 'checkbox') {
                el.checked = Boolean(value);
            } else {
                el.value = value ?? '';
            }
        };

        setValue('bgColor', defaults.bgColor);
        setValue('textColor', defaults.textColor);
        setValue('accentColor', defaults.accentColor);
        setValue('gradientStrength', String(defaults.gradientStrength));
        setValue('gradientDirection', defaults.gradientDirection);
        setValue('vignetteIntensity', String(defaults.vignetteIntensity));
        setValue('showPalette', defaults.showPalette);
    }

    getCustomizationSettings() {
        return {
            bgColor: document.getElementById('bgColor')?.value || undefined,
            accentColor: document.getElementById('accentColor')?.value || undefined,
            gradientStrength: parseFloat(document.getElementById('gradientStrength')?.value || '1'),
            gradientDirection: document.getElementById('gradientDirection')?.value || 'vertical',
            textColor: document.getElementById('textColor')?.value || 'light',
            vignetteIntensity: parseFloat(document.getElementById('vignetteIntensity')?.value || '0'),
            showPalette: document.getElementById('showPalette')?.checked === true,
        };
    }

    getUserTexts() {
        return {
            title: document.getElementById('titleText')?.value || DEFAULT_TEXTS.TITLE,
            subtitle: document.getElementById('subtitleText')?.value || DEFAULT_TEXTS.SUBTITLE,
            duration: document.getElementById('durationText')?.value || DEFAULT_TEXTS.DURATION,
            description: document.getElementById('descriptionText')?.value || DEFAULT_TEXTS.DESCRIPTION,
        };
    }

    setupEventListeners() {
        // Upload de imagem
        document.getElementById('imageUpload').addEventListener('change', (e) => {
            if (e.target.files && e.target.files[0]) {
                this.handleImageUpload(e.target.files[0]);
            }
        });

        // Gerar wallpaper
        document.getElementById('generateBtn').addEventListener('click', () => {
            this.generateWallpaper(true);
        });

        // Download
        document.getElementById('downloadBtn').addEventListener('click', () => {
            downloadWallpaper(this.currentWallpaperData);
        });

        // Copiar prompt
        document.getElementById('copyPromptBtn').addEventListener('click', () => {
            copyPromptToClipboard();
        });

        // Inputs de texto
        const textIds = ['titleText', 'subtitleText', 'durationText', 'descriptionText'];
        textIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.rerenderWithCurrentSettings());
            }
        });

        // Copiar prompt (apenas se existir na página)
        const copyBtn = document.getElementById('copyPromptBtn');
        if (copyBtn) {
            copyBtn.addEventListener('click', () => {
                copyPromptToClipboard();
            });
        }

        // Customização
        const customIds = ['bgColor','accentColor','gradientStrength','gradientDirection','textColor','vignetteIntensity','showPalette'];
        customIds.forEach(id => {
            const el = document.getElementById(id);
            if (el) {
                el.addEventListener('input', () => this.rerenderWithCurrentSettings());
                el.addEventListener('change', () => this.rerenderWithCurrentSettings());
            }
        });
    }

    async handleImageUpload(file) {
        if (file.size > 10 * 1024 * 1024) { // 10MB
            showError('Arquivo muito grande. Máximo 10MB.');
            return;
        }

        showLoading(true);
        hideError();

        try {
            const imageUrl = await this.imageProcessor.processFile(file);
            await this.generateWallpaperFromImage(imageUrl, true);
        } catch (error) {
            showError('Erro ao processar imagem: ' + error.message);
        } finally {
            showLoading(false);
        }
    }

    async rerenderWithCurrentSettings() {
        if (!this.currentWallpaperData) return;
        const settings = this.getCustomizationSettings();
        const texts = this.getUserTexts();
        const wallpaperData = {
            ...this.currentWallpaperData,
            trackTitle: texts.title,
            subtitleText: texts.subtitle,
            durationText: texts.duration,
            description: texts.description,
        };
        await this.renderer.renderWallpaper(wallpaperData, settings);
        this.updatePrompt?.(wallpaperData, settings);
    }

    async generateWallpaper(reset = false) {
        const fileInput = document.getElementById('imageUpload');
        if (!fileInput.files || !fileInput.files[0]) {
            showError('Por favor, selecione uma imagem');
            return;
        }

        await this.handleImageUpload(fileInput.files[0]);
    }

    async generateWallpaperFromImage(imageUrl, reset = false) {
        showLoading(true);
        hideError();

        try {
            if (reset) {
                this.resetCustomizationToDefaults();
                await this.renderer.reset();
            }

            // Extrair paleta de cores da imagem
            const colorData = await extractPalette(imageUrl);

            // Obter textos do usuário
            const texts = this.getUserTexts();

            // Criar dados do wallpaper
            this.currentWallpaperData = {
                trackTitle: texts.title,
                subtitleText: texts.subtitle,
                durationText: texts.duration,
                description: texts.description,
                albumCover: imageUrl,
                ...colorData,
            };

            // Atualizar cor de acento com a cor dominante
            if (reset && this.currentWallpaperData?.dominant) {
                const accentEl = document.getElementById('accentColor');
                if (accentEl) accentEl.value = this.currentWallpaperData.dominant;
            }

            // Renderizar wallpaper
            await this.renderer.renderWallpaper(this.currentWallpaperData, this.getCustomizationSettings());
            
            // Atualizar UI
            updateMetadata(this.currentWallpaperData);
            // this.updatePrompt(this.currentWallpaperData, this.getCustomizationSettings());
            
            document.getElementById('downloadBtn').disabled = false;

        } catch (error) {
            showError('Erro ao gerar wallpaper: ' + error.message);
        } finally {
            showLoading(false);
        }
    }

//     updatePrompt(data, settings) {
//         const prompt = `Crie um poster minimalista 1080x1920 com moldura preta e fundo branco:

// LAYOUT:
// - Fundo branco com moldura preta fina ao redor
// - Imagem principal centralizada no topo (960x1200px)
// - Paleta de 5 cores em quadrados pequenos, alinhada à esquerda abaixo da imagem
// - Título "${data.trackTitle || DEFAULT_TEXTS.TITLE}" em fonte grande, alinhado à direita na base da imagem
// - Informações à esquerda abaixo da paleta:
//   * Subtítulo: "${data.subtitleText || DEFAULT_TEXTS.SUBTITLE}"
//   * Ano/Data: "${data.durationText || DEFAULT_TEXTS.DURATION}"
//   * Descrição: "${data.description || DEFAULT_TEXTS.DESCRIPTION}"

// PALETA DE CORES: ${data.palette ? data.palette.join(', ') : 'N/A'}
// COR DOMINANTE: ${data.dominant || 'N/A'}

// ESTILO: poster minimalista estilo cidade/viagem, tipografia limpa Inter, texto preto sobre fundo branco, moldura elegante, composição equilibrada, resolução 1080×1920.`;

//         document.getElementById('promptTextarea').value = prompt;
//     }

    async simulateInitialRender() {
        try {
            // Usar uma imagem de exemplo do Pexels
            const exampleImageUrl = 'https://images.pexels.com/photos/1591056/pexels-photo-1591056.jpeg?auto=compress&cs=tinysrgb&w=800';
            
            const demoData = {
                trackTitle: DEFAULT_TEXTS.TITLE,
                subtitleText: DEFAULT_TEXTS.SUBTITLE,
                durationText: DEFAULT_TEXTS.DURATION,
                description: DEFAULT_TEXTS.DESCRIPTION,
                albumCover: exampleImageUrl
            };

            const colorData = await extractPalette(exampleImageUrl);

            this.currentWallpaperData = {
                ...demoData,
                ...colorData
            };

            // Preencher campos de texto com valores padrão
            document.getElementById('titleText').value = DEFAULT_TEXTS.TITLE;
            document.getElementById('subtitleText').value = DEFAULT_TEXTS.SUBTITLE;
            document.getElementById('durationText').value = DEFAULT_TEXTS.DURATION;
            document.getElementById('descriptionText').value = DEFAULT_TEXTS.DESCRIPTION;

            const accentEl = document.getElementById('accentColor');
            if (accentEl && this.currentWallpaperData?.dominant) {
                accentEl.value = this.currentWallpaperData.dominant;
            }

            await this.renderer.renderWallpaper(this.currentWallpaperData, this.getCustomizationSettings());
            updateMetadata(this.currentWallpaperData);
            this.updatePrompt?.(this.currentWallpaperData, this.getCustomizationSettings());
            document.getElementById('downloadBtn').disabled = false;
        } catch (e) {
            console.warn('Simulação inicial falhou:', e);
        }
    }
}