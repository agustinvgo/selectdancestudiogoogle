const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Middleware genérico para optimizar imágenes a WebP
 * @param {string} targetDir - Directorio relativo a src/middlewares (../../uploads/...)
 * @param {string} prefix - Prefijo para el nombre de archivo (ej. 'equipo', 'curso')
 * @param {number} width - Ancho máximo (default 1000)
 * @param {number} height - Alto máximo (opcional)
 */
const optimizeImage = (targetDir, prefix, width = 1000, height = null) => {
    return async (req, res, next) => {
        if (!req.file) return next();

        try {
            const uploadPath = path.join(__dirname, targetDir);
            if (!fs.existsSync(uploadPath)) {
                fs.mkdirSync(uploadPath, { recursive: true });
            }

            const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
            const filename = `${prefix}-${uniqueSuffix}.webp`;
            const outputPath = path.join(uploadPath, filename);

            let transform = sharp(req.file.buffer);

            if (width || height) {
                transform = transform.resize(width, height, {
                    fit: height ? 'cover' : 'inside', // Si hay alto, recortamos. Si no, escalamos proporcional.
                    withoutEnlargement: true
                });
            }

            await transform
                .webp({ quality: 80 })
                .toFile(outputPath);

            // Actualizar req.file para que el controlador guarde el nuevo nombre
            req.file.filename = filename;
            req.file.path = outputPath;
            req.file.mimetype = 'image/webp';

            next();
        } catch (error) {
            console.error(`[optimizeImage] Error procesando ${prefix}:`, error);
            next(error);
        }
    };
};

module.exports = optimizeImage;
