import { blocks, cta, faq, feature, img, link, step } from './helpers';
import { LEGACY_SERVICES } from './services-legacy';

/**
 * Service pages: fills the new service fields from the content that was
 * hardcoded in app/services/[slug]/page.tsx. Existing service documents are
 * patched in place (matched by slug, including the old capitalised slugs).
 */
const ALIASES: Record<string, string[]> = { 'pre-tenancy': ['Pre-Tenancy'], 'check-outs': ['Check-Outs'] };

export default Object.entries(LEGACY_SERVICES).map(([slug, c]) => {
  const fields: Record<string, unknown> = {
    featuresHeading: c.featuresHeading,
    features: c.features.map((f) => feature(f.icon, f.text)),
    benefitsHeading: c.benefitsHeading,
    benefits: c.benefits.map((b) => feature(b.icon, b.title, b.description)),
    relatedHeading: 'Related Services',
    relatedServices: c.relatedServices.map((r) => feature(undefined, r.title, r.description, `/services/${r.slug}`)),
    cta: cta(c.ctaHeading, c.ctaDescription, link(c.ctaButtonText, '/booking'), link(c.ctaSecondaryText || 'Find Your Local Operative', c.ctaSecondaryHref || '/our-network')),
    ...(c.processSteps ? { processHeading: 'How It Works', processSteps: c.processSteps.map((s) => step(s.title, s.description)) } : {}),
    ...(c.faqs ? { faqHeading: 'Frequently Asked Questions', faqs: c.faqs.map((f) => faq(f.question, f.answer)) } : {}),
    ...(c.whoUsesThis ? { whoUsesHeading: 'Who Uses This Service', whoUsesThis: c.whoUsesThis.map((w) => feature(undefined, w.title, w.description, w.href)) } : {}),
  };
  // The intro that was actually shown on the site (the CMS body fields were hidden behind it)
  const intro = c.prose
    ? {
        bodyHeading: c.prose.heading,
        bodyIntro: c.prose.intro,
        bodyText: blocks(...c.prose.paragraphs),
        ...(c.prose.image ? { bodyImage: { ...img(c.prose.image.src, c.prose.image.alt), _type: 'imageWithAlt' } } : {}),
      }
    : {};
  return {
    __patch: { type: 'service', slugs: [slug, ...(ALIASES[slug] || [])] },
    _id: `service-${slug}`,
    _type: 'service',
    // Always applied: lower-case slug (capitalised slugs 404'd)
    fix: { slug: { _type: 'slug', current: slug } },
    // Applied where empty (never overwrites Studio edits)…
    setIfMissing: fields,
    // …and on the first migration (--force): the intro that was visible, and no stray subheading above it
    set: intro,
    unset: c.prose ? ['bodySubheading'] : [],
  };
});
