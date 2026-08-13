const MAX_TEAM_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_TEAM_IMAGE_DIMENSION = 1600;
const ALLOWED_TEAM_IMAGE_TYPES = new Set(['image/jpeg', 'image/png', 'image/webp']);

const canvasToWebp = (canvas) => new Promise((resolve, reject) => {
    canvas.toBlob(
        (blob) => blob ? resolve(blob) : reject(new Error('No se pudo preparar la imagen.')),
        'image/webp',
        0.84
    );
});

export const prepareTeamImage = async (file) => {
    if (!file) return null;
    if (file.size > MAX_TEAM_IMAGE_BYTES) {
        throw new Error('La imagen supera el máximo permitido de 10 MB.');
    }
    if (!ALLOWED_TEAM_IMAGE_TYPES.has(file.type)) {
        throw new Error('Usa una imagen JPG, PNG o WebP. Si está en formato HEIC, expórtala primero como JPG.');
    }
    if (typeof createImageBitmap !== 'function') return file;

    let bitmap;
    try {
        bitmap = await createImageBitmap(file, { imageOrientation: 'from-image' });
        const scale = Math.min(1, MAX_TEAM_IMAGE_DIMENSION / Math.max(bitmap.width, bitmap.height));
        const width = Math.max(1, Math.round(bitmap.width * scale));
        const height = Math.max(1, Math.round(bitmap.height * scale));
        const canvas = document.createElement('canvas');
        canvas.width = width;
        canvas.height = height;
        const context = canvas.getContext('2d', { alpha: false });
        if (!context) return file;
        context.fillStyle = '#ffffff';
        context.fillRect(0, 0, width, height);
        context.drawImage(bitmap, 0, 0, width, height);

        const blob = await canvasToWebp(canvas);
        const baseName = file.name.replace(/\.[^.]+$/, '') || 'equipo';
        return new File([blob], `${baseName}.webp`, {
            type: 'image/webp',
            lastModified: Date.now(),
        });
    } catch (error) {
        console.warn('[Equipo] No se pudo optimizar la imagen en el navegador:', error);
        return file;
    } finally {
        bitmap?.close?.();
    }
};
