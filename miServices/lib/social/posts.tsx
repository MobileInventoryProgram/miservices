import type { CSSProperties, ReactNode } from 'react';
import { CORNER_BACK, CORNER_FRONT } from '@/lib/social/shapes';
import { BRAND, brandLogo } from '@/lib/social/brand';
import { POST_SIZES, type PostSize, type PostTheme } from '@/lib/social/templates';

/**
 * Social post designs rendered with next/og. Every template shares the same
 * locked frame (logo, territory chip, corner wave, footer); only the text and
 * photos members supply change.
 */

interface Palette {
  bg: string;
  bgImage: string;
  text: string;
  muted: string;
  accent: string;
  accentSoft: string;
  card: string;
  cardBorder: string;
  chip: string;
  chipText: string;
  blob: string;
  blobBack: string;
  /** Laid over a background photo so text stays readable */
  overlay: string;
}

const PALETTES: Record<PostTheme, Palette> = {
  navy: {
    bg: BRAND.navy,
    bgImage: `radial-gradient(circle at 88% 8%, rgba(21,126,195,0.55), rgba(30,51,111,0) 55%)`,
    text: BRAND.white,
    muted: '#c7d3f2',
    accent: BRAND.cyan,
    accentSoft: 'rgba(0,174,239,0.16)',
    card: 'rgba(255,255,255,0.06)',
    cardBorder: 'rgba(255,255,255,0.18)',
    chip: 'rgba(255,255,255,0.12)',
    chipText: BRAND.white,
    blob: BRAND.blue,
    blobBack: '#2a4288',
    overlay: 'linear-gradient(180deg, rgba(30,51,111,0.93) 0%, rgba(30,51,111,0.84) 55%, rgba(30,51,111,0.9) 100%)',
  },
  light: {
    bg: BRAND.white,
    bgImage: `radial-gradient(circle at 88% 8%, rgba(0,174,239,0.14), rgba(255,255,255,0) 55%)`,
    text: '#1c2b57',
    muted: '#5b6477',
    accent: BRAND.blue,
    accentSoft: '#e3ecfa',
    card: '#f5f8fe',
    cardBorder: '#dbe5f5',
    chip: '#e3ecfa',
    chipText: BRAND.navy,
    blob: '#e3ecfa',
    blobBack: '#d2def3',
    overlay: 'linear-gradient(180deg, rgba(255,255,255,0.93) 0%, rgba(255,255,255,0.82) 55%, rgba(255,255,255,0.9) 100%)',
  },
};

export interface PostInput {
  template: string;
  theme: PostTheme;
  size: PostSize;
  fields: Record<string, string>;
  photos: Record<string, string>;
  /** e.g. "miServices Herts" */
  franchiseName: string;
}

const PAD = 72;
const STAR = 'M12 2l2.9 6.9 7.1.6-5.4 4.7 1.6 7-6.2-3.8-6.2 3.8 1.6-7L2 9.5l7.1-.6z';

/** Pick a font size by text length: [[maxLength, size], ...] then fallback */
function fit(text: string, steps: [number, number][], fallback: number): number {
  for (const [max, size] of steps) if (text.length <= max) return size;
  return fallback;
}

function initials(name: string): string {
  return name
    .split(/\s+/)
    .filter(Boolean)
    .slice(0, 2)
    .map((w) => w[0]!.toUpperCase())
    .join('');
}

function Chip({ p, children, style }: { p: Palette; children: ReactNode; style?: CSSProperties }) {
  return (
    <div
      style={{
        display: 'flex',
        alignSelf: 'flex-start',
        background: p.chip,
        color: p.chipText,
        fontFamily: 'Roboto',
        fontWeight: 700,
        fontSize: 24,
        letterSpacing: 3,
        textTransform: 'uppercase',
        padding: '12px 26px',
        borderRadius: 999,
        ...style,
      }}
    >
      {children}
    </div>
  );
}

function Avatar({ src, name, size, p }: { src?: string; name: string; size: number; p: Palette }) {
  if (src) {
    return (
      // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
      <img src={src} width={size} height={size} style={{ borderRadius: size, objectFit: 'cover', border: `4px solid ${p.accent}` }} />
    );
  }
  return (
    <div
      style={{
        display: 'flex',
        width: size,
        height: size,
        borderRadius: size,
        background: p.accent,
        color: BRAND.white,
        alignItems: 'center',
        justifyContent: 'center',
        fontFamily: 'Roboto',
        fontWeight: 700,
        fontSize: size * 0.36,
      }}
    >
      {initials(name) || 'mi'}
    </div>
  );
}

function Frame({ input, p, children }: { input: PostInput; p: Palette; children: ReactNode }) {
  const { width: W, height: H } = POST_SIZES[input.size];
  const logo = brandLogo();
  const logoH = 118;
  const logoImg = (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={logo.src} height={logoH} width={(logoH * logo.width) / logo.height} />
  );

  const background = input.photos.background;

  return (
    <div
      style={{
        display: 'flex',
        flexDirection: 'column',
        width: W,
        height: H,
        position: 'relative',
        background: p.bg,
        ...(background ? {} : { backgroundImage: p.bgImage }),
        fontFamily: 'PT Sans',
        color: p.text,
      }}
    >
      {background && (
        // Already cropped to the post size in the browser, using the member's framing
        // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
        <img src={background} width={W} height={H} style={{ position: 'absolute', left: 0, top: 0, width: W, height: H, objectFit: 'cover' }} />
      )}
      {background && <div style={{ display: 'flex', position: 'absolute', left: 0, top: 0, width: W, height: H, backgroundImage: p.overlay }} />}
      <svg width={W * 0.62} height={H * 0.42} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', right: 0, bottom: 0 }}>
        <path d={CORNER_BACK} fill={p.blobBack} />
        <path d={CORNER_FRONT} fill={p.blob} />
      </svg>

      {/* Header */}
      <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', padding: `${PAD - 12}px ${PAD}px 0` }}>
        {input.theme === 'navy' ? (
          <div style={{ display: 'flex', background: BRAND.white, borderRadius: 18, padding: 12 }}>{logoImg}</div>
        ) : (
          logoImg
        )}
        <div
          style={{
            display: 'flex',
            alignItems: 'center',
            gap: 12,
            border: `2px solid ${p.cardBorder}`,
            borderRadius: 999,
            padding: '12px 24px',
            fontFamily: 'Roboto',
            fontWeight: 500,
            fontSize: 24,
            color: p.text,
          }}
        >
          <div style={{ display: 'flex', width: 14, height: 14, borderRadius: 14, background: p.accent }} />
          {input.franchiseName}
        </div>
      </div>

      {/* Content */}
      <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, padding: `44px ${PAD}px 24px` }}>{children}</div>

      {/* Footer */}
      <div style={{ display: 'flex', alignItems: 'center', gap: 16, padding: `0 ${PAD}px ${PAD - 20}px` }}>
        <div style={{ display: 'flex', width: 48, height: 5, borderRadius: 5, background: p.accent }} />
        <div style={{ display: 'flex', fontFamily: 'Roboto', fontWeight: 700, fontSize: 24, color: p.text }}>{BRAND.website}</div>
      </div>
    </div>
  );
}

// ─── Templates ───────────────────────────────────────────────────

function Review({ input, p }: { input: PostInput; p: Palette }) {
  const f = input.fields;
  const stars = Number(f.stars) || 5;
  const review = f.review || '';
  const size = fit(review, [[120, 46], [200, 40], [260, 35]], 32) + (input.size === 'portrait' ? 4 : 0);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
      <div
        style={{
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          position: 'relative',
          background: p.card,
          border: `2px solid ${p.cardBorder}`,
          borderRadius: 40,
          padding: '76px 56px 48px',
          marginTop: 30,
        }}
      >
        <div
          style={{
            display: 'flex',
            position: 'absolute',
            top: -46,
            width: 92,
            height: 92,
            borderRadius: 92,
            background: `linear-gradient(135deg, ${BRAND.wave}, ${BRAND.cyan})`,
            alignItems: 'center',
            justifyContent: 'center',
            color: BRAND.white,
            fontFamily: 'Roboto Slab',
            fontWeight: 700,
            fontSize: 88,
            paddingTop: 34,
          }}
        >
          “
        </div>
        <div style={{ display: 'flex', gap: 12 }}>
          {[1, 2, 3, 4, 5].map((n) => (
            <svg key={n} width={56} height={56} viewBox="0 0 24 24">
              <path d={STAR} fill={n <= stars ? '#fbbf24' : p.cardBorder} />
            </svg>
          ))}
        </div>
        <div style={{ display: 'flex', marginTop: 10, fontSize: 24, color: p.muted }}>{`${stars}/5 stars`}</div>
        <div style={{ display: 'flex', marginTop: 22, fontStyle: 'italic', fontSize: size, lineHeight: 1.35, textAlign: 'center', justifyContent: 'center' }}>
          {`“${review}”`}
        </div>
        <div style={{ display: 'flex', alignItems: 'center', gap: 22, marginTop: 36 }}>
          <Avatar src={input.photos.reviewerPhoto} name={f.name || f.company || ''} size={96} p={p} />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <div style={{ display: 'flex', fontFamily: 'Roboto', fontWeight: 700, fontSize: 30 }}>{f.name}</div>
            {f.company && <div style={{ display: 'flex', fontSize: 26, color: p.muted }}>{f.company}</div>}
          </div>
        </div>
      </div>
    </div>
  );
}

function Quote({ input, p }: { input: PostInput; p: Palette }) {
  const f = input.fields;
  const quote = f.quote || '';
  const size = fit(quote, [[60, 76], [110, 64], [150, 56]], 50) + (input.size === 'portrait' ? 6 : 0);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
      {f.label && <Chip p={p}>{f.label}</Chip>}
      <div style={{ display: 'flex', fontFamily: 'Roboto Slab', fontWeight: 700, fontSize: 200, lineHeight: 0.8, color: p.accent, marginTop: 40, height: 110 }}>
        “
      </div>
      <div style={{ display: 'flex', fontFamily: 'Roboto Slab', fontWeight: 300, fontSize: size, lineHeight: 1.22 }}>{quote}</div>
      <div style={{ display: 'flex', width: 90, height: 6, borderRadius: 6, background: p.accent, marginTop: 44 }} />
      {(f.name || f.role) && (
        <div style={{ display: 'flex', alignItems: 'center', gap: 24, marginTop: 32 }}>
          {input.photos.photo && <Avatar src={input.photos.photo} name={f.name || ''} size={110} p={p} />}
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            {f.name && <div style={{ display: 'flex', fontFamily: 'Roboto', fontWeight: 700, fontSize: 32 }}>{f.name}</div>}
            {f.role && <div style={{ display: 'flex', fontSize: 28, color: p.muted }}>{f.role}</div>}
          </div>
        </div>
      )}
    </div>
  );
}

function Announcement({ input, p, tip = false }: { input: PostInput; p: Palette; tip?: boolean }) {
  const f = input.fields;
  const headline = f.headline || '';
  const hSize = fit(headline, [[35, 92], [55, 80]], 70) + (input.size === 'portrait' ? 6 : 0);
  const bodySize = 38;

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
      {f.label &&
        (tip ? (
          <div style={{ display: 'flex', fontFamily: 'Roboto Slab', fontWeight: 300, fontSize: 52, color: p.accent }}>{f.label}</div>
        ) : (
          <Chip p={p}>{f.label}</Chip>
        ))}
      <div style={{ display: 'flex', fontFamily: 'Roboto', fontWeight: 700, fontSize: hSize, lineHeight: 1.1, letterSpacing: -1, marginTop: 26 }}>
        {headline}
      </div>
      {f.body && (
        <div style={{ display: 'flex', fontSize: bodySize, lineHeight: 1.4, color: p.muted, marginTop: 24 }}>{f.body}</div>
      )}
    </div>
  );
}

function Stat({ input, p }: { input: PostInput; p: Palette }) {
  const f = input.fields;
  const number = f.number || '';
  const nSize = fit(number, [[4, 300], [6, 240]], 190);
  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1, justifyContent: 'center' }}>
      <div style={{ display: 'flex', fontFamily: 'Roboto', fontWeight: 900, fontSize: nSize, lineHeight: 1, letterSpacing: -4, color: p.accent }}>
        {number}
      </div>
      <div style={{ display: 'flex', fontFamily: 'Roboto Slab', fontWeight: 400, fontSize: 60, lineHeight: 1.15, marginTop: 12 }}>
        {f.label}
      </div>
      {f.body && <div style={{ display: 'flex', fontSize: 36, lineHeight: 1.4, color: p.muted, marginTop: 24 }}>{f.body}</div>}
    </div>
  );
}

function EventPost({ input, p }: { input: PostInput; p: Palette }) {
  const f = input.fields;
  const people = [1, 2]
    .map((n) => ({ name: f[`person${n}Name`], role: f[`person${n}Role`], photo: input.photos[`person${n}Photo`] }))
    .filter((person) => person.name);
  const pills = [f.date, f.time, f.location].filter(Boolean);

  return (
    <div style={{ display: 'flex', flexDirection: 'column', flexGrow: 1 }}>
      <div style={{ display: 'flex', fontFamily: 'Roboto', fontWeight: 700, fontSize: fit(f.title || '', [[30, 80]], 64), lineHeight: 1.1, letterSpacing: -1 }}>
        {f.title}
      </div>
      {f.body && <div style={{ display: 'flex', fontSize: 32, lineHeight: 1.4, color: p.muted, marginTop: 24 }}>{f.body}</div>}
      {pills.length > 0 && (
        <div style={{ display: 'flex', gap: 16, marginTop: 36, flexWrap: 'wrap' }}>
          {pills.map((pill) => (
            <div key={pill} style={{ display: 'flex', background: p.accentSoft, color: p.text, fontFamily: 'Roboto', fontWeight: 700, fontSize: 26, padding: '16px 28px', borderRadius: 999 }}>
              {pill}
            </div>
          ))}
        </div>
      )}
      <div style={{ display: 'flex', flexGrow: 1 }} />
      <div style={{ display: 'flex', alignItems: 'flex-end', justifyContent: 'space-between', gap: 24 }}>
        <div style={{ display: 'flex', gap: 36 }}>
          {people.map((person) => (
            <div key={person.name} style={{ display: 'flex', flexDirection: people.length > 1 ? 'column' : 'row', alignItems: 'center', gap: 18 }}>
              <Avatar src={person.photo} name={person.name} size={people.length > 1 ? 130 : 120} p={p} />
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: people.length > 1 ? 'center' : 'flex-start' }}>
                <div style={{ display: 'flex', fontFamily: 'Roboto', fontWeight: 700, fontSize: 28 }}>{person.name}</div>
                {person.role && <div style={{ display: 'flex', fontSize: 24, color: p.accent }}>{person.role}</div>}
              </div>
            </div>
          ))}
        </div>
        {f.badge && (
          <div
            style={{
              display: 'flex',
              background: `linear-gradient(90deg, ${BRAND.wave}, ${BRAND.cyan})`,
              color: BRAND.white,
              fontFamily: 'Roboto',
              fontWeight: 700,
              fontSize: 28,
              letterSpacing: 4,
              textTransform: 'uppercase',
              padding: '22px 36px',
              borderRadius: 16,
            }}
          >
            {f.badge}
          </div>
        )}
      </div>
    </div>
  );
}

export function renderPost(input: PostInput) {
  const p = PALETTES[input.theme];
  const body =
    input.template === 'review' ? (
      <Review input={input} p={p} />
    ) : input.template === 'quote' ? (
      <Quote input={input} p={p} />
    ) : input.template === 'stat' ? (
      <Stat input={input} p={p} />
    ) : input.template === 'event' ? (
      <EventPost input={input} p={p} />
    ) : (
      <Announcement input={input} p={p} tip={input.template === 'tip'} />
    );
  return (
    <Frame input={input} p={p}>
      {body}
    </Frame>
  );
}
