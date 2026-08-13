const multer = require('multer');
const path = require('path');
const storage = multer.memoryStorage();

const ALLOWED_EXTENSIONS = new Set([
    '.jpg', '.jpeg', '.png', '.webp', '.gif', '.heic', '.heif', '.avif'
]);
const ALLOWED_MIMETYPES = new Set([
    'image/jpeg',
    'image/jpg',
    'image/png',
    'image/webp',
    'image/gif',
    'image/heic',
    'image/heif',
    'image/avif'
]);

const fileFilter = (req, file, cb) => {
    const extension = path.extname(file.originalname).toLowerCase();
    const hasValidExtension = ALLOWED_EXTENSIONS.has(extension);
    const hasValidMime = ALLOWED_MIMETYPES.has(file.mimetype)
        || !file.mimetype
        || file.mimetype === 'application/octet-stream';

    if (hasValidExtension && hasValidMime) {
        cb(null, true);
    } else {
        cb(new Error('Formato no compatible. Usa JPG, PNG, WebP, GIF, HEIC/HEIF o AVIF.'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 10 * 1024 * 1024
    }
});

module.exports = upload;
