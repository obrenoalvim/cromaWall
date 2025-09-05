
import ColorThief from 'colorthief';


export async function extractPalette(imgUrl) {
    return new Promise((resolve, reject) => {
        const img = new Image();
        img.crossOrigin = 'anonymous';
        img.referrerPolicy = 'no-referrer';
        
        img.onload = () => {
            try {
                const colorThief = new ColorThief();
                const dominantColor = colorThief.getColor(img);
                const palette = colorThief.getPalette(img, 5);
                
                const rgbToHex = (r, g, b) => `#${[r, g, b].map(x => x.toString(16).padStart(2, '0')).join('')}`;
                
                resolve({
                    dominant: rgbToHex(...dominantColor),
                    palette: palette.map(color => rgbToHex(...color))
                });
            } catch (error) {
                reject(error);
            }
        };
        
        img.onerror = () => reject(new Error('Erro ao carregar imagem para extração de cores'));
        img.src = imgUrl;
    });
}