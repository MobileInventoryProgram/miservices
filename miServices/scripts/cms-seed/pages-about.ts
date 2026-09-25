import { blocks, cta, feature, hero, img, link, seo, stat } from './helpers';

/** Copied from the previous hardcoded app/about/page.tsx and components/about/* */
export default [
  {
    _id: 'aboutPage',
    _type: 'aboutPage',
    hero: hero('About miServices', 'Empowering efficiency. Elevating professionalism. Redefining property reporting.'),
    intro: {
      heading: 'Welcome to miServices',
      text: blocks(
        "Welcome to miServices — a national network built on innovation, reliability, and a relentless commitment to raising industry standards. Since 2009, we've transformed traditional inventory management and property reporting into a modern, technology-driven service trusted by letting agents, property managers and landlords across the UK.",
        "What started as a simple idea to streamline inventory processes has grown into one of the UK's largest professional reporting networks, delivering thousands of high-quality reports every month."
      ),
      image: { ...img('/stock_images/professional_propert_9156a3d3.jpg', 'miServices professional office team'), _type: 'imageWithAlt' },
    },
    quote: '"We introduced technology to modernise the inventory process — improving accessibility, consistency, and efficiency overnight."',
    story: {
      heading: 'Our Story — From a Single Idea to a National Network',
      text: 'In 2009, we recognised a growing challenge across the UK lettings industry: property reporting was inconsistent, inefficient, and time-consuming.',
      milestones: [
        { _type: 'milestone', year: '2009', title: 'Founded', description: 'miServices was established to modernise the UK property reporting industry with technology-driven solutions.' },
        { _type: 'milestone', title: 'Expansion of Outsourced Services', description: 'As demand grew, we expanded our services to provide professional inventory clerks nationwide.' },
        { _type: 'milestone', title: 'Launch of Franchise Network', description: 'We introduced a franchise model to deliver local expertise with national consistency.' },
        { _type: 'milestone', title: '65+ Territories', description: 'Our network expanded to cover over 65 territories across the UK.' },
        { _type: 'milestone', title: '700+ Letting Agents Served', description: 'We now proudly support over 700 letting agents with professional property reporting.' },
        { _type: 'milestone', title: '30+ Staff', description: 'Our head office team has grown to 30+ dedicated professionals providing nationwide support.' },
      ],
    },
    team: {
      heading: 'A National Team With Local Expertise',
      text: 'What makes miServices different is the people behind it.',
      stats: [stat('100+', 'Professional Inventory Clerks'), stat('30+', 'Head Office Staff'), stat('2', 'Central Hubs'), stat('65+', 'Territories')],
      footnote: 'This hybrid structure gives us the strength of a national brand with the reliability and local proximity customers expect.',
    },
    whatWeDo: {
      heading: 'What We Do',
      text: 'We specialise in professional property reporting services, using standardised documentation, digital reporting tools, and a nationwide team to ensure total consistency.',
      items: [
        feature('fileText', 'Inventory Reporting', 'Comprehensive property inventory reports with detailed documentation and professional photography.'),
        feature('checkCircle', 'Check-In & Check-Out Inspections', 'Thorough inspections at the start and end of tenancies to protect landlords and agents.'),
        feature('clipboard', 'Mid-Term Property Visits', 'Regular property inspections to monitor condition and identify maintenance issues early.'),
        feature('users', 'Block Management Inspections', 'Comprehensive inspection services for multi-unit properties and apartment blocks.'),
        feature('award', 'Standardised Documentation', 'Consistent, high-quality reports using digital tools and industry-leading processes.'),
        feature('mapPin', 'Nationwide Coverage', 'Operating in 65+ territories across the UK with local expertise and national support.'),
      ],
    },
    promoCards: [
      {
        _type: 'promoCard',
        heading: 'Build Your Business with miServices',
        text: "Join the UK's leading property reporting franchise network. Low startup costs, comprehensive training, proven systems, and nationwide support to help you build a profitable business in the growing rental sector.",
        button: link('Discover Franchise Opportunities', '/franchise'),
      },
      {
        _type: 'promoCard',
        heading: 'Nationwide Coverage',
        text: 'Our network of professional operatives covers the entire UK. Each franchise is independently owned and operated, providing local expertise with national quality standards.',
        button: link('Find Your Nearest Operative', '/our-network'),
      },
    ],
    network: {
      heading: 'A Growing Franchise Network',
      text: blocks(
        'Each miServices territory is locally operated by trained professionals who follow our processes, QA standards, and service blueprint. This gives customers the best of both worlds: local care, national support, consistent documentation, and reliable scheduling.',
        'Our franchise team continues to expand, creating new opportunities across the UK.'
      ),
      image: { ...img('/stock_images/apartment_building_e_86a30c47.jpg', 'miServices franchise network across the UK'), _type: 'imageWithAlt' },
      primaryButton: link('Explore Our Network', '/our-network'),
      // Previously linked to /contact; the franchise page is the right destination
      secondaryButton: link('Become a Franchisee', '/franchise'),
    },
    lookingAhead: {
      heading: 'Looking Ahead',
      lead: 'Our mission remains the same as it was in 2009:',
      mission: 'To make property reporting faster, smarter, and more reliable for everyone involved in the rental process.',
      text: 'With expanding technology, stronger networks, and constant improvements in service quality, miServices is committed to leading the industry forward.',
    },
    cta: cta('Need Reliable Property Reporting?', 'Book a service or contact our team today.', link('Book a Service', '/booking'), link('Contact Us', '/contact')),
    seo: seo(
      'About miServices | Property Reporting, Inventory & Inspection Specialists',
      'Discover the story behind miServices. Established in 2009, now operating in 65+ territories, supporting over 700 letting agents with professional property reporting and inventory services.'
    ),
  },
];
