import fs from 'fs';
import path from 'path';
import { FONT_DIR } from '@/lib/flyer/assets';

/**
 * Brand kit for generated images (brand assets and social posts), rendered
 * with next/og. Same fonts and logo as the printed flyers.
 */

export const BRAND = {
  /** Website brand blue (Tailwind brand-dark-blue) — used for digital artwork */
  blue: '#3f59a9',
  blueDeep: '#2f4a98',
  navy: '#1e336f',
  wave: '#157ec3',
  cyan: '#00aeef',
  ink: '#2b2b2b',
  grey: '#6b7280',
  paleBlue: '#eef3fb',
  white: '#ffffff',
  website: 'www.mobileinventoryservices.co.uk',
};

export type BrandTheme = 'light' | 'navy';

export const THEMES: Record<BrandTheme, { background: string; text: string; muted: string; accent: string; blob: string; blobBack: string; chip: string; chipText: string }> = {
  light: {
    background: BRAND.white,
    text: BRAND.ink,
    muted: BRAND.grey,
    accent: BRAND.blue,
    blob: BRAND.blue,
    blobBack: BRAND.blueDeep,
    chip: '#e3ecfa',
    chipText: BRAND.navy,
  },
  navy: {
    background: BRAND.navy,
    text: BRAND.white,
    muted: '#c7d3f2',
    accent: BRAND.cyan,
    blob: BRAND.blue,
    blobBack: '#2a4288',
    chip: 'rgba(255,255,255,0.12)',
    chipText: BRAND.white,
  },
};

type Weight = 300 | 400 | 500 | 700 | 900;
interface ImageFont {
  name: string;
  data: ArrayBuffer;
  weight: Weight;
  style: 'normal' | 'italic';
}

let fontCache: ImageFont[] | null = null;

/** Fonts for next/og ImageResponse (TTF, read once) */
export function brandFonts(): ImageFont[] {
  if (fontCache) return fontCache;
  const load = (file: string) => {
    const buf = fs.readFileSync(path.join(FONT_DIR, file));
    return buf.buffer.slice(buf.byteOffset, buf.byteOffset + buf.byteLength) as ArrayBuffer;
  };
  fontCache = [
    { name: 'Roboto Slab', data: load('RobotoSlab-300.ttf'), weight: 300, style: 'normal' },
    { name: 'Roboto Slab', data: load('RobotoSlab-400.ttf'), weight: 400, style: 'normal' },
    { name: 'Roboto Slab', data: load('RobotoSlab-700.ttf'), weight: 700, style: 'normal' },
    { name: 'Roboto', data: load('Roboto-500.ttf'), weight: 500, style: 'normal' },
    { name: 'Roboto', data: load('Roboto-700.ttf'), weight: 700, style: 'normal' },
    { name: 'Roboto', data: load('Roboto-900.ttf'), weight: 900, style: 'normal' },
    { name: 'PT Sans', data: load('PTSans-400.ttf'), weight: 400, style: 'normal' },
    { name: 'PT Sans', data: load('PTSans-700.ttf'), weight: 700, style: 'normal' },
    { name: 'PT Sans', data: load('PTSans-400Italic.ttf'), weight: 400, style: 'italic' },
  ];
  return fontCache;
}

let logoCache: { src: string; width: number; height: number } | null = null;

/** miServices logo as a data URI with its pixel size */
export function brandLogo() {
  if (logoCache) return logoCache;
  const data = fs.readFileSync(path.join(process.cwd(), 'public', 'logo.png'));
  logoCache = {
    src: `data:image/png;base64,${data.toString('base64')}`,
    width: data.readUInt32BE(16),
    height: data.readUInt32BE(20),
  };
  return logoCache;
}

/** Filename-safe slug */
export function slugify(text: string): string {
  return text.toLowerCase().replace(/&/g, 'and').replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '');
}
