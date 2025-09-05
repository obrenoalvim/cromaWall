/**
 * Serviço para processamento de imagens
 * Converte arquivos de imagem para URLs utilizáveis
 */

export class ImageProcessor {
    constructor() {
        this.maxFileSize = 10 * 1024 * 1024; // 10MB
        this.allowedTypes = ['image/jpeg', 'image/png', 'image/webp'];
    }

    /**
     * Processa um arquivo de imagem e retorna uma URL
     * @param {File} file - Arquivo de imagem
     * @returns {Promise<string>} URL da imagem processada
     */
    async processFile(file) {
        // Validar tipo de arquivo
        if (!this.allowedTypes.includes(file.type)) {
            throw new Error('Tipo de arquivo não suportado. Use JPG, PNG ou WebP.');
        }

        // Validar tamanho
        if (file.size > this.maxFileSize) {
            throw new Error('Arquivo muito grande. Máximo 10MB.');
        }

        // Converter para URL
        return new Promise((resolve, reject) => {
            const reader = new FileReader();
            
            reader.onload = (e) => {
                resolve(e.target.result);
            };
            
            reader.onerror = () => {
                reject(new Error('Erro ao ler arquivo'));
            };
            
            reader.readAsDataURL(file);
        });
    }

    /**
     * Valida se uma URL de imagem é válida
     * @param {string} url - URL da imagem
     * @returns {Promise<boolean>} Se a imagem é válida
     */
    async validateImageUrl(url) {
        return new Promise((resolve) => {
            const img = new Image();
            img.onload = () => resolve(true);
            img.onerror = () => resolve(false);
            img.src = url;
        });
    }
}