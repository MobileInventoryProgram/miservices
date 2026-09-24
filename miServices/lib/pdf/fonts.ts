import path from 'path';
import { Font } from '@react-pdf/renderer';
import { FONT_DIR } from '@/lib/flyer/assets';
import { FONTS } from '@/lib/flyer/layout';

/**
 * Brand fonts for server-rendered PDFs (flyers, quotes): Roboto Slab headings,
 * Roboto for prices, PT Sans body text. Embedded as subsets by react-pdf.
 */
let fontsRegistered = false;
export function registerFonts() {
  if (fontsRegistered) return;
  const font = (file: string) => path.join(FONT_DIR, file);
  Font.register({
    family: FONTS.slab,
    fonts: [
      { src: font('RobotoSlab-300.ttf'), fontWeight: 300 },
      { src: font('RobotoSlab-400.ttf'), fontWeight: 400 },
      { src: font('RobotoSlab-700.ttf'), fontWeight: 700 },
    ],
  });
  Font.register({
    family: FONTS.sans,
    fonts: [
      { src: font('Roboto-300.ttf'), fontWeight: 300 },
      { src: font('Roboto-500.ttf'), fontWeight: 500 },
      { src: font('Roboto-700.ttf'), fontWeight: 700 },
      { src: font('Roboto-900.ttf'), fontWeight: 900 },
    ],
  });
  Font.register({
    family: FONTS.body,
    fonts: [
      { src: font('PTSans-400.ttf'), fontWeight: 400 },
      { src: font('PTSans-700.ttf'), fontWeight: 700 },
      { src: font('PTSans-400Italic.ttf'), fontWeight: 400, fontStyle: 'italic' },
    ],
  });
  // Never hyphenate words on a flyer
  Font.registerHyphenationCallback((word) => [word]);
  fontsRegistered = true;
}

