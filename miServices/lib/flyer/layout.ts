import { FOOTER_TOP, MARGIN, TRIM_H, TRIM_W } from '@/lib/flyer/geometry';
import type { FlyerData } from '@/lib/flyer/data';

/**
 * Positions and type sizes (pt, trim coordinates) shared by the PDF and HTML
 * flyers. Change a number here and both renderers follow.
 */

export const CONTENT_W = TRIM_W - MARGIN * 2;

export const FONTS = {
  slab: 'RobotoSlab',
  sans: 'Roboto',
  body: 'PTSans',
};

export const HEADER = {
  logo: { x: MARGIN, y: 14, width: 72 },
  offer: { x: 170, y: 20, width: TRIM_W - MARGIN - 170 },
  eyebrowSize: 15,
  headlineSize: 28,
  smallPrintSize: 8,
};

export const FRONT = {
  hero: { x: MARGIN, y: 172, width: 176 },
  heroLabelSize: 30,
  heroLabelSizeLong: 20,
  heroFromSize: 16,
  heroPriceSize: 56,
  intro: { x: 206, y: 182, width: TRIM_W - MARGIN - 206 },
  introSize: 10,
  secondary: { y: 280, height: 64 },
  secondaryLabelSize: 16,
  secondaryLabelSizeLong: 12,
  secondaryFromSize: 10,
  secondaryPriceSize: 27,
  vatY: 350,
  vatSize: 7,
  ticks: { x: MARGIN + 4, y: 368, rowHeight: 20.5, tickSize: 13 },
  tickHighlightSize: 14,
  tickDetailSize: 9.5,
};

export const BACK = {
  aip: { x: MARGIN, y: 26, width: 104 },
  logo: { x: TRIM_W - MARGIN - 72, y: 10, width: 72 },
  body: { y: 196, bottom: FOOTER_TOP - 10 },
};

export const SINGLE = {
  body: { y: 168, bottom: FOOTER_TOP - 8 },
  labelSize: 12,
  labelSizeLong: 9.5,
  fromSize: 8,
  /** Price size shrinks when four "From" prices share the row */
  priceSize: (count: number) => (count >= 4 ? 18 : 21),
};

export const FOOTER = {
  text: { x: MARGIN, y: FOOTER_TOP + 14, width: 250 },
  textSize: 11.5,
  lineHeight: 1.5,
  logos: { right: MARGIN, y: FOOTER_TOP + 12, width: 78 },
  height: TRIM_H - FOOTER_TOP,
};

/**
 * Table sizing adapts to how much is on it, so a busy list (4 services with
 * furnished prices) still fits one A5 side.
 */
export function tableSizes(data: FlyerData, compact: boolean) {
  const columns = data.table?.columns.length || 0;
  const busy = columns >= 4 || !!data.table?.dualPrices;
  const rows = data.table?.rows.length || 0;

  return {
    headerSize: busy ? 8.5 : 10,
    cellSize: compact ? (busy ? 9 : 10) : busy ? 10 : 11.5,
    subSize: compact ? 7 : 8,
    sizeLabelSize: compact ? 9 : busy ? 9.5 : 11,
    maxRoomsSize: busy ? 6.5 : 7.5,
    headerHeight: compact ? 26 : 32,
    rowHeight: compact ? (rows > 5 ? 20 : 22) : rows > 5 ? 26 : 30,
    firstColumnShare: busy ? 0.3 : 0.32,
    noteSize: compact ? 8.5 : 11,
    smallSize: compact ? 6.5 : 7.5,
  };
}
