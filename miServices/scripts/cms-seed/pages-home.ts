import { cta, feature, hero, img, link, seo, stat } from './helpers';

/** Copied from the previous hardcoded app/page.tsx and components/AnimatedStats.tsx ("60+" → "65+" as agreed) */
export default [
  {
    _id: 'homePage',
    _type: 'homePage',
    hero: hero(
      'We are the trusted nationwide inventory clerk network',
      'Mobile Inventory Services (miServices) helps letting agents, landlords and property managers meet short deadlines with seamless inventory report delivery using innovative tech',
      {
        primaryButton: link('Enquire Now', '/contact'),
        secondaryButton: link('Find Your Nearest Operative', '/our-network'),
        image: { ...img('/stock_images/modern_luxury_kitche_2302410a.jpg', 'Modern Kitchen Interior'), _type: 'imageWithAlt' },
      }
    ),
    statsSection: {
      heading: 'We take pride in our numbers',
      stats: [
        stat('15+', 'Years of experience'),
        stat('700+', 'Letting agents served'),
        stat('150k+', 'Reports created'),
        stat('150k+', 'Properties surveyed'),
        stat('65+', 'Franchise locations'),
      ],
    },
    whySection: {
      heading: 'Why Choose miServices',
      items: [
        feature('award', 'Quality Assured', 'Every inspection meets our rigorous quality standards with comprehensive photography and detailed documentation.'),
        feature('mapPin', 'Nationwide Coverage', 'Our extensive network of 65+ franchise locations covers every corner of the UK with local expertise.'),
        feature('clock', 'Fast Turnaround', 'Professional reports delivered promptly to meet your deadlines with innovative technology solutions.'),
      ],
    },
    servicesSection: {
      heading: 'Our Services',
      cards: [
        feature('fileText', 'Inventory Reports', 'Comprehensive property inventory documentation with detailed photography and descriptions.', '/services/inventory-reports'),
        feature('checkCircle', 'Check-in Services', 'Professional property check-in services ensuring smooth tenant move-ins.', '/services/check-ins'),
        feature('checkCircle', 'Check-out Services', 'Detailed check-out inspections to protect your property investment.', '/services/check-outs'),
        feature('mapPin', 'Property Visits', 'Regular property inspections to maintain standards and identify issues early.', '/services/property-visits'),
        feature('home', 'Block Management', 'Comprehensive block management services for multi-unit properties.', '/services/block-management'),
        feature('clipboard', 'Sample Documents', 'View our professional sample reports and documentation.', '/sample-documents'),
      ],
    },
    clientsSection: {
      heading: 'Trusted by Leading Property Companies',
      text: "We work with some of the UK's most respected lettings agents and property management companies",
      logos: [
        ['/client_logos/countrywide.png', 'Countrywide'],
        ['/client_logos/openrent.png', 'OpenRent'],
        ['/client_logos/leaders.png', 'Leaders'],
        ['/client_logos/martin-co.png', 'Martin & Co'],
      ].map(([src, alt]) => ({ ...img(src, alt), _type: 'imageWithAlt' })),
    },
    audiencesSection: {
      heading: 'Who We Work With',
      cards: [
        feature('users', 'Lettings Agents', 'Streamline your property management with our professional inspection services tailored for letting agencies.', '/lettings-agents'),
        feature('shield', 'Property Managers', 'Comprehensive property inspection solutions for your entire portfolio with consistent quality standards.', '/property-managers'),
        feature('home', 'Landlords', 'Protect your investment with detailed property inspections and professional documentation.', '/landlords'),
      ],
    },
    locationsSection: {
      heading: 'Find Your Local Inventory Clerk',
      text: 'We provide professional property inventory services across the UK. Select your area to learn more.',
      locations: [
        ['London Central', 'london-central'],
        ['London South East', 'london-south-east'],
        ['South Manchester', 'south-manchester'],
        ['Birmingham', 'birmingham'],
        ['Bristol', 'bristol'],
        ['Sheffield', 'sheffield'],
        ['West Yorkshire', 'west-yorkshire'],
        ['Brighton', 'brighton'],
        ['Glasgow Central', 'glasgow-central'],
        ['Essex', 'essex'],
        ['Reading', 'reading'],
        ['Lancashire', 'lancashire'],
      ].map(([label, slug]) => ({ _type: 'locationLink', label, franchisee: { __franchiseeSlug: slug } })),
      allLink: link('View all locations →', '/our-network'),
    },
    franchiseSection: {
      heading: 'Build a Business in the UK Property Sector',
      text: "Join our successful franchise network and become part of the UK's leading property inspection service. Benefit from our established brand, proven business model, and comprehensive support system.",
      stats: [stat('26', 'Successful Franchisees'), stat('65+', 'Territories'), stat('100%', 'Support & Training')],
    },
    cta: cta('Ready to Get Started?', 'Find your nearest operative or explore franchise opportunities', link('Find Your Nearest Operative', '/our-network'), link('Explore Franchise Opportunities', '/franchise')),
    seo: seo(
      'Property Inventory Services UK | miServices',
      'Professional property inventory services across the UK. Inventory reports, check-ins, check-outs, mid-tenancy inspections and more. Find your local inventory clerk.'
    ),
  },
];
