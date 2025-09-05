

export function showLoading(show) {
    const loading = document.getElementById('loading');
    const generateBtn = document.getElementById('generateBtn');
    
    if (show) {
        loading.classList.add('show');
        loading.setAttribute('aria-hidden', 'false');
        generateBtn.disabled = true;
        generateBtn.setAttribute('aria-busy', 'true');
    } else {
        loading.classList.remove('show');
        loading.setAttribute('aria-hidden', 'true');
        generateBtn.disabled = false;
        generateBtn.setAttribute('aria-busy', 'false');
    }
}


export function showError(message) {
    const errorEl = document.getElementById('errorMessage');
    errorEl.textContent = message;
    errorEl.classList.add('show');
}


export function hideError() {
    const errorEl = document.getElementById('errorMessage');
    errorEl.classList.remove('show');
    errorEl.textContent = '';
}


export function updateMetadata(data) {
    document.getElementById('metaTitle').textContent = data.trackTitle;
    document.getElementById('metaArtist').textContent = data.subtitleText;
    document.getElementById('metaDuration').textContent = data.durationText || '';
    document.getElementById('metaColor').textContent = data.dominant;
    document.getElementById('metadata').style.display = 'block';
}

export async function copyPromptToClipboard() {
    const textarea = document.getElementById('promptTextarea');
    const btn = document.getElementById('copyPromptBtn');
    try {
        await navigator.clipboard.writeText(textarea.value || '');
        const original = btn.textContent;
        btn.textContent = 'Copiado!';
        setTimeout(() => (btn.textContent = original), 1500);
    } catch (e) {
        console.warn('Falha ao copiar:', e);
    }
}

export function downloadWallpaper(currentTrackData) {
    if (!currentTrackData) return;
    const canvas = document.getElementById('canvas');
    const link = document.createElement('a');
    link.download = `wallpaper-${(currentTrackData.trackTitle || 'personalizado').replace(/[^a-zA-Z0-9]/g, '-')}.png`;
    link.href = canvas.toDataURL('image/png');
    link.click();
}