/* eslint-disable @next/next/no-img-element */
import type { CSSProperties, ReactNode } from 'react';
import { PT_Sans, Roboto, Roboto_Slab } from 'next/font/google';
import type { FlyerData, FlyerLayout, FlyerPrice, FlyerTable } from '@/lib/flyer/data';
import { BACK_WAVE, COLORS, FRONT_WAVE, MARGIN, TICK_PATH, TRIM_H, TRIM_W } from '@/lib/flyer/geometry';
import { BACK, CONTENT_W, FOOTER, FRONT, HEADER, SINGLE, tableSizes } from '@/lib/flyer/layout';

/**
 * On-screen A5 flyer (trimmed, no bleed). Mirrors lib/flyer/pdf.tsx — both are
 * driven by lib/flyer/layout.ts, with points converted to container-width units
 * so the sheet scales to any screen.
 */

const slabFont = Roboto_Slab({ subsets: ['latin'], weight: ['300', '400', '700'] });
const sansFont = Roboto({ subsets: ['latin'], weight: ['300', '500', '700', '900'] });
const bodyFont = PT_Sans({ subsets: ['latin'], weight: ['400', '700'], style: ['normal', 'italic'] });

interface ImageInfo {
  src: string;
  width: number;
  height: number;
}
export type FlyerImageInfo = Partial<Record<'logo' | 'aip' | 'prs', ImageInfo>>;

/** Points → width of the sheet */
const u = (pt: number) => `${(pt / TRIM_W) * 100}cqw`;

function at(x: number, y: number, width?: number): CSSProperties {
  return { position: 'absolute', left: u(x), top: u(y), ...(width != null ? { width: u(width) } : {}) };
}

const slab = (size: number, color = COLORS.white): CSSProperties => ({
  fontFamily: slabFont.style.fontFamily,
  fontWeight: 300,
  fontSize: u(size),
  color,
  lineHeight: 1.15,
});
const price = (size: number): CSSProperties => ({
  fontFamily: sansFont.style.fontFamily,
  fontWeight: 900,
  fontSize: u(size),
  color: COLORS.white,
  lineHeight: 1,
});
const body = (size: number, color = COLORS.white): CSSProperties => ({
  fontFamily: bodyFont.style.fontFamily,
  fontSize: u(size),
  color,
  lineHeight: 1.2,
});

const divider = `${u(1)} solid ${COLORS.divider}`;
const whiteLine = `${u(0.75)} solid ${COLORS.white}`;

// ─── Shared pieces ───────────────────────────────────────────────

function Sheet({ label, children }: { label: string; children: ReactNode }) {
  return (
    <div className="w-full" style={{ containerType: 'inline-size' }}>
      <section
        aria-label={label}
        className="relative w-full overflow-hidden bg-white shadow-lg"
        style={{ aspectRatio: `${TRIM_W} / ${TRIM_H}` }}
      >
        {children}
      </section>
    </div>
  );
}

function Background({ wave }: { wave: { band: string; body: string } }) {
  return (
    <svg className="absolute inset-0 h-full w-full" viewBox={`0 0 ${TRIM_W} ${TRIM_H}`} aria-hidden="true">
      <path d={wave.band} fill={COLORS.wave} />
      <path d={wave.body} fill={COLORS.navy} />
    </svg>
  );
}

function Img({ image, x, y, width, alt }: { image?: ImageInfo; x: number; y: number; width: number; alt: string }) {
  if (!image) return null;
  return <img src={image.src} alt={alt} style={{ ...at(x, y, width), height: 'auto' }} />;
}

function Offer({ data }: { data: FlyerData }) {
  const { settings } = data;
  if (!settings.showOffer) return null;
  return (
    <div style={{ ...at(HEADER.offer.x, HEADER.offer.y, HEADER.offer.width), textAlign: 'right' }}>
      <p style={{ fontFamily: sansFont.style.fontFamily, fontWeight: 300, fontSize: u(HEADER.eyebrowSize), color: COLORS.navy, lineHeight: 1.2 }}>
        {settings.offerEyebrow}
      </p>
      <p style={{ ...slab(HEADER.headlineSize, COLORS.grey), lineHeight: 1.08, marginTop: u(1) }}>{settings.offerHeadline}</p>
      <p style={{ ...body(HEADER.smallPrintSize, COLORS.grey), fontStyle: 'italic', marginTop: u(4) }}>
        {settings.offerSmallPrint}
      </p>
    </div>
  );
}

function Footer({ data, images }: { data: FlyerData; images: FlyerImageInfo }) {
  const { settings } = data;
  const text = { ...body(FOOTER.textSize, COLORS.grey), lineHeight: FOOTER.lineHeight };
  const logos = [
    { image: images.aip, alt: 'Association of Inventory Professionals' },
    { image: images.prs, alt: 'Property Redress Scheme' },
  ].filter((logo) => logo.image);

  return (
    <>
      <div style={at(FOOTER.text.x, FOOTER.text.y, FOOTER.text.width)}>
        <p style={text}>
          To make a booking please call <strong>{settings.bookingPhone}</strong>
        </p>
        <p style={text}>
          or email <strong>{settings.bookingEmail}</strong>
        </p>
        <p style={{ ...text, fontWeight: 700 }}>{settings.bookingUrl}</p>
      </div>
      {logos.length > 0 && (
        <div
          style={{
            ...at(TRIM_W - FOOTER.logos.right - FOOTER.logos.width, FOOTER.logos.y, FOOTER.logos.width),
            display: 'flex',
            flexDirection: 'column',
            gap: u(4),
          }}
        >
          {logos.map(({ image, alt }) => (
            <img key={alt} src={image!.src} alt={alt} style={{ width: '100%', height: 'auto' }} />
          ))}
        </div>
      )}
    </>
  );
}

function FromPrice({ item, labelSize, fromSize, priceSize }: { item: FlyerPrice; labelSize: number; fromSize: number; priceSize: number }) {
  return (
    <div>
      <p style={{ ...slab(labelSize), lineHeight: 1.05 }}>{item.label}</p>
      <p style={{ display: 'flex', alignItems: 'baseline', gap: u(4), marginTop: u(2) }}>
        <span style={slab(fromSize)}>From</span>
        <span style={price(priceSize)}>{item.price}</span>
      </p>
    </div>
  );
}

function PriceTable({ data, table, compact }: { data: FlyerData; table: FlyerTable; compact: boolean }) {
  const s = tableSizes(data, compact);
  const firstWidth = CONTENT_W * s.firstColumnShare;
  const colWidth = (CONTENT_W - firstWidth) / table.columns.length;

  return (
    <div style={{ width: u(CONTENT_W) }}>
      <div style={{ display: 'flex', background: COLORS.cyan, minHeight: u(s.headerHeight) }}>
        {['Property Size', ...table.columns].map((column, i) => (
          <div
            key={column}
            style={{
              width: u(i === 0 ? firstWidth : colWidth),
              display: 'flex',
              alignItems: 'center',
              justifyContent: i === 0 ? 'flex-start' : 'center',
              padding: `${u(3)} ${u(5)}`,
              borderLeft: i > 0 ? whiteLine : undefined,
            }}
          >
            <span style={{ ...body(s.headerSize), fontWeight: 700, textAlign: i === 0 ? 'left' : 'center', lineHeight: 1.1 }}>
              {column}
            </span>
          </div>
        ))}
      </div>
      <div style={{ height: u(compact ? 3 : 6) }} />
      {table.rows.map((row) => (
        <div key={row.size} style={{ display: 'flex', height: u(s.rowHeight), borderBottom: whiteLine }}>
          <div style={{ width: u(firstWidth), display: 'flex', alignItems: 'center', padding: `0 ${u(5)}` }}>
            <span style={body(s.sizeLabelSize)}>
              <strong>{row.size}</strong> Bed
              {row.maxRooms && <em style={{ fontSize: u(s.maxRoomsSize) }}> {row.maxRooms}</em>}
            </span>
          </div>
          {row.cells.map((cell, i) => (
            <div
              key={i}
              style={{ width: u(colWidth), display: 'flex', alignItems: 'center', justifyContent: 'center', borderLeft: whiteLine }}
            >
              <span style={body(s.cellSize)}>
                {cell.from && <em>From </em>}
                {cell.main}
                {cell.sub && <span style={{ fontSize: u(s.subSize), color: COLORS.tick }}> / {cell.sub}</span>}
              </span>
            </div>
          ))}
        </div>
      ))}
      <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: u(3) }}>
        <em style={body(s.smallSize, COLORS.tick)}>{table.dualPrices ? 'Unfurnished / furnished' : ''}</em>
        <em style={body(s.smallSize)}>{data.settings.vatNote}</em>
      </div>
    </div>
  );
}

function RateList({ rates, compact }: { rates: FlyerPrice[]; compact: boolean }) {
  return (
    <div style={{ width: u(CONTENT_W) }}>
      {rates.map((rate) => (
        <div
          key={rate.label}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            padding: `${u(compact ? 4 : 7)} 0`,
            borderBottom: `${u(0.75)} solid ${COLORS.divider}`,
          }}
        >
          <span style={{ ...slab(compact ? 12 : 15), flex: 1, paddingRight: u(10) }}>{rate.label}</span>
          <span style={price(compact ? 15 : 20)}>{rate.price}</span>
        </div>
      ))}
    </div>
  );
}

function PriceDetails({ data, compact }: { data: FlyerData; compact: boolean }) {
  const s = tableSizes(data, compact);
  const notes = [data.furnishedNote, data.flyerNote].filter(Boolean) as string[];

  return (
    <>
      {notes.map((note) => (
        <p key={note} style={{ ...body(s.noteSize), textAlign: 'justify', lineHeight: 1.25 }}>
          {note}
        </p>
      ))}
      {data.table && <PriceTable data={data} table={data.table} compact={compact} />}
      {data.extraRates.length > 0 && <RateList rates={data.extraRates} compact={compact && !!data.table} />}
      {!data.table && <em style={{ ...body(s.smallSize), textAlign: 'right' }}>{data.settings.vatNote}</em>}
      {data.extraRoomNote && <p style={body(s.noteSize)}>{data.extraRoomNote}</p>}
      <p style={body(s.smallSize)}>{data.settings.websiteNote}</p>
    </>
  );
}

function BodyColumn({ top, bottom, children }: { top: number; bottom: number; children: ReactNode }) {
  return (
    <div
      style={{
        ...at(MARGIN, top, CONTENT_W),
        height: u(bottom - top),
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'space-evenly',
      }}
    >
      {children}
    </div>
  );
}

function introParts(text: string) {
  return text.split(/(miServices)/g).map((part, i) => (part === 'miServices' ? <strong key={i}>{part}</strong> : part));
}

// ─── Sheets ──────────────────────────────────────────────────────

function FrontSheet({ data, images }: { data: FlyerData; images: FlyerImageInfo }) {
  const { hero, secondary, settings } = data;
  const columnWidth = CONTENT_W / Math.max(secondary.length, 1);

  return (
    <Sheet label="Flyer front">
      <Background wave={FRONT_WAVE} />
      <Img image={images.logo} alt="miServices" {...HEADER.logo} />
      <Offer data={data} />

      {hero && (
        <div style={at(FRONT.hero.x, FRONT.hero.y, FRONT.hero.width)}>
          <FromPrice
            item={hero}
            labelSize={hero.label.length > 14 ? FRONT.heroLabelSizeLong : FRONT.heroLabelSize}
            fromSize={FRONT.heroFromSize}
            priceSize={FRONT.heroPriceSize}
          />
        </div>
      )}
      <p style={{ ...at(FRONT.intro.x, FRONT.intro.y, FRONT.intro.width), ...body(FRONT.introSize), lineHeight: 1.35 }}>
        {introParts(settings.introText)}
      </p>

      {secondary.length > 0 && (
        <div style={{ ...at(MARGIN, FRONT.secondary.y, CONTENT_W), height: u(FRONT.secondary.height), display: 'flex', borderBottom: divider }}>
          {secondary.map((item, i) => (
            <div
              key={item.label}
              style={{
                width: u(columnWidth),
                paddingLeft: i === 0 ? 0 : u(8),
                paddingBottom: u(6),
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'flex-end',
                borderLeft: i > 0 ? divider : undefined,
              }}
            >
              <FromPrice
                item={item}
                labelSize={item.label.length > 24 ? FRONT.secondaryLabelSizeLong : FRONT.secondaryLabelSize}
                fromSize={FRONT.secondaryFromSize}
                priceSize={FRONT.secondaryPriceSize}
              />
            </div>
          ))}
        </div>
      )}
      <em style={{ ...at(MARGIN, FRONT.vatY, CONTENT_W), ...body(FRONT.vatSize), textAlign: 'right' }}>{settings.vatNote}</em>

      <ul style={at(FRONT.ticks.x, FRONT.ticks.y, CONTENT_W - 4)}>
        {settings.sellingPoints.slice(0, 7).map((point, i) => (
          <li key={i} style={{ display: 'flex', alignItems: 'center', height: u(FRONT.ticks.rowHeight) }}>
            <svg viewBox="0 0 24 24" style={{ width: u(FRONT.ticks.tickSize), height: u(FRONT.ticks.tickSize), marginRight: u(8), flexShrink: 0 }} aria-hidden="true">
              <path d={TICK_PATH} fill={COLORS.tick} />
            </svg>
            <span style={body(FRONT.tickDetailSize)}>
              {point.prefix && <>{point.prefix} </>}
              <span style={slab(FRONT.tickHighlightSize)}>{point.highlight}</span>
              {point.detail && <> {point.detail}</>}
            </span>
          </li>
        ))}
      </ul>

      <Footer data={data} images={images} />
    </Sheet>
  );
}

function BackSheet({ data, images }: { data: FlyerData; images: FlyerImageInfo }) {
  return (
    <Sheet label="Flyer back">
      <Background wave={BACK_WAVE} />
      <Img image={images.aip} alt="Association of Inventory Professionals" {...BACK.aip} />
      <Img image={images.logo} alt="miServices" {...BACK.logo} />
      <BodyColumn top={BACK.body.y} bottom={BACK.body.bottom}>
        <PriceDetails data={data} compact={false} />
      </BodyColumn>
      <Footer data={data} images={images} />
    </Sheet>
  );
}

function SingleSheet({ data, images }: { data: FlyerData; images: FlyerImageInfo }) {
  const prices = [data.hero, ...data.secondary].filter(Boolean) as FlyerPrice[];
  const columnWidth = CONTENT_W / Math.max(prices.length, 1);

  return (
    <Sheet label="Flyer">
      <Background wave={FRONT_WAVE} />
      <Img image={images.logo} alt="miServices" {...HEADER.logo} />
      <Offer data={data} />
      <BodyColumn top={SINGLE.body.y} bottom={SINGLE.body.bottom}>
        {prices.length > 0 && data.table && (
          <div style={{ display: 'flex', borderBottom: divider, paddingBottom: u(5) }}>
            {prices.map((item, i) => (
              <div
                key={item.label}
                style={{
                  width: u(columnWidth),
                  paddingLeft: i === 0 ? 0 : u(6),
                  display: 'flex',
                  flexDirection: 'column',
                  justifyContent: 'flex-end',
                  borderLeft: i > 0 ? divider : undefined,
                }}
              >
                <FromPrice
                  item={item}
                  labelSize={item.label.length > 16 ? SINGLE.labelSizeLong : SINGLE.labelSize}
                  fromSize={SINGLE.fromSize}
                  priceSize={SINGLE.priceSize(prices.length)}
                />
              </div>
            ))}
          </div>
        )}
        <PriceDetails data={data} compact />
      </BodyColumn>
      <Footer data={data} images={images} />
    </Sheet>
  );
}

/**
 * Front and back side by side (stacked on phones), or the single combined side.
 */
export default function FlyerSheets({
  data,
  layout,
  images,
}: {
  data: FlyerData;
  layout: FlyerLayout;
  images: FlyerImageInfo;
}) {
  if (layout === 'single') {
    return (
      <div className="mx-auto w-full max-w-[560px]">
        <SingleSheet data={data} images={images} />
      </div>
    );
  }
  return (
    <div className="mx-auto grid w-full max-w-[1140px] grid-cols-1 gap-6 md:grid-cols-2">
      <FrontSheet data={data} images={images} />
      <BackSheet data={data} images={images} />
    </div>
  );
}
