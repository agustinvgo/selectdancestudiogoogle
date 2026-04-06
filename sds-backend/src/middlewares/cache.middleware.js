/**
 * Middleware de Caché en Memoria Ligero
 * Para endpoints GET que devuelven datos que cambian poco (Cursos, Equipo, etc.)
 * 
 * Uso:
 *   const { cacheMiddleware, invalidateCache } = require('./cache.middleware');
 *   router.get('/', cacheMiddleware('cursos-list', 60), Controller.getAll);
 *   router.post('/', isAdmin, invalidateCache('cursos-list'), Controller.create);
 */

const cache = new Map();

/**
 * Crea un middleware de caché con TTL configurable.
 * @param {string} key - Clave única de la caché.
 * @param {number} ttlSeconds - Tiempo de vida en segundos (default: 60s).
 */
function cacheMiddleware(key, ttlSeconds = 60) {
    return (req, res, next) => {
        // No cachear en desarrollo para facilitar el debugging
        if (process.env.NODE_ENV !== 'production') {
            return next();
        }

        const cached = cache.get(key);
        const now = Date.now();

        if (cached && (now - cached.timestamp) < ttlSeconds * 1000) {
            // Cache hit
            return res.json(cached.data);
        }

        // Cache miss: interceptar res.json para guardar la respuesta
        const originalJson = res.json.bind(res);
        res.json = (data) => {
            // Solo cachear respuestas exitosas
            if (res.statusCode === 200) {
                cache.set(key, { data, timestamp: now });
            }
            return originalJson(data);
        };

        next();
    };
}

/**
 * Middleware que invalida (elimina) una entrada de caché.
 * Usar después de POST/PUT/DELETE en la misma ruta.
 * @param {string} key - Clave de caché a invalidar.
 */
function invalidateCache(key) {
    return (req, res, next) => {
        cache.delete(key);
        next();
    };
}

/**
 * Limpiar toda la caché (para debugging o reseteo manual).
 */
function clearAllCache() {
    cache.clear();
}

/**
 * Obtener estadísticas de la caché (para un endpoint de admin/debug).
 */
function getCacheStats() {
    const stats = [];
    cache.forEach((value, key) => {
        stats.push({
            key,
            age: Math.round((Date.now() - value.timestamp) / 1000),
        });
    });
    return stats;
}

module.exports = {
    cacheMiddleware,
    invalidateCache,
    clearAllCache,
    getCacheStats
};
