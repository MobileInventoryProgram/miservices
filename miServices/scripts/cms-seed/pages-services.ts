import { cta, hero, link, seo } from './helpers';

export default [
  {
    _id: 'servicesPage',
    _type: 'servicesPage',
    hero: hero('Our Services', 'Professional property inspection and inventory services delivered by our nationwide network of trained operatives.'),
    cta: cta('Ready to Get Started?', 'Book your property inspection service today or find your local operative', link('Book a Service', '/booking'), link('Find Your Local Operative', '/our-network')),
    seo: seo(
      'Our Services | Property Inventory & Inspection Services | miServices',
      'Professional property inspection and inventory services for landlords, letting agents, and property managers across the UK. Inventory reports, check-ins, check-outs, mid-tenancy visits and more.',
      'property inspection, inventory services, check-in, check-out, mid-tenancy, pre-tenancy, property visits'
    ),
  },
];
