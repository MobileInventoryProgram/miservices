import { Document, Image, Page, Path, Svg, Text, View, renderToBuffer } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import { PDFDocument } from 'pdf-lib';
import { getFlyerImages, type FlyerImages } from '@/lib/flyer/assets';
import { registerFonts } from '@/lib/pdf/fonts';
import type { FlyerData, FlyerLayout, FlyerPrice, FlyerTable } from '@/lib/flyer/data';
import {
  BACK_WAVE,
  BLEED,
  COLORS,
  FRONT_WAVE,
  MARGIN,
  PAGE_H,
  PAGE_W,
  TICK_PATH,
  TRIM_H,
  TRIM_W,
} from '@/lib/flyer/geometry';
import { BACK, CONTENT_W, FONTS, FOOTER, FRONT, HEADER, SINGLE, tableSizes } from '@/lib/flyer/layout';

/**
 * Print-ready A5 flyer PDFs (154×216mm pages = A5 + 3mm bleed).
 * Mirrors components/pricing/flyer/ — both are driven by lib/flyer/layout.ts.
 */

export type FlyerVariant = 'print' | 'digital';

/** Absolute position in trim coordinates */
function at(x: number, y: number, width?: number): Style {
  return { position: 'absolute', left: BLEED + x, top: BLEED + y, ...(width != null ? { width } : {}) };
}

const slab = (size: number, color = COLORS.white): Style => ({ fontFamily: FONTS.slab, fontWeight: 300, fontSize: size, color });
const price = (size: number): Style => ({ fontFamily: FONTS.sans, fontWeight: 900, fontSize: size, color: COLORS.white });
const body = (size: number, color = COLORS.white): Style => ({ fontFamily: FONTS.body, fontSize: size, color });

// ─── Shared pieces ───────────────────────────────────────────────

function Background({ wave }: { wave: { band: string; body: string } }) {
  return (
    <Svg
      style={{ position: 'absolute', top: 0, left: 0 }}
      width={PAGE_W}
      height={PAGE_H}
      viewBox={`${-BLEED} ${-BLEED} ${PAGE_W} ${PAGE_H}`}
    >
      <Path d={wave.band} fill={COLORS.wave} />
      <Path d={wave.body} fill={COLORS.navy} />
    </Svg>
  );
}

function Logo({ images, x, y, width }: { images: FlyerImages; x: number; y: number; width: number }) {
  const logo = images.logo;
  if (!logo) return null;
  // eslint-disable-next-line jsx-a11y/alt-text
  return <Image src={{ data: logo.data, format: 'png' }} style={{ ...at(x, y, width), height: (width * logo.height) / logo.width }} />;
}

function Offer({ data }: { data: FlyerData }) {
  const { settings } = data;
  if (!settings.showOffer) return null;
  return (
    <View style={{ ...at(HEADER.offer.x, HEADER.offer.y, HEADER.offer.width), alignItems: 'flex-end' }}>
      <Text style={{ fontFamily: FONTS.sans, fontWeight: 300, fontSize: HEADER.eyebrowSize, color: COLORS.navy, textAlign: 'right' }}>
        {settings.offerEyebrow}
      </Text>
      <Text style={{ ...slab(HEADER.headlineSize, COLORS.grey), textAlign: 'right', lineHeight: 1.08, marginTop: 1 }}>
        {settings.offerHeadline}
      </Text>
      <Text style={{ ...body(HEADER.smallPrintSize, COLORS.grey), fontStyle: 'italic', marginTop: 4 }}>
        {settings.offerSmallPrint}
      </Text>
    </View>
  );
}

function Footer({ data, images }: { data: FlyerData; images: FlyerImages }) {
  const { settings } = data;
  const text = { ...body(FOOTER.textSize, COLORS.grey), lineHeight: FOOTER.lineHeight };
  const bold = { fontWeight: 700 as const };
  const logos = [images.aip, images.prs].filter(Boolean);

  return (
    <>
      <View style={at(FOOTER.text.x, FOOTER.text.y, FOOTER.text.width)}>
        <Text style={text}>
          To make a booking please call <Text style={bold}>{settings.bookingPhone}</Text>
        </Text>
        <Text style={text}>
          or email <Text style={bold}>{settings.bookingEmail}</Text>
        </Text>
        <Text style={{ ...text, ...bold }}>{settings.bookingUrl}</Text>
      </View>
      {logos.length > 0 && (
        <View
          style={{
            ...at(TRIM_W - FOOTER.logos.right - FOOTER.logos.width, FOOTER.logos.y, FOOTER.logos.width),
            alignItems: 'center',
            gap: 4,
          }}
        >
          {logos.map((logo, i) => (
            // eslint-disable-next-line jsx-a11y/alt-text
            <Image
              key={i}
              src={{ data: logo!.data, format: 'png' }}
              style={{ width: FOOTER.logos.width, height: (FOOTER.logos.width * logo!.height) / logo!.width }}
            />
          ))}
        </View>
      )}
    </>
  );
}

function FromPrice({
  item,
  labelSize,
  fromSize,
  priceSize,
  align = 'flex-start',
}: {
  item: FlyerPrice;
  labelSize: number;
  fromSize: number;
  priceSize: number;
  align?: 'flex-start' | 'center';
}) {
  return (
    <View style={{ alignItems: align }}>
      <Text style={{ ...slab(labelSize), lineHeight: 1.05, textAlign: align === 'center' ? 'center' : 'left' }}>{item.label}</Text>
      <View style={{ flexDirection: 'row', alignItems: 'flex-end', marginTop: 2 }}>
        <Text style={{ ...slab(fromSize), marginRight: 4, marginBottom: priceSize * 0.14 }}>From</Text>
        <Text style={{ ...price(priceSize), lineHeight: 1 }}>{item.price}</Text>
      </View>
    </View>
  );
}

function PriceTable({ data, table, compact }: { data: FlyerData; table: FlyerTable; compact: boolean }) {
  const s = tableSizes(data, compact);
  const firstWidth = CONTENT_W * s.firstColumnShare;
  const colWidth = (CONTENT_W - firstWidth) / table.columns.length;
  const line = { borderColor: COLORS.white, borderStyle: 'solid' as const };

  return (
    <View style={{ width: CONTENT_W }}>
      <View style={{ flexDirection: 'row', backgroundColor: COLORS.cyan, minHeight: s.headerHeight }}>
        {['Property Size', ...table.columns].map((column, i) => (
          <View
            key={column}
            style={{
              width: i === 0 ? firstWidth : colWidth,
              justifyContent: 'center',
              paddingHorizontal: 5,
              paddingVertical: 3,
              ...(i > 0 ? { ...line, borderLeftWidth: 0.75 } : {}),
            }}
          >
            <Text
              style={{ ...body(s.headerSize), fontWeight: 700, textAlign: i === 0 ? 'left' : 'center', lineHeight: 1.1 }}
            >
              {column}
            </Text>
          </View>
        ))}
      </View>
      <View style={{ height: compact ? 3 : 6 }} />
      {table.rows.map((row) => (
        <View key={row.size} style={{ flexDirection: 'row', height: s.rowHeight, ...line, borderBottomWidth: 0.75 }}>
          <View style={{ width: firstWidth, justifyContent: 'center', paddingHorizontal: 5 }}>
            <Text style={body(s.sizeLabelSize)}>
              <Text style={{ fontWeight: 700 }}>{row.size}</Text> Bed
              {row.maxRooms && <Text style={{ fontStyle: 'italic', fontSize: s.maxRoomsSize }}> {row.maxRooms}</Text>}
            </Text>
          </View>
          {row.cells.map((cell, i) => (
            <View
              key={i}
              style={{ width: colWidth, justifyContent: 'center', alignItems: 'center', ...line, borderLeftWidth: 0.75 }}
            >
              <Text style={body(s.cellSize)}>
                {cell.from && <Text style={{ fontStyle: 'italic' }}>From </Text>}
                {cell.main}
                {cell.sub && <Text style={{ fontSize: s.subSize, color: COLORS.tick }}> / {cell.sub}</Text>}
              </Text>
            </View>
          ))}
        </View>
      ))}
      <View style={{ flexDirection: 'row', justifyContent: 'space-between', marginTop: 3 }}>
        <Text style={{ ...body(s.smallSize, COLORS.tick), fontStyle: 'italic' }}>
          {table.dualPrices ? 'Unfurnished / furnished' : ''}
        </Text>
        <Text style={{ ...body(s.smallSize), fontStyle: 'italic' }}>{data.settings.vatNote}</Text>
      </View>
    </View>
  );
}

function RateList({ rates, compact }: { rates: FlyerPrice[]; compact: boolean }) {
  return (
    <View style={{ width: CONTENT_W }}>
      {rates.map((rate) => (
        <View
          key={rate.label}
          style={{
            flexDirection: 'row',
            justifyContent: 'space-between',
            alignItems: 'flex-end',
            paddingVertical: compact ? 4 : 7,
            borderBottomWidth: 0.75,
            borderColor: COLORS.divider,
            borderStyle: 'solid',
          }}
        >
          <Text style={{ ...slab(compact ? 12 : 15), flex: 1, paddingRight: 10 }}>{rate.label}</Text>
          <Text style={price(compact ? 15 : 20)}>{rate.price}</Text>
        </View>
      ))}
    </View>
  );
}

/** Price table side content (notes, table/rates, footnotes) */
function PriceDetails({ data, compact }: { data: FlyerData; compact: boolean }) {
  const s = tableSizes(data, compact);
  const notes = [data.furnishedNote, data.flyerNote].filter(Boolean) as string[];

  return (
    <>
      {notes.map((note) => (
        <Text key={note} style={{ ...body(s.noteSize), textAlign: 'justify', lineHeight: 1.25 }}>
          {note}
        </Text>
      ))}
      {data.table && <PriceTable data={data} table={data.table} compact={compact} />}
      {data.extraRates.length > 0 && <RateList rates={data.extraRates} compact={compact && !!data.table} />}
      {!data.table && (
        <Text style={{ ...body(s.smallSize), fontStyle: 'italic', textAlign: 'right' }}>{data.settings.vatNote}</Text>
      )}
      {data.extraRoomNote && <Text style={body(s.noteSize)}>{data.extraRoomNote}</Text>}
      <Text style={body(s.smallSize)}>{data.settings.websiteNote}</Text>
    </>
  );
}

// ─── Pages ───────────────────────────────────────────────────────

function introParts(text: string) {
  // "miServices" is printed in bold, as on the original leaflet
  return text.split(/(miServices)/g).map((part, i) =>
    part === 'miServices' ? (
      <Text key={i} style={{ fontWeight: 700 }}>
        {part}
      </Text>
    ) : (
      part
    )
  );
}

function FrontPage({ data, images }: { data: FlyerData; images: FlyerImages }) {
  const { hero, secondary, settings } = data;
  const columnWidth = CONTENT_W / Math.max(secondary.length, 1);

  return (
    <Page size={[PAGE_W, PAGE_H]} style={{ backgroundColor: COLORS.paper }}>
      <Background wave={FRONT_WAVE} />
      <Logo images={images} {...HEADER.logo} />
      <Offer data={data} />

      {hero && (
        <View style={at(FRONT.hero.x, FRONT.hero.y, FRONT.hero.width)}>
          <FromPrice
            item={hero}
            labelSize={hero.label.length > 14 ? FRONT.heroLabelSizeLong : FRONT.heroLabelSize}
            fromSize={FRONT.heroFromSize}
            priceSize={FRONT.heroPriceSize}
          />
        </View>
      )}
      <Text style={{ ...at(FRONT.intro.x, FRONT.intro.y, FRONT.intro.width), ...body(FRONT.introSize), lineHeight: 1.35 }}>
        {introParts(settings.introText)}
      </Text>

      {secondary.length > 0 && (
        <View
          style={{
            ...at(MARGIN, FRONT.secondary.y, CONTENT_W),
            height: FRONT.secondary.height,
            flexDirection: 'row',
            borderBottomWidth: 1,
            borderColor: COLORS.divider,
            borderStyle: 'solid',
          }}
        >
          {secondary.map((item, i) => (
            <View
              key={item.label}
              style={{
                width: columnWidth,
                paddingLeft: i === 0 ? 0 : 8,
                paddingBottom: 6,
                justifyContent: 'flex-end',
                ...(i > 0 ? { borderLeftWidth: 1, borderColor: COLORS.divider, borderStyle: 'solid' } : {}),
              }}
            >
              <FromPrice
                item={item}
                labelSize={item.label.length > 24 ? FRONT.secondaryLabelSizeLong : FRONT.secondaryLabelSize}
                fromSize={FRONT.secondaryFromSize}
                priceSize={FRONT.secondaryPriceSize}
              />
            </View>
          ))}
        </View>
      )}
      <Text style={{ ...at(MARGIN, FRONT.vatY, CONTENT_W), ...body(FRONT.vatSize), fontStyle: 'italic', textAlign: 'right' }}>
        {settings.vatNote}
      </Text>

      <View style={at(FRONT.ticks.x, FRONT.ticks.y, CONTENT_W - 4)}>
        {settings.sellingPoints.slice(0, 7).map((point, i) => (
          <View key={i} style={{ flexDirection: 'row', alignItems: 'center', height: FRONT.ticks.rowHeight }}>
            <Svg width={FRONT.ticks.tickSize} height={FRONT.ticks.tickSize} viewBox="0 0 24 24" style={{ marginRight: 8 }}>
              <Path d={TICK_PATH} fill={COLORS.tick} />
            </Svg>
            <Text style={body(FRONT.tickDetailSize)}>
              {point.prefix && <Text>{point.prefix} </Text>}
              <Text style={slab(FRONT.tickHighlightSize)}>{point.highlight}</Text>
              {point.detail && <Text> {point.detail}</Text>}
            </Text>
          </View>
        ))}
      </View>

      <Footer data={data} images={images} />
    </Page>
  );
}

function BackPage({ data, images }: { data: FlyerData; images: FlyerImages }) {
  const aip = images.aip;
  return (
    <Page size={[PAGE_W, PAGE_H]} style={{ backgroundColor: COLORS.paper }}>
      <Background wave={BACK_WAVE} />
      {aip && (
        // eslint-disable-next-line jsx-a11y/alt-text
        <Image
          src={{ data: aip.data, format: 'png' }}
          style={{ ...at(BACK.aip.x, BACK.aip.y, BACK.aip.width), height: (BACK.aip.width * aip.height) / aip.width }}
        />
      )}
      <Logo images={images} {...BACK.logo} />

      <View
        style={{
          ...at(MARGIN, BACK.body.y, CONTENT_W),
          height: BACK.body.bottom - BACK.body.y,
          justifyContent: 'space-evenly',
        }}
      >
        <PriceDetails data={data} compact={false} />
      </View>

      <Footer data={data} images={images} />
    </Page>
  );
}

function SinglePage({ data, images }: { data: FlyerData; images: FlyerImages }) {
  const prices = [data.hero, ...data.secondary].filter(Boolean) as FlyerPrice[];
  const columnWidth = CONTENT_W / Math.max(prices.length, 1);

  return (
    <Page size={[PAGE_W, PAGE_H]} style={{ backgroundColor: COLORS.paper }}>
      <Background wave={FRONT_WAVE} />
      <Logo images={images} {...HEADER.logo} />
      <Offer data={data} />

      <View
        style={{
          ...at(MARGIN, SINGLE.body.y, CONTENT_W),
          height: SINGLE.body.bottom - SINGLE.body.y,
          justifyContent: 'space-evenly',
        }}
      >
        {prices.length > 0 && data.table && (
          <View style={{ flexDirection: 'row', borderBottomWidth: 1, borderColor: COLORS.divider, borderStyle: 'solid', paddingBottom: 5 }}>
            {prices.map((item, i) => (
              <View
                key={item.label}
                style={{
                  width: columnWidth,
                  paddingLeft: i === 0 ? 0 : 6,
                  justifyContent: 'flex-end',
                  ...(i > 0 ? { borderLeftWidth: 1, borderColor: COLORS.divider, borderStyle: 'solid' } : {}),
                }}
              >
                <FromPrice
                  item={item}
                  labelSize={item.label.length > 16 ? SINGLE.labelSizeLong : SINGLE.labelSize}
                  fromSize={SINGLE.fromSize}
                  priceSize={SINGLE.priceSize(prices.length)}
                />
              </View>
            ))}
          </View>
        )}
        <PriceDetails data={data} compact />
      </View>

      <Footer data={data} images={images} />
    </Page>
  );
}

function FlyerDocument({ data, layout, images }: { data: FlyerData; layout: FlyerLayout; images: FlyerImages }) {
  return (
    <Document title={`${data.title} — A5 flyer`} author="miServices" creator="miServices" producer="miServices">
      {layout === 'double' ? (
        <>
          <FrontPage data={data} images={images} />
          <BackPage data={data} images={images} />
        </>
      ) : (
        <SinglePage data={data} images={images} />
      )}
    </Document>
  );
}

/**
 * Render the flyer and set the print boxes.
 * print:   TrimBox = A5 (inset 3mm), BleedBox = full page — for the print shop.
 * digital: CropBox = TrimBox as well, so viewers show a clean A5 page.
 */
export async function renderFlyerPdf(
  data: FlyerData,
  { layout, variant }: { layout: FlyerLayout; variant: FlyerVariant }
): Promise<Uint8Array> {
  registerFonts();
  const raw = await renderToBuffer(<FlyerDocument data={data} layout={layout} images={getFlyerImages()} />);

  const pdf = await PDFDocument.load(raw);
  for (const page of pdf.getPages()) {
    page.setMediaBox(0, 0, PAGE_W, PAGE_H);
    page.setBleedBox(0, 0, PAGE_W, PAGE_H);
    page.setTrimBox(BLEED, BLEED, TRIM_W, TRIM_H);
    if (variant === 'digital') {
      page.setCropBox(BLEED, BLEED, TRIM_W, TRIM_H);
    }
  }
  pdf.setTitle(`${data.title} — A5 flyer`);
  pdf.setAuthor('miServices');
  pdf.setCreator('miServices');
  pdf.setProducer('miServices');
  return pdf.save();
}

