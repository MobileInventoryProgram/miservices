/**
 * Social post templates: fixed designs where members only supply text and
 * photos. Character limits keep every post inside its layout.
 * Client-safe — shared by the creator form and the server renderer.
 */

export type PostSize = 'square' | 'portrait';
export type PostTheme = 'navy' | 'light';

export const POST_SIZES: Record<PostSize, { width: number; height: number; label: string }> = {
  square: { width: 1080, height: 1080, label: 'Square 1080 × 1080' },
  portrait: { width: 1080, height: 1350, label: 'Portrait 1080 × 1350' },
};

export type PostField =
  | { key: string; label: string; type: 'text' | 'textarea'; max: number; required?: boolean; placeholder?: string }
  | { key: string; label: string; type: 'stars' }
  | { key: string; label: string; type: 'photo'; shape: 'background' | 'circle'; hint?: string };

export interface PostTemplate {
  key: string;
  name: string;
  description: string;
  fields: PostField[];
  sample: Record<string, string>;
}

export const POST_TEMPLATES: PostTemplate[] = [
  {
    key: 'review',
    name: 'Client Review',
    description: 'Star rating and a client testimonial.',
    fields: [
      { key: 'stars', label: 'Rating', type: 'stars' },
      { key: 'review', label: 'Review', type: 'textarea', max: 320, required: true },
      { key: 'name', label: 'Client name', type: 'text', max: 40, required: true },
      { key: 'company', label: 'Company', type: 'text', max: 50 },
      { key: 'reviewerPhoto', label: 'Client photo or logo (optional)', type: 'photo', shape: 'circle' },
      { key: 'background', label: 'Background photo (optional)', type: 'photo', shape: 'background', hint: 'Fills the post behind a light or navy overlay. Drag to position it.' },
    ],
    sample: {
      stars: '5',
      review:
        'The team at miServices are fantastic. Reports are thorough, always on time, and the digital signatures make check-ins so much easier for our tenants. We would not use anyone else.',
      name: 'Sarah Jones',
      company: 'Example Lettings Ltd',
    },
  },
  {
    key: 'quote',
    name: 'Quote',
    description: 'A big, bold quote or insight with who said it.',
    fields: [
      { key: 'label', label: 'Label', type: 'text', max: 24, placeholder: 'e.g. Insight' },
      { key: 'quote', label: 'Quote', type: 'textarea', max: 180, required: true },
      { key: 'name', label: 'Name', type: 'text', max: 40 },
      { key: 'role', label: 'Role', type: 'text', max: 50 },
      { key: 'photo', label: 'Headshot (optional)', type: 'photo', shape: 'circle' },
      { key: 'background', label: 'Background photo (optional)', type: 'photo', shape: 'background', hint: 'Fills the post behind a light or navy overlay. Drag to position it.' },
    ],
    sample: {
      label: 'Insight',
      quote: 'A detailed inventory is the single best protection a landlord has at the end of a tenancy.',
      name: 'miServices',
      role: 'Nationwide inventory clerk network',
    },
  },
  {
    key: 'announcement',
    name: 'Announcement',
    description: 'News, a new hire, an award — over your photo.',
    fields: [
      { key: 'label', label: 'Label', type: 'text', max: 20, placeholder: 'e.g. News' },
      { key: 'headline', label: 'Headline', type: 'text', max: 70, required: true },
      { key: 'body', label: 'Text', type: 'textarea', max: 200 },
      { key: 'background', label: 'Background photo (optional)', type: 'photo', shape: 'background', hint: 'Fills the post behind a light or navy overlay. Drag to position it.' },
    ],
    sample: {
      label: 'News',
      headline: 'We are now covering the whole of Hertfordshire',
      body: 'Inventories, check-ins, check-outs and mid-term inspections — booked in days, delivered next day.',
    },
  },
  {
    key: 'stat',
    name: 'Big Number',
    description: 'A milestone or statistic that stands out.',
    fields: [
      { key: 'number', label: 'Number', type: 'text', max: 8, required: true, placeholder: 'e.g. 500+' },
      { key: 'label', label: 'What it counts', type: 'text', max: 40, required: true },
      { key: 'body', label: 'Supporting text', type: 'textarea', max: 140 },
      { key: 'background', label: 'Background photo (optional)', type: 'photo', shape: 'background', hint: 'Fills the post behind a light or navy overlay. Drag to position it.' },
    ],
    sample: {
      number: '500+',
      label: 'inventories completed this year',
      body: 'That is 500 times a letting agent trusted us to document a property professionally.',
    },
  },
  {
    key: 'event',
    name: 'Event',
    description: 'Conferences, open days and networking events.',
    fields: [
      { key: 'title', label: 'Event name', type: 'text', max: 60, required: true },
      { key: 'body', label: 'Description', type: 'textarea', max: 160 },
      { key: 'date', label: 'Date', type: 'text', max: 24 },
      { key: 'time', label: 'Time', type: 'text', max: 20 },
      { key: 'location', label: 'Location', type: 'text', max: 32 },
      { key: 'badge', label: 'Countdown badge', type: 'text', max: 20, placeholder: 'e.g. 2 weeks to go' },
      { key: 'person1Name', label: 'Person 1 name', type: 'text', max: 30 },
      { key: 'person1Role', label: 'Person 1 role', type: 'text', max: 40 },
      { key: 'person1Photo', label: 'Person 1 photo', type: 'photo', shape: 'circle' },
      { key: 'person2Name', label: 'Person 2 name', type: 'text', max: 30 },
      { key: 'person2Role', label: 'Person 2 role', type: 'text', max: 40 },
      { key: 'person2Photo', label: 'Person 2 photo', type: 'photo', shape: 'circle' },
      { key: 'background', label: 'Background photo (optional)', type: 'photo', shape: 'background', hint: 'Fills the post behind a light or navy overlay. Drag to position it.' },
    ],
    sample: {
      title: 'Hertfordshire Lettings Conference',
      body: 'Come and say hello — we will be talking inventories, deposit disputes and the Renters’ Rights Act.',
      date: '6th October 2026',
      time: '8:30 – 16:00',
      location: 'Stevenage',
      badge: '2 weeks to go',
      person1Name: 'Shane Osman',
      person1Role: 'miServices Herts',
    },
  },
  {
    key: 'tip',
    name: 'Tip',
    description: 'A handy tip or "did you know?" over your photo.',
    fields: [
      { key: 'label', label: 'Label', type: 'text', max: 20, placeholder: 'e.g. Tip #3' },
      { key: 'headline', label: 'Headline', type: 'text', max: 80, required: true },
      { key: 'body', label: 'Text', type: 'textarea', max: 220 },
      { key: 'background', label: 'Background photo (optional)', type: 'photo', shape: 'background', hint: 'Fills the post behind a light or navy overlay. Drag to position it.' },
    ],
    sample: {
      label: 'Did you know?',
      headline: 'Photograph every meter reading at check-in',
      body: 'Dated meter photos in the inventory settle final bills quickly and stop disputes before they start.',
    },
  },
];

export function getPostTemplate(key: string): PostTemplate | undefined {
  return POST_TEMPLATES.find((t) => t.key === key);
}

/** Clamp submitted values to each field's limit; unknown keys are dropped */
export function cleanPostFields(template: PostTemplate, fields: Record<string, unknown>): Record<string, string> {
  const clean: Record<string, string> = {};
  for (const field of template.fields) {
    const value = fields[field.key];
    if (field.type === 'photo') continue;
    if (field.type === 'stars') {
      const stars = Math.round(Number(value));
      clean[field.key] = String(Number.isFinite(stars) ? Math.min(5, Math.max(1, stars)) : 5);
      continue;
    }
    clean[field.key] = typeof value === 'string' ? value.trim().slice(0, field.max) : '';
  }
  return clean;
}
