const sharp = require('sharp');
const path = require('path');
const fs = require('fs');

/**
 * Middleware generico para optimizar imagenes a WebP
 * @param {string} targetDir - Directorio relativo a src/middlewares (../../uploads/...)
 * @param {string} prefix - Prefijo para el nombre de archivo (ej. 'equipo', 'curso')
 * @param {number} width - Ancho maximo (default 1000)
 * @param {number} height - Alto maximo (opcional)
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

            try {
                let transform = sharp(req.file.buffer);

                if (width || height) {
                    transform = transform.resize(width, height, {
                        fit: height ? 'cover' : 'inside',
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
            } catch (sharpError) {
                console.warn(`[optimizeImage] Sharp failed for ${prefix}, fallback to original:`, sharpError.message);
                const ext = path.extname(req.file.originalname) || '.jpg';
                const rawFilename = `${prefix}-${uniqueSuffix}${ext}`;
                const rawOutputPath = path.join(uploadPath, rawFilename);
                fs.writeFileSync(rawOutputPath, req.file.buffer);
                req.file.filename = rawFilename;
                req.file.path = rawOutputPath;
            }

            next();
        } catch (error) {
            console.error(`[optimizeImage] Error procesando ${prefix}:`, error);
            next(error);
        }
    };
};

module.exports = optimizeImage;
