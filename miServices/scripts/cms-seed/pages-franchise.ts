import { blocks, link, seo } from './helpers';

/** Copied from the previous hardcoded app/franchise/page.tsx (the placeholder YouTube video is left empty) */
const benefits = [
    {
      icon: 'award',
      title: 'A Proven Business Model',
      description: 'Over a decade of success delivering property reports for letting agents, landlords, student accommodation providers and block management companies.',
    },
    {
      icon: 'trendingUp',
      title: 'A Growing Industry',
      description: 'The rental sector continues to expand — and compliance requirements with it. Agents rely on consistent, professional reporting more than ever.',
    },
    {
      icon: 'home',
      title: 'Low Overheads, High Potential',
      description: 'Work from home, operate flexibly, and scale at your own pace. No office required.',
    },
    {
      icon: 'smartphone',
      title: 'Powerful Technology',
      description: 'Our integrated software (miProgram) enables fast, accurate and standardised reporting from day one.',
    },
    {
      icon: 'bookOpen',
      title: 'Full Training & Ongoing Support',
      description: 'We train you in inventory reporting, check-in & check-out inspections, property visits, customer service, sales & business growth, and operational processes.',
    },
    {
      icon: 'users',
      title: 'A Network that Works Together',
      description: 'Benefit from referrals, centralised marketing, proven workflows, and a supportive peer community.',
    },
  ];
const clients = [
    'Letting agents',
    'Property managers',
    'Portfolio landlords',
    'Student accommodation providers',
    'Build-to-rent operators',
    'Block management companies',
  ];
const included = [
    'All training',
    'Business setup guidance',
    'Branding',
    'Operational processes',
    'Marketing material',
    'Ongoing network support',
    'Priority access to centrally managed work',
    'Head Office backup during busy periods and holidays',
    'Dedicated booking team at your disposal',
    'Full admin management support (if required)',
  ];
const steps = [
    {
      number: '1',
      title: 'Initial Call',
      description: 'We discuss your background, goals, and territory availability.',
    },
    {
      number: '2',
      title: 'Face-to-Face or Video Meeting',
      description: 'Dive deeper into the business model, earnings, workload and support.',
    },
    {
      number: '3',
      title: 'Speak to Real Franchisees',
      description: 'Get honest, first-hand experiences from our network.',
    },
    {
      number: '4',
      title: 'Pre-Contract Disclosure',
      description: 'We outline expectations, commitments, and operational responsibilities.',
    },
    {
      number: '5',
      title: 'Decision Time',
      description: 'Take your time. If we\'re the right match for each other, we\'ll welcome you into the miServices network.',
    },
  ];
const testimonials = [
    {
      name: 'Richard Fellows',
      location: 'Twickenham',
      quote: 'As the new franchise owner for miServices Twickenham, I found the onboarding process streamlined and professional. The training was well-structured, giving me the knowledge, skills, and confidence I needed. I\'m excited to continue building local connections and growing my franchise.',
    },
    {
      name: 'Shane Osman',
      location: 'Hertfordshire, Bedfordshire & Watford',
      quote: 'The miServices franchise suited my budget, and I was drawn to the low overheads and simple business model. We\'ve grown our turnover from four figures to six figures annually over the last four years.',
    },
    {
      name: 'Alex Spedding',
      location: 'West Midlands',
      quote: 'After growing to the point where we needed staff, Head Office guided us through the recruitment process. They helped with legal documents, tailored support, and online training — all of which were invaluable to our continued growth.',
    },
  ];
const faqs = [
    {
      question: 'What experience do I need?',
      answer: 'None. Full training is provided. Many franchisees come from property, customer service, operations, or completely unrelated industries.',
    },
    {
      question: 'Do I need an office?',
      answer: 'No — you can run the entire business from home. Low overheads = higher margins.',
    },
    {
      question: 'How much can I earn?',
      answer: 'Income varies per territory, but many established franchisees operate profitable full-time businesses, with some growing to six-figure turnover.',
    },
    {
      question: 'Is the work flexible?',
      answer: 'Yes. You choose your working hours and can scale up or down based on your goals.',
    },
    {
      question: 'Do I get my own territory?',
      answer: 'Yes. Each franchise is protected by clearly defined postcode territories.',
    },
    {
      question: 'How quickly can I launch?',
      answer: 'Training and onboarding can be completed in weeks, depending on availability.',
    },
    {
      question: 'Do I need property experience?',
      answer: 'Not at all. Our training covers everything you need to know.',
    },
    {
      question: 'Is the demand consistent?',
      answer: 'Very. The rental market operates year-round, with seasonal spikes during summer and autumn.',
    },
    {
      question: 'Can I hire a team as I grow?',
      answer: 'Yes — and we\'ll support you with recruitment, documents, and training.',
    },
    {
      question: 'What support do I get after launch?',
      answer: 'Ongoing operational support, marketing guidance, software updates, peer network, and access to our head office team.',
    },
  ];
const featuredTerritories = [
    {
      name: 'Guildford',
      price: '£50,000',
      description: 'Established territory with £50,000 of work already generated with no marketing or sales activity. Excellent growth potential in this affluent area.',
      highlight: 'Going Concern',
    },
    {
      name: 'Manchester',
      price: '£40,000',
      description: '£40,000 of work with no marketing or sales activity, currently managed by head office. Prime location with strong lettings market.',
      highlight: 'Going Concern',
    },
  ];
const availableTerritories = [
    { name: 'Bristol', postcodes: 'BS1-BS16', price: '£9,995' },
    { name: 'Cambridge', postcodes: 'CB1-CB8', price: '£12,995' },
    { name: 'Brighton', postcodes: 'BN1-BN3', price: '£14,995' },
    { name: 'York', postcodes: 'YO1, YO10, YO19', price: '£7,995' },
    { name: 'Exeter', postcodes: 'EX1-EX6', price: '£8,995' },
    { name: 'Norwich', postcodes: 'NR1-NR9', price: '£6,995' },
    { name: 'Oxford', postcodes: 'OX1-OX4', price: '£11,995' },
    { name: 'Bath', postcodes: 'BA1-BA2', price: '£9,995' },
  ];

export default [
  {
    _id: 'franchisePage',
    _type: 'franchisePage',
    hero: {
      _type: 'hero',
      heading: 'Build a Business in the UK Property Sector from Just £995 – £19,995',
      subheading: "Join the UK's Trusted Nationwide Inventory Clerk Network",
      primaryButton: link('Download Franchise Prospectus', '#prospectus'),
      secondaryButton: link('View Available Territories', '#territories'),
    },
    heroText:
      'Become part of a rapidly growing industry where demand has never been higher. Start your miServices franchise and unlock a scalable property reporting business with low overheads, full training, and the backing of a national brand with over 65 active territories.',
    callButtonLabel: 'Book a Discovery Call',
    video: { heading: "Watch: What It's Like to Run an miServices Franchise" },
    why: {
      heading: 'Why Join miServices?',
      text: blocks(
        'The property inventory and inspection sector is growing faster than ever. With over 5 million privately rented homes in the UK and increased compliance obligations on agents and landlords, the demand for professional property inspection and reporting services is at an all-time high.',
        "miServices is one of the UK's leading inventory clerk networks — and the first dedicated inventory franchise. With over 700+ letting agents, 100+ professionals, and 65+ territories, we give franchise partners the tools, training, and support needed to build a thriving, long-term business."
      ),
      benefitsHeading: 'The Benefits of an miServices Franchise',
      benefits: benefits.map((b) => ({ _type: 'featureItem', ...b })),
    },
    clients: {
      heading: "Who You'll Work With",
      text: "As an miServices franchisee, you'll offer property reporting services to:",
      items: clients,
      footnote: 'With so many operational areas, your earning potential is scalable, consistent, and diverse.',
    },
    investment: {
      heading: 'Low Startup Costs, Big Growth Potential',
      priceFrom: '£995',
      priceTo: 'to £19,995',
      priceNote: 'Investment varies by territory size and location',
      includesHeading: 'Your Investment Includes:',
      includesText: 'Everything you need to launch and grow a successful property reporting business — from training to ongoing support.',
      includedHeading: "What's Included:",
      included,
      callout: '💡 The miServices model is designed to be profitable from your very first month.',
    },
    territories: {
      heading: 'Available Territories',
      text: 'Choose from a range of territories across the UK. Start fresh with a new area or take over an established going concern.',
      featuredHeading: 'Featured: Going Concern Territories',
      featured: featuredTerritories.map((t) => ({ _type: 'territory', name: t.name, price: t.price, description: t.description, badge: t.highlight })),
      featuredButtonLabel: 'Enquire About This Territory',
      newHeading: 'New Territory Opportunities',
      available: availableTerritories.map((t) => ({ _type: 'territory', ...t })),
      customBefore: "Don't see your preferred area?",
      customLinkLabel: 'Contact us',
      customAfter: 'to discuss custom territory options.',
    },
    prospectus: {
      heading: 'Download the miServices Franchise Prospectus',
      text: 'Enter your details below to receive the full information pack, including earning potential, territory availability, training details, and next steps.',
    },
    testimonials: {
      heading: 'What Our Franchisees Say',
      items: testimonials.map((t) => ({ _type: 'testimonial', quote: t.quote, name: t.name, role: t.location })),
    },
    journey: {
      heading: 'Your Journey to Becoming a Franchisee',
      text: 'A simple 5-step process to join the miServices network',
      steps: steps.map((s) => ({ _type: 'step', title: s.title, description: s.description })),
      buttonLabel: 'Book Your Franchise Discovery Call',
    },
    faq: { heading: 'Frequently Asked Questions', items: faqs.map((f) => ({ _type: 'faq', ...f })) },
    cta: {
      heading: 'Ready to start your property inventory business?',
      text: 'Join a trusted nationwide network with proven systems, full training, and strong demand.',
      prospectusButtonLabel: 'Download Franchise Prospectus',
      callButtonLabel: 'Contact Franchise Team',
    },
    seo: seo(
      'Property Inventory Franchise UK | Start from £995 | miServices',
      "Join the UK's leading property inventory franchise network. Low startup costs from £995, full training, proven business model, and 65+ territories. Build a profitable property reporting business."
    ),
  },
];
