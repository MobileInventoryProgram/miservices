import { BLOB_BACK, BLOB_FRONT } from '@/lib/social/shapes';
import { BRAND, THEMES, brandLogo, type BrandTheme } from '@/lib/social/brand';

/**
 * Generated brand assets (banners, covers, avatar, email signature) in the
 * style of the miServices banner: brand-blue wave from the left, logo and an
 * approved headline on the right. Rendered to PNG with next/og.
 */

export type BrandAssetLayout = 'banner' | 'compact' | 'avatar' | 'email';

export interface BrandAssetSpec {
  key: string;
  label: string;
  channel: string;
  width: number;
  height: number;
  layout: BrandAssetLayout;
  tip: string;
}

export const BRAND_ASSETS: BrandAssetSpec[] = [
  {
    key: 'linkedin-banner',
    label: 'LinkedIn profile banner',
    channel: 'LinkedIn',
    width: 1584,
    height: 396,
    layout: 'banner',
    tip: 'Profile → edit (pencil) on your background photo. Your profile photo covers the bottom-left, so the text sits on the right.',
  },
  {
    key: 'linkedin-company',
    label: 'LinkedIn company page cover',
    channel: 'LinkedIn',
    width: 1128,
    height: 191,
    layout: 'compact',
    tip: 'Company page → Edit page → Header → Cover image.',
  },
  {
    key: 'facebook-cover',
    label: 'Facebook cover',
    channel: 'Facebook',
    width: 1640,
    height: 624,
    layout: 'banner',
    tip: 'Page → Edit cover photo. Mobile shows a narrower crop; the text is kept clear of the edges.',
  },
  {
    key: 'x-header',
    label: 'X (Twitter) header',
    channel: 'X',
    width: 1500,
    height: 500,
    layout: 'banner',
    tip: 'Profile → Edit profile → header image.',
  },
  {
    key: 'profile-picture',
    label: 'Profile picture',
    channel: 'All channels',
    width: 1080,
    height: 1080,
    layout: 'avatar',
    tip: 'Use as your page or profile picture on LinkedIn, Facebook, Instagram and X — it is designed to be cropped to a circle.',
  },
  {
    key: 'email-signature',
    label: 'Email signature banner',
    channel: 'Email',
    width: 1200,
    height: 240,
    layout: 'email',
    tip: 'Add to your email signature at 600 × 120 (this file is double resolution so it stays sharp).',
  },
];

export const BRAND_HEADLINE = 'We are the trusted nationwide inventory clerk network';
/** Always set on two balanced lines, as on the original banner */
const HEADLINE_LINES = ['We are the trusted nationwide', 'inventory clerk network'];
export const BRAND_SUBLINE =
  'Helping letting agents, landlords and property managers meet short deadlines with seamless inventory report delivery';

export interface BrandPersonalisation {
  territory: string;
  phone?: string;
}

function Blob({ theme, width, height, style }: { theme: BrandTheme; width: number; height: number; style?: React.CSSProperties }) {
  const t = THEMES[theme];
  return (
    <svg
      width={width}
      height={height}
      viewBox="0 0 100 100"
      preserveAspectRatio="none"
      style={{ position: 'absolute', left: 0, top: 0, ...style }}
    >
      <path d={BLOB_BACK} fill={t.blobBack} />
      <path d={BLOB_FRONT} fill={t.blob} />
    </svg>
  );
}

function Logo({ theme, height }: { theme: BrandTheme; height: number }) {
  const logo = brandLogo();
  const img = (
    // eslint-disable-next-line @next/next/no-img-element, jsx-a11y/alt-text
    <img src={logo.src} height={height} width={(height * logo.width) / logo.height} />
  );
  if (theme === 'light') return img;
  // The logo's grey and blue need a white tile on the navy theme
  return (
    <div style={{ display: 'flex', background: BRAND.white, borderRadius: height * 0.14, padding: height * 0.12 }}>
      {img}
    </div>
  );
}

export function renderBrandAsset(spec: BrandAssetSpec, theme: BrandTheme, personal: BrandPersonalisation | null) {
  const t = THEMES[theme];
  const { width: W, height: H } = spec;
  const localLine = personal ? [`miServices ${personal.territory}`, personal.phone].filter(Boolean).join('  ·  ') : null;

  if (spec.layout === 'avatar') {
    return (
      <div style={{ display: 'flex', width: W, height: H, background: theme === 'light' ? BRAND.white : BRAND.navy, alignItems: 'center', justifyContent: 'center', position: 'relative' }}>
        <svg width={W} height={H} viewBox="0 0 100 100" style={{ position: 'absolute', left: 0, top: 0 }}>
          <circle cx="50" cy="50" r="47" fill={theme === 'light' ? BRAND.paleBlue : BRAND.blue} />
        </svg>
        <div style={{ display: 'flex', background: BRAND.white, borderRadius: W, width: W * 0.7, height: W * 0.7, alignItems: 'center', justifyContent: 'center' }}>
          <Logo theme="light" height={H * 0.42} />
        </div>
      </div>
    );
  }

  if (spec.layout === 'email') {
    return (
      <div style={{ display: 'flex', width: W, height: H, background: t.background, alignItems: 'center', position: 'relative', fontFamily: 'PT Sans' }}>
        <svg width={W} height={H} viewBox="0 0 100 100" preserveAspectRatio="none" style={{ position: 'absolute', left: 0, top: 0 }}>
          <path d="M0 0 L22 0 C20 50 12 80 0 100 Z" fill={t.blobBack} />
          <path d="M0 0 L19 0 C17 46 10 76 0 92 Z" fill={t.blob} />
        </svg>
        <div style={{ display: 'flex', marginLeft: W * 0.24, marginRight: W * 0.04, alignItems: 'center', gap: W * 0.03, flex: 1 }}>
          <Logo theme={theme} height={H * 0.62} />
          {/* Text takes the space beside the logo; the headline is set on two lines so it never runs off the edge */}
          <div style={{ display: 'flex', flexDirection: 'column', flex: 1, minWidth: 0 }}>
            {localLine ? (
              <div style={{ fontFamily: 'Roboto', fontWeight: 700, fontSize: H * 0.17, lineHeight: 1.1, color: t.text }}>{`miServices ${personal!.territory}`}</div>
            ) : (
              ['The trusted nationwide', 'inventory clerk network'].map((line) => (
                <div key={line} style={{ fontFamily: 'Roboto', fontWeight: 700, fontSize: H * 0.145, lineHeight: 1.15, color: t.text }}>
                  {line}
                </div>
              ))
            )}
            <div style={{ fontSize: H * 0.11, color: t.muted, marginTop: H * 0.05 }}>
              {personal?.phone ? `${personal.phone}  ·  ${BRAND.website}` : BRAND.website}
            </div>
          </div>
        </div>
      </div>
    );
  }

  const compact = spec.layout === 'compact';
  // Very wide banners (LinkedIn, 4:1) get slightly larger type for their height
  const wide = W / H >= 3.5;
  const headlineSize = compact ? H * 0.2 : H * (wide ? 0.112 : 0.09);
  const sublineSize = H * (wide ? 0.05 : 0.045);
  const pad = compact ? W * 0.035 : W * 0.04;

  return (
    <div style={{ display: 'flex', width: W, height: H, background: t.background, position: 'relative', fontFamily: 'PT Sans' }}>
      <Blob theme={theme} width={compact ? W * 0.75 : wide ? W : W * 0.86} height={H} />
      <div
        style={{
          position: 'absolute',
          right: pad,
          top: 0,
          bottom: 0,
          width: compact ? W * 0.6 : W * 0.52,
          display: 'flex',
          flexDirection: compact ? 'row' : 'column',
          alignItems: compact ? 'center' : 'flex-end',
          justifyContent: compact ? 'flex-end' : 'center',
          gap: compact ? W * 0.025 : 0,
          textAlign: 'right',
        }}
      >
        <Logo theme={theme} height={compact ? H * 0.5 : H * (wide ? 0.24 : 0.26)} />
        <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
          <div
            style={{
              fontFamily: 'Roboto',
              fontWeight: 700,
              fontSize: headlineSize,
              lineHeight: 1.15,
              color: t.text,
              marginTop: compact ? 0 : H * 0.04,
              letterSpacing: -0.5,
              maxWidth: compact ? W * 0.45 : W * 0.5,
              display: 'flex',
              justifyContent: 'flex-end',
              textAlign: 'right',
            }}
          >
            <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end' }}>
              {HEADLINE_LINES.map((line) => (
                <span key={line}>{line}</span>
              ))}
            </div>
          </div>
          {!compact && (
            <div style={{ fontSize: sublineSize, lineHeight: 1.5, color: t.muted, marginTop: H * 0.045, maxWidth: W * (wide ? 0.36 : 0.4), display: 'flex', justifyContent: 'flex-end', textAlign: 'right' }}>
              {BRAND_SUBLINE}
            </div>
          )}
          {localLine && (
            <div
              style={{
                display: 'flex',
                marginTop: compact ? H * 0.06 : H * 0.05,
                background: t.chip,
                color: t.chipText,
                fontFamily: 'Roboto',
                fontWeight: 700,
                fontSize: compact ? H * 0.09 : H * 0.042,
                padding: compact ? `${H * 0.03}px ${H * 0.08}px` : `${H * 0.018}px ${H * 0.045}px`,
                borderRadius: 999,
              }}
            >
              {localLine}
            </div>
          )}
        </div>
      </div>
    </div>
  );
}
