/**
 * Utilidades para formatear datos del sistema
 */

/**
 * Limpia y formatea una cadena de horario o día de la semana.
 * Corrige errores comunes de codificación (UTF-8 mal interpretado) y recorta segundos.
 * 
 * @param {string} text - El texto a formatear (ej: "S├íbado 10:00:00")
 * @returns {string} - El texto limpio (ej: "Sábado 10:00")
 */
const formatSchedule = (text) => {
    if (!text) return '';

    let cleanText = text.toString();

    // 1. Corregir errores de codificación comunes para días con tildes
    const encodingMaps = {
        'S├íbado': 'Sábado',
        'Síbado': 'Sábado',
        'S-íbado': 'Sábado',
        'Mi├®rcoles': 'Miércoles',
        'Mi-©rcoles': 'Miércoles',
        'Mi©rcoles': 'Miércoles'
    };

    // Reemplazo robusto para variaciones de codificación en días de la semana
    // Captura "S" o "Mi" seguido de cualquier caracter no alfabético (incluyendo espacios y símbolos) hasta el resto de la palabra
    cleanText = cleanText.replace(/S\s*[^a-zñáéíóú\s]*\s*íbado/gi, 'Sábado');
    cleanText = cleanText.replace(/Mi\s*[^a-zñáéíóú\s]*\s*rcoles/gi, 'Miércoles');

    // Mapeo directo si aún quedan residuos
    Object.entries(encodingMaps).forEach(([bad, good]) => {
        cleanText = cleanText.replace(new RegExp(bad, 'g'), good);
    });

    // 2. Recortar segundos (HH:mm:ss -> HH:mm)
    // Busca patrones de tiempo como "10:00:00" y los deja como "10:00"
    cleanText = cleanText.replace(/(\d{2}:\d{2}):00/g, '$1');

    return cleanText.trim();
};

module.exports = {
    formatSchedule
};
