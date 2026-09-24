import fs from 'fs';
import path from 'path';

/**
 * Images and fonts used on printed flyers. Accreditation logos are optional:
 * drop high-resolution files at public/flyer/aip.png and public/flyer/prs.png
 * and they appear on every flyer automatically.
 */

export const FONT_DIR = path.join(process.cwd(), 'assets', 'fonts');

const PUBLIC_DIR = path.join(process.cwd(), 'public');

export const FLYER_IMAGE_FILES = {
  logo: 'logo.png',
  aip: 'flyer/aip.png',
  prs: 'flyer/prs.png',
} as const;

export type FlyerImageKey = keyof typeof FLYER_IMAGE_FILES;

export interface FlyerImage {
  /** Public URL, for the HTML flyer */
  src: string;
  /** File contents, for the PDF */
  data: Buffer;
  width: number;
  height: number;
}

export type FlyerImages = Partial<Record<FlyerImageKey, FlyerImage>>;

/** Pixel size from a PNG header (IHDR chunk) */
function pngSize(data: Buffer): { width: number; height: number } {
  return { width: data.readUInt32BE(16), height: data.readUInt32BE(20) };
}

let cache: FlyerImages | null = null;

export function getFlyerImages(): FlyerImages {
  if (cache && process.env.NODE_ENV === 'production') return cache;

  const images: FlyerImages = {};
  for (const [key, file] of Object.entries(FLYER_IMAGE_FILES) as [FlyerImageKey, string][]) {
    const fullPath = path.join(PUBLIC_DIR, file);
    if (!fs.existsSync(fullPath)) continue;
    const data = fs.readFileSync(fullPath);
    images[key] = { src: `/${file}`, data, ...pngSize(data) };
  }
  cache = images;
  return images;
}

/** Image info safe to pass to client components (no file contents) */
export function getFlyerImageInfo(): Partial<Record<FlyerImageKey, Omit<FlyerImage, 'data'>>> {
  const info: Partial<Record<FlyerImageKey, Omit<FlyerImage, 'data'>>> = {};
  for (const [key, image] of Object.entries(getFlyerImages()) as [FlyerImageKey, FlyerImage][]) {
    info[key] = { src: image.src, width: image.width, height: image.height };
  }
  return info;
}
