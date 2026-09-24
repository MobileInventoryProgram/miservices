import { Document, Image, Page, Path, Svg, Text, View, renderToBuffer } from '@react-pdf/renderer';
import type { Style } from '@react-pdf/types';
import { getFlyerImages } from '@/lib/flyer/assets';
import type { FlyerData } from '@/lib/flyer/data';
import { COLORS, TICK_PATH } from '@/lib/flyer/geometry';
import type { MiProgramTable } from '@/lib/quote/miprogram';
import { FONTS } from '@/lib/flyer/layout';
import { registerFonts } from '@/lib/pdf/fonts';
import type { QuoteDocumentData } from '@/lib/quote/document';
import type { TextBlock } from '@/lib/quote/template';

/**
 * A4 quote PDF. Mirrors components/quote/QuoteDocument.tsx — both render from
 * buildQuoteDocument().
 */

const TEXT = '#1f2937';
const MUTED = '#6b7280';
const LIGHT = '#f3f4f6';

const body = (size = 10, color = TEXT): Style => ({ fontFamily: FONTS.body, fontSize: size, color, lineHeight: 1.45 });

function Blocks({ blocks }: { blocks: TextBlock[] }) {
  return (
    <View style={{ gap: 9 }}>
      {blocks.map((block, i) =>
        block.type === 'paragraph' ? (
          <Text key={i} style={body(12.5)}>
            {block.text}
          </Text>
        ) : (
          <View key={i} style={{ gap: 5 }}>
            {block.items.map((item, j) => (
              <View key={j} style={{ flexDirection: 'row', gap: 7 }} wrap={false}>
                <Svg width={12} height={12} viewBox="0 0 24 24" style={{ marginTop: 3.5 }}>
                  <Path d={TICK_PATH} fill={COLORS.wave} />
                </Svg>
                <Text style={{ ...body(12.5), flex: 1 }}>{item}</Text>
              </View>
            ))}
          </View>
        )
      )}
    </View>
  );
}

function Pricing({ pricing }: { pricing: FlyerData }) {
  const table = pricing.table;
  const notes = [pricing.furnishedNote, pricing.flyerNote].filter(Boolean) as string[];
  const firstShare = 0.28;
  const colShare = table ? (1 - firstShare) / table.columns.length : 0;
  const cell = (share: number, align: 'left' | 'center' = 'center'): Style => ({
    width: `${share * 100}%`,
    paddingVertical: 6,
    paddingHorizontal: 6,
    textAlign: align,
  });

  return (
    <View style={{ marginTop: 10, gap: 8 }}>
      {notes.map((note) => (
        <Text key={note} style={body(11)}>
          {note}
        </Text>
      ))}
      {table && (
        <View style={{ borderWidth: 0.75, borderColor: '#e5e7eb', borderStyle: 'solid', borderRadius: 3 }} wrap={false}>
          <View style={{ flexDirection: 'row', backgroundColor: COLORS.navy }}>
            <Text style={{ ...cell(firstShare, 'left'), ...body(10, '#ffffff'), fontWeight: 700 }}>Property size</Text>
            {table.columns.map((column) => (
              <Text key={column} style={{ ...cell(colShare), ...body(10, '#ffffff'), fontWeight: 700, lineHeight: 1.15 }}>
                {column}
              </Text>
            ))}
          </View>
          {table.rows.map((row, i) => (
            <View key={row.size} style={{ flexDirection: 'row', backgroundColor: i % 2 ? '#f5f8ff' : '#ffffff' }}>
              <Text style={{ ...cell(firstShare, 'left'), ...body(10.5) }}>
                <Text style={{ fontWeight: 700 }}>{row.size}</Text> Bed
                {row.maxRooms && <Text style={{ fontStyle: 'italic', fontSize: 8, color: MUTED }}> {row.maxRooms}</Text>}
              </Text>
              {row.cells.map((c, j) => (
                <Text key={j} style={{ ...cell(colShare), ...body(10.5) }}>
                  {c.from && <Text style={{ fontStyle: 'italic', color: MUTED }}>From </Text>}
                  <Text style={{ fontWeight: 700 }}>{c.main}</Text>
                  {c.sub && <Text style={{ fontSize: 8.5, color: MUTED }}> / {c.sub}</Text>}
                </Text>
              ))}
            </View>
          ))}
        </View>
      )}
      {table?.dualPrices && <Text style={{ ...body(9, MUTED), fontStyle: 'italic' }}>Prices shown as unfurnished / furnished.</Text>}
      {pricing.extraRates.length > 0 && (
        <View style={{ borderWidth: 0.75, borderColor: '#e5e7eb', borderStyle: 'solid', borderRadius: 3 }} wrap={false}>
          {pricing.extraRates.map((rate, i) => (
            <View
              key={rate.label}
              style={{
                flexDirection: 'row',
                justifyContent: 'space-between',
                paddingVertical: 6,
                paddingHorizontal: 8,
                ...(i > 0 ? { borderTopWidth: 0.75, borderTopColor: LIGHT, borderStyle: 'solid' } : {}),
              }}
            >
              <Text style={body(11)}>{rate.label}</Text>
              <Text style={{ ...body(11), fontWeight: 700 }}>{rate.price}</Text>
            </View>
          ))}
        </View>
      )}
      {pricing.extraRoomNote && <Text style={body(11)}>{pricing.extraRoomNote}</Text>}
      <Text style={{ ...body(9, MUTED), fontStyle: 'italic' }}>{pricing.settings.vatNote}</Text>
    </View>
  );
}

function MiProgramPrices({ table }: { table: MiProgramTable }) {
  const col = (share: number, align: 'left' | 'center' = 'center'): Style => ({
    width: `${share * 100}%`,
    paddingVertical: 4.5,
    paddingHorizontal: 6,
    textAlign: align,
  });
  const shares = [0.28, 0.18, 0.18, 0.18, 0.18];

  return (
    <View style={{ marginTop: 10, gap: 8 }}>
      {table.callout && (
        <Text
          style={{
            ...body(10.5, COLORS.navy),
            fontWeight: 700,
            backgroundColor: '#eef9fe',
            borderWidth: 0.75,
            borderColor: COLORS.cyan,
            borderStyle: 'solid',
            borderRadius: 3,
            padding: 8,
          }}
        >
          {table.callout}
        </Text>
      )}
      <View style={{ borderWidth: 0.75, borderColor: '#e5e7eb', borderStyle: 'solid', borderRadius: 3 }} wrap={false}>
        <View style={{ flexDirection: 'row', backgroundColor: COLORS.navy }}>
          <Text style={{ ...col(shares[0], 'left'), ...body(9, '#ffffff'), fontWeight: 700 }}>Properties</Text>
          <Text style={{ ...col(shares[1] + shares[2]), ...body(9, '#ffffff'), fontWeight: 700 }}>miProgram price</Text>
          <Text style={{ ...col(shares[3] + shares[4]), ...body(9, '#ffffff'), fontWeight: 700, backgroundColor: COLORS.wave }}>
            With your {table.discountPercent}% miServices discount
          </Text>
        </View>
        <View style={{ flexDirection: 'row', backgroundColor: COLORS.navy }}>
          <Text style={{ ...col(shares[0], 'left'), ...body(8.5, '#ffffff') }}> </Text>
          <Text style={{ ...col(shares[1]), ...body(8.5, '#ffffff') }}>Monthly</Text>
          <Text style={{ ...col(shares[2]), ...body(8.5, '#ffffff') }}>Annual</Text>
          <Text style={{ ...col(shares[3]), ...body(8.5, '#ffffff'), backgroundColor: COLORS.wave }}>Monthly</Text>
          <Text style={{ ...col(shares[4]), ...body(8.5, '#ffffff'), backgroundColor: COLORS.wave }}>Annual</Text>
        </View>
        {table.rows.map((row, i) => {
          const bold = row.highlighted ? { fontWeight: 700 as const } : {};
          return (
            <View
              key={row.label}
              style={{
                flexDirection: 'row',
                backgroundColor: row.highlighted ? '#dff3fc' : i % 2 ? '#f5f8ff' : '#ffffff',
                ...(row.highlighted ? { borderLeftWidth: 3, borderLeftColor: COLORS.cyan, borderStyle: 'solid' } : {}),
              }}
            >
              <Text style={{ ...col(shares[0], 'left'), ...body(9.5), ...bold }}>
                {row.label}
                {row.highlighted ? ' (your plan)' : ''}
              </Text>
              <Text style={{ ...col(shares[1]), ...body(9.5, MUTED), textDecoration: row.monthly.startsWith('£') ? 'line-through' : 'none' }}>{row.monthly}</Text>
              <Text style={{ ...col(shares[2]), ...body(9.5, MUTED), textDecoration: row.annual.startsWith('£') ? 'line-through' : 'none' }}>{row.annual}</Text>
              <Text style={{ ...col(shares[3]), ...body(9.5), ...bold }}>{row.discountedMonthly}</Text>
              <Text style={{ ...col(shares[4]), ...body(9.5), ...bold }}>{row.discountedAnnual}</Text>
            </View>
          );
        })}
      </View>
      <Text style={body(8, MUTED)}>
        {table.note} Full details: {table.url}
      </Text>
    </View>
  );
}

// Landscape 16:9 slides, matching the online presentation (components/quote/QuoteSlides.tsx)
const SLIDE_W = 960;
const SLIDE_H = 540;
const PANEL_W = 290; // title panel on section slides
const PAD = 40;

function QuotePdf({ data }: { data: QuoteDocumentData }) {
  const logo = getFlyerImages().logo;
  const boxes = [
    { label: 'PREPARED FOR', name: data.client.name, lines: data.client.lines },
    { label: 'PREPARED BY', name: data.preparedBy.name, lines: data.preparedBy.lines },
  ];
  const total = data.sections.length;
  const logoImage = (width: number, style: Style = {}) =>
    logo ? (
      // eslint-disable-next-line jsx-a11y/alt-text
      <Image src={{ data: logo.data, format: 'png' }} style={{ width, height: (width * logo.height) / logo.width, ...style }} />
    ) : null;

  return (
    <Document title={`${data.reference} — miServices proposal`} author="miServices" creator="miServices" producer="miServices">
      {/* Cover slide */}
      <Page size={[SLIDE_W, SLIDE_H]} style={{ backgroundColor: '#ffffff', flexDirection: 'row' }}>
        <View style={{ flex: 1, paddingHorizontal: 56, justifyContent: 'center' }}>
          {logoImage(78)}
          <Text style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 9, letterSpacing: 2.5, color: COLORS.wave, marginTop: 30 }}>
            PROPOSAL
          </Text>
          <Text style={{ fontFamily: FONTS.slab, fontWeight: 300, fontSize: 32, color: COLORS.navy, marginTop: 6, lineHeight: 1.12 }}>
            {data.cover.headline}
          </Text>
          {data.cover.intro ? <Text style={{ ...body(12, '#4b5563'), marginTop: 10 }}>{data.cover.intro}</Text> : null}
          <View style={{ width: 44, height: 3, backgroundColor: COLORS.cyan, marginTop: 14 }} />
          <View style={{ flexDirection: 'row', marginTop: 22, gap: 28 }}>
            {[
              ['REFERENCE', data.reference],
              ['DATE', data.date],
              ['VALID UNTIL', data.validUntil],
            ].map(([label, value]) => (
              <View key={label}>
                <Text style={{ ...body(7.5, MUTED), letterSpacing: 1 }}>{label}</Text>
                <Text style={{ ...body(10), fontWeight: 700 }}>{value}</Text>
              </View>
            ))}
          </View>
        </View>
        <View style={{ width: 360, backgroundColor: COLORS.navy, paddingHorizontal: 40, justifyContent: 'center', gap: 22 }}>
          {boxes.map((box) => (
            <View key={box.label}>
              <Text style={{ ...body(8, '#bfdbfe'), fontWeight: 700, letterSpacing: 1 }}>{box.label}</Text>
              <Text style={{ ...body(13, '#ffffff'), fontWeight: 700, marginTop: 2 }}>{box.name}</Text>
              {box.lines.map((line) => (
                <Text key={line} style={body(9.5, '#dbeafe')}>
                  {line}
                </Text>
              ))}
            </View>
          ))}
        </View>
      </Page>

      {/* One slide per section (long sections continue on another slide) */}
      {data.sections.map((section, i) => (
        <Page
          key={section.key}
          size={[SLIDE_W, SLIDE_H]}
          style={{ backgroundColor: '#ffffff', paddingLeft: PANEL_W + PAD, paddingRight: PAD, paddingTop: PAD, paddingBottom: PAD + 10 }}
        >
          <View
            fixed
            style={{ position: 'absolute', left: 0, top: 0, bottom: 0, width: PANEL_W, backgroundColor: COLORS.navy, padding: 32, justifyContent: 'space-between' }}
          >
            <View>
              <Text style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 10, color: '#bfdbfe' }}>
                {String(i + 1).padStart(2, '0')} <Text style={{ fontWeight: 400, color: '#93c5fd' }}>/ {String(total).padStart(2, '0')}</Text>
              </Text>
              <Text style={{ fontFamily: FONTS.slab, fontWeight: 300, fontSize: 24, color: '#ffffff', marginTop: 10, lineHeight: 1.15 }}>
                {section.title}
              </Text>
              <View style={{ width: 36, height: 3, backgroundColor: COLORS.cyan, marginTop: 12 }} />
            </View>
            <View>
              {logo && (
                <View style={{ backgroundColor: '#ffffff', borderRadius: 3, padding: 6, alignSelf: 'flex-start' }}>{logoImage(34)}</View>
              )}
              <Text style={{ ...body(8, '#bfdbfe'), marginTop: 8 }}>{data.reference}</Text>
            </View>
          </View>

          {section.miProgram ? (
            <View style={{ flexDirection: 'row', gap: 22, flexGrow: 1, alignItems: 'center' }}>
              <View style={{ width: '40%' }}>
                <Blocks blocks={section.blocks} />
              </View>
              <View style={{ flex: 1 }}>
                <MiProgramPrices table={section.miProgram} />
              </View>
            </View>
          ) : (
            <View style={{ flexGrow: 1, justifyContent: 'center' }}>
              <Blocks blocks={section.blocks} />
              {section.pricing && <Pricing pricing={section.pricing} />}
            </View>
          )}

          <Text
            fixed
            style={{ position: 'absolute', right: PAD, bottom: 18, ...body(7.5, MUTED) }}
            render={({ pageNumber, totalPages }) => `${data.reference} · Valid until ${data.validUntil} · ${pageNumber} / ${totalPages}`}
          />
        </Page>
      ))}

      {/* Closing slide */}
      <Page size={[SLIDE_W, SLIDE_H]} style={{ backgroundColor: COLORS.navy, paddingHorizontal: 72, justifyContent: 'center' }}>
        <Text style={{ fontFamily: FONTS.sans, fontWeight: 700, fontSize: 9, letterSpacing: 2.5, color: '#bfdbfe' }}>THANK YOU</Text>
        <Text style={{ fontFamily: FONTS.slab, fontWeight: 300, fontSize: 32, color: '#ffffff', marginTop: 6 }}>Ready to get started?</Text>
        <View style={{ width: 44, height: 3, backgroundColor: COLORS.cyan, marginTop: 14 }} />
        <Text style={{ ...body(12, '#dbeafe'), marginTop: 18, maxWidth: 560 }}>
          This quote is valid until {data.validUntil}. Accept it online using the link in your email, or contact {data.preparedBy.name}
          {data.preparedBy.lines.length > 1 ? ` — ${data.preparedBy.lines.slice(1).join(' · ')}` : ''}.
        </Text>
        <Text style={{ ...body(10, '#ffffff'), fontWeight: 700, marginTop: 28 }}>www.mobileinventoryservices.co.uk</Text>
      </Page>
    </Document>
  );
}

export async function renderQuotePdf(data: QuoteDocumentData): Promise<Buffer> {
  registerFonts();
  return renderToBuffer(<QuotePdf data={data} />);
}
