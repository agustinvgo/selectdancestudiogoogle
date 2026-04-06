const multer = require('multer');
const path = require('path');
const fs = require('fs');
const sharp = require('sharp');

// Asegurar que existe el directorio
const uploadDir = path.join(__dirname, '../../uploads/perfiles');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Usar memoria para procesar con Sharp antes de guardar
const storage = multer.memoryStorage();

const fileFilter = (req, file, cb) => {
    if (file.mimetype.startsWith('image/')) {
        cb(null, true);
    } else {
        cb(new Error('Solo se permiten archivos de imagen'), false);
    }
};

const profileUpload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024 // 10MB de entrada (sharp lo comprimirá a ~80KB)
    }
});

/**
 * Middleware post-multer: comprime la imagen en memoria a WebP y la guarda en disco.
 * Se usa como: profileUpload.single('foto_perfil'), compressProfileImage
 */
async function compressProfileImage(req, res, next) {
    if (!req.file) return next();

    try {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        const filename = `perfil-${uniqueSuffix}.webp`;
        const outputPath = path.join(uploadDir, filename);

        await sharp(req.file.buffer)
            .resize(500, 500, {
                fit: 'cover',        // Recortar al cuadrado manteniendo proporción
                position: 'center'
            })
            .webp({ quality: 80 })   // Comprimir a WebP calidad 80
            .toFile(outputPath);

        // Sobreescribir req.file con la metadata del archivo comprimido
        req.file.filename = filename;
        req.file.path = outputPath;
        req.file.mimetype = 'image/webp';

        next();
    } catch (error) {
        console.error('[profileUpload] Error comprimiendo imagen:', error);
        next(error);
    }
}

module.exports = profileUpload;
module.exports.compress = compressProfileImage;
