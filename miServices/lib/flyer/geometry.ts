/**
 * Shared print geometry and palette for A5 price flyers.
 *
 * All layout numbers are in PDF points relative to the TRIM box (the finished
 * 148×210mm sheet). The PDF renderer offsets them by the bleed; the HTML
 * renderer converts them to container-width units so both look identical.
 */

export const MM = 72 / 25.4;

/** Finished (trimmed) A5 size */
export const TRIM_W = 148 * MM; // 419.53pt
export const TRIM_H = 210 * MM; // 595.28pt

/** 3mm bleed on every side */
export const BLEED = 3 * MM; // 8.504pt
export const PAGE_W = TRIM_W + BLEED * 2; // 436.54pt (154mm)
export const PAGE_H = TRIM_H + BLEED * 2; // 612.28pt (216mm)

/** Printer's safe zone: 3mm inside the cut line. Our margins sit well inside it. */
export const SAFE = 3 * MM;
export const MARGIN = 22; // ~7.8mm from the cut line

/** Where the navy body gives way to the white booking footer */
export const FOOTER_TOP = 520;

/**
 * Colours, converted from the CMYK values in the original Illustrator leaflet:
 * navy C100 M90 Y10, wave C83 M43, header cyan C100, tick C47 M5 Y2, grey C60 M52 Y51 K21.
 */
export const COLORS = {
  navy: '#233e8b',
  wave: '#157ec3',
  cyan: '#00aeef',
  tick: '#8ccbec',
  grey: '#6d6e70',
  divider: '#3b72b8',
  white: '#ffffff',
  paper: '#ffffff',
};

/**
 * Wave shapes in trim coordinates, extending past the trim into the bleed.
 * The front wave falls left→right; the back is its mirror image.
 */
const L = -BLEED - 1;
const R = TRIM_W + BLEED + 1;

/** Mirror a path's x coordinates (for the back page) */
function mirror(d: string): string {
  return d.replace(/(-?[\d.]+) (-?[\d.]+)/g, (_, x, y) => `${+(TRIM_W - Number(x)).toFixed(2)} ${y}`);
}

const FRONT_BAND = `M ${L} 97 C 130 84, 262 130, ${R} 166 L ${R} 190 C 250 152, 130 98, ${L} 105 Z`;
const FRONT_BODY = `M ${L} 105 C 130 98, 250 152, ${R} 190 L ${R} ${FOOTER_TOP} L ${L} ${FOOTER_TOP} Z`;

export const FRONT_WAVE = { band: FRONT_BAND, body: FRONT_BODY };
export const BACK_WAVE = { band: mirror(FRONT_BAND), body: mirror(FRONT_BODY) };

/** Tick used in the selling-points list (24×24 box) */
export const TICK_PATH = 'M3 13.5 L9 19.5 L21.5 5.5 L19 3.5 L9 15 L5.5 11 Z';
