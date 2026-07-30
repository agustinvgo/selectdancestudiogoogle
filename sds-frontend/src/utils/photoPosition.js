const numberOr = (value, fallback) => {
    const parsed = Number(value);
    return Number.isFinite(parsed) ? parsed : fallback;
};

export const parsePhotoPosition = (value) => {
    if (!value) return { x: 50, y: 50, zoom: 1 };

    try {
        if (typeof value === 'object') {
            return {
                x: numberOr(value.x, 50),
                y: numberOr(value.y, 50),
                zoom: numberOr(value.zoom, 1)
            };
        }

        const normalized = String(value).trim();
        if (normalized.startsWith('{')) {
            return parsePhotoPosition(JSON.parse(normalized));
        }

        // Compatibilidad con posiciones guardadas antes de incorporar sliders.
        if (normalized === 'top') return { x: 50, y: 75, zoom: 1.2 };
        if (normalized === 'bottom') return { x: 50, y: 25, zoom: 1.2 };
        if (normalized === 'center') return { x: 50, y: 50, zoom: 1 };

        const parts = normalized.split(/\s+/);
        return {
            x: parts[0]?.includes('%') ? numberOr(parseInt(parts[0], 10), 50) : 50,
            y: parts[1]?.includes('%') ? numberOr(parseInt(parts[1], 10), 50) : 50,
            zoom: numberOr(parts[2], 1)
        };
    } catch {
        return { x: 50, y: 50, zoom: 1 };
    }
};

// Esta fórmula es la única fuente de verdad para el encuadre. Debe utilizarse
// tanto en la vista previa del administrador como en la página pública.
export const getPhotoCropStyle = (value) => {
    const { x, y, zoom } = parsePhotoPosition(value);
    const translateX = (x - 50) * 0.5;
    const translateY = (y - 50) * 0.5;

    return {
        objectFit: 'cover',
        transform: `scale(${zoom}) translate(${translateX}%, ${translateY}%)`
    };
};
