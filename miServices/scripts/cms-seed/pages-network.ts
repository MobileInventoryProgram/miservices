import { blocks, feature, hero, link, seo } from './helpers';

/** Copied from the previous hardcoded app/our-network pages (Head Office details now Chester / Site Settings, as agreed) */
export default [
  {
    _id: 'ourNetworkPage',
    _type: 'ourNetworkPage',
    hero: hero(
      'Our Network',
      'Find your local miServices operative across the UK. Our network of experienced professionals is ready to provide comprehensive property inspection services in your area.'
    ),
    searchPlaceholder: 'Search by postcode, area, town, or territory...',
    noResults: { heading: 'No franchisees found in that area', text: 'No franchisees match "{search}". Please contact our Head Office for assistance.' },
    headOffice: { initials: 'HO', name: 'miServices - Head Office', tagline: 'National Coverage Support', basedIn: 'Chester, Cheshire', button: link('Contact Head Office', '/contact') },
    profileHero: {
      heading: 'Property Inventory Services in {territory}',
      subheading: 'Professional inventory reports, check-ins, check-outs and property inspections from your local miServices team.',
      primaryButton: link('Book a Service', '/booking'),
      secondaryButton: link('Get a Quote', '/contact'),
    },
    profileIntro: {
      heading: 'Professional Inventory Services in {territory}',
      defaultText: blocks(
        'Looking for a reliable property inventory clerk in {territory}? miServices provides professional property reporting services to letting agents, landlords and property managers across {territory} and the surrounding areas.',
        'Our locally based team delivers comprehensive inventory reports, check-in and check-out inspections, mid-tenancy visits and block management reporting. Every report is produced using our proprietary miProgram software, ensuring consistent, high-quality documentation with detailed photography.',
        'Whether you manage a single property or a large portfolio in {territory}, miServices provides the reliable, professional inspection service you need to protect your investment and meet compliance requirements.'
      ),
    },
    profileServices: {
      heading: 'Our Services in {territory}',
      items: [
        feature(undefined, 'Inventory Reports', 'Comprehensive property documentation with photography', '/services/inventory-reports'),
        feature(undefined, 'Check-In Services', 'Professional tenant move-in inspections', '/services/check-ins'),
        feature(undefined, 'Check-Out Services', 'End of tenancy condition assessments', '/services/check-outs'),
        feature(undefined, 'Mid-Tenancy Inspections', 'Regular property condition monitoring', '/services/mid-tenancy'),
        feature(undefined, 'Property Visits', 'Routine property checks and reporting', '/services/property-visits'),
        feature(undefined, 'Block Management', 'Multi-unit and communal area inspections', '/services/block-management'),
      ],
    },
    profileAreas: {
      areasHeading: 'Areas We Cover in {territory}',
      areasText: 'Our property inventory services are available across the following locations:',
      postcodesHeading: 'Postcodes We Cover',
      postcodesText: 'We provide professional property inspection services across all the following postcodes:',
    },
    profileWhy: {
      heading: 'Why Choose miServices in {territory}',
      items: [
        feature('award', 'Quality Assured', 'Every report meets rigorous quality standards with comprehensive photography'),
        feature('clock', 'Fast Turnaround', 'Reports delivered promptly, typically within 24 hours'),
        feature('shield', 'Deposit Protection', 'Reports accepted by all major deposit protection schemes'),
        feature('user', 'Local Expertise', 'Your dedicated {territory} team with local knowledge'),
      ],
    },
    profileCta: {
      heading: 'Book a Property Inventory in {territory}',
      text: 'Get professional property inventory services from your local miServices team. Fast turnaround, consistent quality, nationwide standards.',
      primaryButton: link('Book a Service', '/booking'),
      secondaryButton: link('Request a Quote', '/contact'),
    },
    profileSeo: {
      title: 'Property Inventory Services {territory} | miServices',
      description: 'Professional property inventory services in {territory}. Inventory reports, check-ins, check-outs & inspections. Book your local miServices clerk in {towns}.',
    },
    seo: seo(
      'Our Network | Find Your Local Inventory Clerk | miServices',
      'Find your local miServices inventory clerk across the UK. Search by postcode, town or territory to connect with your nearest property inspection professional.'
    ),
  },
];
