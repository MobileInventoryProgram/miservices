import { DEFAULT_FLYER_SETTINGS } from '../../lib/flyer/data';
import { DEFAULT_QUOTE_TEMPLATE } from '../../lib/quote/template';

/**
 * The quote template and flyer settings, which had never been saved to the
 * CMS (the site was using these built-in defaults). Now editable in Studio.
 */
export default [
  {
    _id: 'flyerSettings',
    _type: 'flyerSettings',
    ...DEFAULT_FLYER_SETTINGS,
    sellingPoints: DEFAULT_FLYER_SETTINGS.sellingPoints.map((p, i) => ({ _key: `point-${i + 1}`, ...p })),
  },
  {
    _id: 'quoteTemplate',
    _type: 'quoteTemplate',
    ...DEFAULT_QUOTE_TEMPLATE,
    miProgram: { ...DEFAULT_QUOTE_TEMPLATE.miProgram, tiers: DEFAULT_QUOTE_TEMPLATE.miProgram.tiers.map((t) => ({ _key: `tier-${t.upTo}`, ...t })) },
    sections: DEFAULT_QUOTE_TEMPLATE.sections.map((s) => ({ _key: s.key, ...s })),
  },
];
