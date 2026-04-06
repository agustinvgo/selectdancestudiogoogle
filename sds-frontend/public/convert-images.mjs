// Script de conversión de imágenes JPG → WebP con nombres SEO-friendly
// Uso: node convert-images.js (desde sds-frontend/public/)

import sharp from 'sharp';
import { readdirSync, statSync, existsSync } from 'fs';
import { join, extname, basename } from 'path';
import { fileURLToPath } from 'url';
import { dirname } from 'path';

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const sourceDir = __dirname;

// Mapeo: nombre original → nombre SEO-friendly
const renameMap = {
    'Baby.jpg': 'baby-dance-palermo-select-dance-studio',
    'Mini.jpg': 'mini-danza-palermo-select-dance-studio',
    'Junior.jpg': 'clase-junior-danza-palermo',
    'Teen.jpg': 'clase-teen-danza-palermo',
    'Senior.jpg': 'clase-senior-danza-palermo',
    'Competition.jpg': 'competicion-danza-select-dance-studio-palermo',
    'Recreative.jpg': 'danza-recreativa-palermo-buenos-aires',
    'logo.jpg': 'logo-select-dance-studio',
};

const QUALITY = 80;

console.log('\n🎯 Convirtiendo imágenes a WebP...\n');

let totalOriginalSize = 0;
let totalWebpSize = 0;
let count = 0;

const files = readdirSync(sourceDir).filter(f => {
    const ext = extname(f).toLowerCase();
    return ['.jpg', '.jpeg', '.png'].includes(ext);
});

if (files.length === 0) {
    console.log('⚠️  No se encontraron imágenes JPG/PNG en este directorio.');
    process.exit(0);
}

// Procesar en paralelo
const tasks = files.map(async (file) => {
    const inputPath = join(sourceDir, file);
    const baseName = renameMap[file] || basename(file, extname(file)).toLowerCase().replace(/\s+/g, '-');
    const outputPath = join(sourceDir, `${baseName}.webp`);

    const originalSize = statSync(inputPath).size;
    totalOriginalSize += originalSize;

    await sharp(inputPath)
        .webp({ quality: QUALITY })
        .toFile(outputPath);

    const webpSize = statSync(outputPath).size;
    totalWebpSize += webpSize;

    const savedPct = (((originalSize - webpSize) / originalSize) * 100).toFixed(1);
    const originalKB = (originalSize / 1024).toFixed(0);
    const webpKB = (webpSize / 1024).toFixed(0);

    console.log(`  ✅  ${file.padEnd(20)} → ${baseName}.webp`);
    console.log(`       ${originalKB} KB → ${webpKB} KB  (ahorro: ${savedPct}%)\n`);
    count++;
});

await Promise.all(tasks);

const totalSavedMB = ((totalOriginalSize - totalWebpSize) / (1024 * 1024)).toFixed(2);
const totalOrigMB = (totalOriginalSize / (1024 * 1024)).toFixed(2);
const totalWebpMB = (totalWebpSize / (1024 * 1024)).toFixed(2);

console.log('─'.repeat(50));
console.log(`📊 Resultado:`);
console.log(`   Archivos convertidos : ${count}`);
console.log(`   Peso original total  : ${totalOrigMB} MB`);
console.log(`   Peso WebP total      : ${totalWebpMB} MB`);
console.log(`   Ahorro total         : ${totalSavedMB} MB`);
console.log('');
console.log('📋 Próximo paso: actualizar referencias en el código (.jpg → .webp)');
console.log('─'.repeat(50) + '\n');
