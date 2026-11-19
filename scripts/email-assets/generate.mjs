/**
 * Generates the PNG images used by the backend's transactional emails and
 * writes them to public/email/, so they're served at <APP_URL>/email/*.png.
 *
 *   node scripts/email-assets/generate.mjs
 *
 * Scenes are drawn in scenes.tsx with the app's own brand components. Email
 * clients don't support SVG or oklch(), so colors are converted to sRGB and
 * everything is rasterized at 2x for sharp rendering on retina screens.
 * Uses jiti (TSX loader) and sharp, both already installed via Tailwind/Next.
 */
import { createJiti } from 'jiti';
import sharp from 'sharp';
import { mkdir } from 'node:fs/promises';
import { fileURLToPath } from 'node:url';
import path from 'node:path';

const root = path.resolve(path.dirname(fileURLToPath(import.meta.url)), '../..');
const outDir = path.join(root, 'public/email');
const SCALE = 2;

/** Light-theme values of the logo hues (see globals.css). */
const CSS_VARS = {
    '--tribe-coral': 'oklch(0.72 0.16 15)',
    '--tribe-violet': 'oklch(0.68 0.18 300)',
    '--tribe-teal': 'oklch(0.80 0.12 185)',
    '--tribe-sun': 'oklch(0.87 0.15 92)',
};

function oklchToRgb(l, c, h) {
    const hr = (h * Math.PI) / 180;
    const a = c * Math.cos(hr);
    const b = c * Math.sin(hr);
    const l_ = (l + 0.3963377774 * a + 0.2158037573 * b) ** 3;
    const m_ = (l - 0.1055613458 * a - 0.0638541728 * b) ** 3;
    const s_ = (l - 0.0894841775 * a - 1.291485548 * b) ** 3;
    const lin = [
        4.0767416621 * l_ - 3.3077115913 * m_ + 0.2309699292 * s_,
        -1.2684380046 * l_ + 2.6097574011 * m_ - 0.3413193965 * s_,
        -0.0041960863 * l_ - 0.7034186147 * m_ + 1.707614701 * s_,
    ];
    return lin.map((v) => {
        const srgb = v <= 0.0031308 ? 12.92 * v : 1.055 * v ** (1 / 2.4) - 0.055;
        return Math.round(Math.min(1, Math.max(0, srgb)) * 255);
    });
}

function toEmailSafeSvg(svg) {
    let out = svg;
    for (const [name, value] of Object.entries(CSS_VARS)) {
        out = out.replaceAll(`var(${name})`, value);
    }
    return out.replace(/oklch\(\s*([\d.]+)\s+([\d.]+)\s+([\d.]+)\s*(?:\/\s*([\d.]+))?\s*\)/g, (_, l, c, h, alpha) => {
        const [r, g, b] = oklchToRgb(Number(l), Number(c), Number(h));
        return alpha === undefined ? `rgb(${r},${g},${b})` : `rgba(${r},${g},${b},${alpha})`;
    });
}

const jiti = createJiti(import.meta.url, {
    alias: { '@/src': path.join(root, 'src') },
    jsx: { runtime: 'automatic' },
});
const { scenes } = await jiti.import('./scenes.tsx');

await mkdir(outDir, { recursive: true });

for (const [name, render] of Object.entries(scenes)) {
    const svg = toEmailSafeSvg(render());
    const file = path.join(outDir, `${name}.png`);
    await sharp(Buffer.from(svg), { density: 72 * SCALE }).png({ compressionLevel: 9, palette: true, quality: 90 }).toFile(file);
    console.log('wrote', path.relative(root, file));
}

const logo = path.join(outDir, 'logo.png');
await sharp(path.join(root, 'public/images/logo_chat.png')).resize(96, 96).png({ compressionLevel: 9 }).toFile(logo);
console.log('wrote', path.relative(root, logo));
