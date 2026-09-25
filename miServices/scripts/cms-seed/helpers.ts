/** Helpers for the website content migration (scripts/cms-seed) */

/** A local image in public/ to upload to the CMS */
export const img = (path: string, alt = '') => ({ __upload: path, alt });

export const link = (label: string, href: string) => ({ _type: 'link', label, href });
export const menuLink = (label: string, description: string, href: string, icon?: string) => ({ _type: 'menuLink', label, description, href, ...(icon ? { icon } : {}) });
export const feature = (icon: string | undefined, title: string, description = '', href?: string) => ({
  _type: 'featureItem',
  ...(icon ? { icon } : {}),
  title,
  ...(description ? { description } : {}),
  ...(href ? { href } : {}),
});
export const stat = (value: string, label: string, icon?: string) => ({ _type: 'stat', value, label, ...(icon ? { icon } : {}) });
export const faq = (question: string, answer: string) => ({ _type: 'faq', question, answer });
export const step = (title: string, description = '') => ({ _type: 'step', title, ...(description ? { description } : {}) });
export const cta = (heading: string, text: string, primary?: ReturnType<typeof link>, secondary?: ReturnType<typeof link>) => ({
  _type: 'cta',
  heading,
  text,
  ...(primary ? { primaryButton: primary } : {}),
  ...(secondary ? { secondaryButton: secondary } : {}),
});
export const hero = (heading: string, subheading = '', extra: Record<string, unknown> = {}) => ({ _type: 'hero', heading, ...(subheading ? { subheading } : {}), ...extra });
export const seo = (metaTitle: string, metaDescription: string, keywords?: string) => ({ _type: 'seo', metaTitle, metaDescription, ...(keywords ? { keywords } : {}) });

let n = 0;
const key = () => `k${(++n).toString(36)}${Math.random().toString(36).slice(2, 7)}`;

/** Paragraphs → rich text blocks. "## text" makes a subheading, "- " lines make bullets. */
export function blocks(...paragraphs: string[]) {
  return paragraphs.flatMap((p) => {
    if (p.startsWith('## ')) return [{ _type: 'block', _key: key(), style: 'h3', markDefs: [], children: [{ _type: 'span', _key: key(), text: p.slice(3), marks: [] }] }];
    if (p.split('\n').every((l) => l.startsWith('- ')))
      return p.split('\n').map((l) => ({ _type: 'block', _key: key(), style: 'normal', listItem: 'bullet', level: 1, markDefs: [], children: [{ _type: 'span', _key: key(), text: l.slice(2), marks: [] }] }));
    return [{ _type: 'block', _key: key(), style: 'normal', markDefs: [], children: [{ _type: 'span', _key: key(), text: p, marks: [] }] }];
  });
}
