import { mkdir } from 'node:fs/promises';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import sharp from 'sharp';

const projectRoot = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '..');
const publicDir = path.join(projectRoot, 'public');
const outputDir = path.join(publicDir, 'optimized', 'home');

const cardWidths = [480, 768, 1280];

const sources = [
    {
        name: 'hero',
        input: path.join(projectRoot, 'src', 'assets', 'hero_bg.jpg'),
        widths: [640, 1024],
    },
    {
        name: 'baby',
        input: path.join(publicDir, 'baby-dance-palermo-select-dance-studio.webp'),
        widths: cardWidths,
    },
    {
        name: 'mini',
        input: path.join(publicDir, 'mini-danza-palermo-select-dance-studio.webp'),
        widths: cardWidths,
    },
    {
        name: 'junior',
        input: path.join(publicDir, 'clase-junior-danza-palermo.webp'),
        widths: cardWidths,
    },
    {
        name: 'teen',
        input: path.join(publicDir, 'clase-teen-danza-palermo.webp'),
        widths: cardWidths,
    },
    {
        name: 'senior',
        input: path.join(publicDir, 'clase-senior-danza-palermo.webp'),
        widths: cardWidths,
    },
    {
        name: 'recreative',
        input: path.join(publicDir, 'danza-recreativa-palermo-buenos-aires.webp'),
        widths: cardWidths,
    },
    {
        name: 'competition',
        input: path.join(publicDir, 'competicion-danza-select-dance-studio-palermo.webp'),
        widths: cardWidths,
    },
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
