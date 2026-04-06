const multer = require('multer');
const path = require('path');
const fs = require('fs');

// Asegurar que existe el directorio
const uploadDir = path.join(__dirname, '../../uploads/comprobantes');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
        cb(null, uploadDir);
    },
    filename: function (req, file, cb) {
        // Intentar obtener fecha y categoría del body (si Multer los procesó antes)
        // Nota: Esto depende del orden de los campos en el FormData del frontend
        const fecha = req.body.fecha ? req.body.fecha : new Date().toISOString().split('T')[0];
        const categoria = req.body.categoria ? req.body.categoria.replace(/[^a-zA-Z0-9]/g, '') : 'Gasto';

        // Timestamp + random para unicidad
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);

        // Limpiar nombre original
        const originalNameSanitized = file.originalname.replace(/[^a-zA-Z0-9.-]/g, '_');

        // Construir nombre: gasto-CATEGORIA-FECHA-ID.ext
        cb(null, `gasto-${categoria}-${fecha}-${uniqueSuffix}${path.extname(file.originalname)}`);
    }
});

const fileFilter = (req, file, cb) => {
    // Aceptar imagenes y PDFs
    if (file.mimetype.startsWith('image/') || file.mimetype === 'application/pdf') {
        cb(null, true);
    } else {
        cb(new Error('Formato de archivo no soportado (Solo imágenes y PDF)'), false);
    }
};

const upload = multer({
    storage: storage,
    fileFilter: fileFilter,
    limits: {
        fileSize: 5 * 1024 * 1024 // 5MB limit
    }
});

module.exports = upload;
