import { link, menuLink } from './helpers';

/** Copied from the previous hardcoded Header.tsx / Footer.tsx; service links now go straight to /services/... */
export default [
  {
    _id: 'siteSettings',
    _type: 'siteSettings',
    siteName: 'miServices',
    legalName: 'Mobile Inventory Services Ltd',
    companyNumber: '07884266',
    phone: '0345 680 7976',
    email: 'enquiries@miprogram.co.uk',
    address: ['Third Floor', 'Suite A3 (3)', 'Steam Mill', '3 Steam Mill St', 'Chester', 'CH3 5AN'],
    discoveryCall: {
      title: 'Book Your Discovery Call',
      calendarUrl: 'https://calendar.google.com/calendar/appointments/schedules/AcZssZ2HuLzA6AfyePjTnxsKE8YsTBoSal6b24iA3HCqTOQ6aeq1hAXvhCseREj64u6Q6w_9KFNf8wzz?gv=true',
    },
    social: { linkedin: 'https://www.linkedin.com/company/mobile-inventory-services', facebook: 'https://www.facebook.com/miservicesuk' },

    servicesMenuLabel: 'Services',
    servicesMenu: [
      {
        _type: 'menuGroup',
        title: 'Our Services',
        links: [
          menuLink('Inventory Reports', 'Complete property documentation', '/services/inventory-reports', 'fileText'),
          menuLink('Check-in', 'Tenant move-in services', '/services/check-ins', 'checkCircle'),
          menuLink('Check-out', 'End of tenancy inspections', '/services/check-outs', 'checkCircle'),
          menuLink('Property Visits', 'Regular property inspections', '/services/property-visits', 'mapPin'),
          menuLink('Block Management', 'Multi-unit property services', '/services/block-management', 'home'),
        ],
      },
      {
        _type: 'menuGroup',
        title: 'Tenancy Journey',
        numbered: true,
        links: [
          menuLink('Pre-Tenancy', 'Initial property setup', '/services/pre-tenancy'),
          menuLink('Mid-Tenancy', 'Ongoing inspections', '/services/mid-tenancy'),
          menuLink('End-Tenancy', 'Final checkout process', '/services/end-tenancy'),
        ],
      },
      {
        _type: 'menuGroup',
        title: 'Who We Work With',
        links: [
          menuLink('Lettings Agents', 'Streamline your workflow', '/lettings-agents', 'briefcase'),
          menuLink('Property Managers', 'Portfolio solutions', '/property-managers', 'users'),
          menuLink('Landlords', 'Protect your investment', '/landlords', 'home'),
        ],
      },
    ],
    networkMenuLabel: 'Our Network',
    networkLocal: {
      eyebrow: 'Find Your Local Operative',
      heading: 'Nationwide Coverage',
      text: 'Our network of professional operatives covers the entire UK. Each franchise is independently owned and operated, providing local expertise with national quality standards.',
      button: link('Find Your Nearest Operative', '/our-network'),
    },
    networkFranchise: {
      eyebrow: 'Franchise Opportunities',
      heading: 'Build Your Own Business',
      text: "Join the UK's trusted property inspection network. Low startup costs from £995, full training, and ongoing support.",
      button: link('Explore Franchise Opportunities', '/franchise'),
    },
    moreMenuLabel: 'More',
    moreMenu: [
      {
        _type: 'menuGroup',
        title: 'Company',
        links: [
          menuLink('Contact Us', 'Get in touch with us today', '/contact', 'phone'),
          menuLink('About Us', 'Our mission and values', '/about', 'briefcase'),
          menuLink('Our Team', 'Meet the experts', '/our-team', 'users'),
          menuLink('Franchise', 'Business opportunities', '/franchise', 'briefcase'),
          menuLink('Booking', 'Schedule a service', '/booking', 'calendar'),
        ],
      },
      {
        _type: 'menuGroup',
        title: 'Resources',
        links: [
          menuLink('Sample Documents', 'View report samples', '/sample-documents', 'fileText'),
          menuLink('News', 'Latest updates and insights', '/news', 'book'),
          menuLink('Pricing', 'Transparent pricing', '/pricing', 'pound'),
          menuLink('FAQ', 'Common questions', '/faq', 'helpCircle'),
        ],
      },
      {
        _type: 'menuGroup',
        title: 'Legals',
        links: [
          menuLink('Privacy Policy', 'How we protect your data', '/privacy-policy', 'shield'),
          menuLink('Terms & Conditions', 'Our terms of service', '/terms', 'fileText'),
        ],
      },
    ],
    headerButtons: [link('Contact', '/contact'), link('Booking', '/booking')],

    footerTagline: "The UK's trusted nationwide inventory clerk network, providing professional property inspection services.",
    footerColumns: [
      {
        _type: 'footerColumn',
        title: 'Services',
        links: [
          link('Inventory Reports', '/services/inventory-reports'),
          link('Check-in Services', '/services/check-ins'),
          link('Check-out Services', '/services/check-outs'),
          link('Property Visits', '/services/property-visits'),
          link('Block Management', '/services/block-management'),
        ],
      },
      {
        _type: 'footerColumn',
        title: 'Company',
        links: [
          link('About Us', '/about'),
          link('Our Network', '/our-network'),
          link('Franchise Opportunities', '/franchise'),
          link('Careers', '/careers'),
          link('News', '/news'),
          link('Contact Us', '/contact'),
        ],
      },
    ],
    footerContactHeading: 'Contact',
    footerCoverageLink: link('Nationwide Coverage', '/our-network'),
    footerContactButton: link('Get in Touch', '/contact'),
    footerLocationsHeading: 'Property Inventory Services by Location',
    // Resolved to franchise references by slug when seeding
    footerLocations: [
      ['London Central', 'london-central'],
      ['London SE', 'london-south-east'],
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
    ].map(([label, slug]) => ({ _type: 'footerLocation', label, franchisee: { __franchiseeSlug: slug } })),
    copyright: 'miServices. All rights reserved.',
    legalLinks: [link('Privacy Policy', '/privacy-policy'), link('Terms & Conditions', '/terms'), link('Franchise Login', '/members/login')],

    defaultTitle: 'miServices - Professional Property Inventory Services UK',
    titleSuffix: ' | miServices',
    defaultDescription:
      'Professional property inventory services across the UK. Inventory reports, check-ins, check-outs, mid-tenancy inspections and more from the UK\'s trusted inventory clerk network.',
    defaultKeywords: 'property inventory, inventory reports, check-in, check-out, property inspection, inventory clerk, letting agent services',
  },
];
