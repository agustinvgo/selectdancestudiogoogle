import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(projectRoot, 'public');
const outputDir = path.join(publicDir, 'optimized', 'competition');

const galleryWidths = [640, 960, 1280, 1920];
const heroWidths = [768, 1280, 1920, 2560];

const sources = [
    {
        name: 'hero',
        input: path.join(publicDir, 'competicion-danza-select-dance-studio-palermo.webp'),
        widths: heroWidths,
    },
    ...[1, 2, 3, 4, 5, 6, 7, 9].map((id) => ({
        name: `hof-${id}`,
        input: path.join(publicDir, 'hof', `${id}.jpg`),
        widths: galleryWidths,
    })),
];

await mkdir(outputDir, { recursive: true });

for (const source of sources) {
    for (const width of source.widths) {
        const pipeline = sharp(source.input)
            .rotate()
            .resize({ width, withoutEnlargement: true });

        await Promise.all([
            pipeline
                .clone()
                .avif({ quality: 52, effort: 4, chromaSubsampling: '4:2:0' })
                .toFile(path.join(outputDir, `${source.name}-${width}.avif`)),
            pipeline
                .clone()
                .webp({ quality: 76, effort: 5, smartSubsample: true })
                .toFile(path.join(outputDir, `${source.name}-${width}.webp`)),
        ]);
    }

    console.log(`Optimizada: ${source.name}`);
}

console.log(`Variantes generadas en ${outputDir}`);
