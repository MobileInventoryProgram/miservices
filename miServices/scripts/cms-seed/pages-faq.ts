import { cta, hero, link, seo } from './helpers';

/** Copied from the previous hardcoded app/faq/page.tsx */
const generalQuestions = [
    {
      question: 'What does miServices do?',
      answer: 'miServices provides professional property reporting services including inventory reports, check-ins, check-outs, mid-term visits, and block management inspections. We support letting agents, landlords, property managers, and student accommodation providers across the UK.',
    },
    {
      question: 'Who uses miServices?',
      answer: 'Our clients include letting agents, property managers, portfolio landlords, student accommodation providers, and block management firms. Anyone responsible for rented property can use our services.',
    },
    {
      question: 'Are you a national company?',
      answer: 'Yes. miServices operates through a network of franchise territories covering more than 65 areas across the UK.',
    },
    {
      question: 'What software do you use?',
      answer: 'All reports are produced using miProgram, our proprietary reporting platform, ensuring standardised, compliant and high-quality documentation.',
    },
    {
      question: 'Are your clerks trained?',
      answer: 'Yes. Every franchisee undergoes comprehensive training including inventories, check-ins, check-outs, reporting standards, compliance checks, customer service, and operational processes.',
    },
  ];
const servicesReports = [
    {
      question: 'What is an inventory report?',
      answer: 'An inventory report documents the full condition and contents of a property at the start of a tenancy, providing the baseline for future inspections.',
    },
    {
      question: 'What is a check-in?',
      answer: 'A check-in verifies the property condition at the moment tenants move in. It includes meter readings, key details, and compliance checks.',
    },
    {
      question: 'What is a check-out?',
      answer: 'A check-out compares the property\'s end-of-tenancy condition with the original inventory, highlighting damage, cleaning needs, or changes.',
    },
    {
      question: 'What is a mid-term inspection?',
      answer: 'A mid-term visit checks property condition during a tenancy, ensuring safety, maintenance and occupancy compliance.',
    },
    {
      question: 'Do you provide block management reporting?',
      answer: 'Yes. We carry out communal inspections, compliance observations, risk assessments and maintenance notes for block and portfolio managers.',
    },
  ];
const bookingsTurnaround = [
    {
      question: 'How do I book a job?',
      answer: 'Use our dedicated booking page or contact your local miServices office. You\'ll be matched with your territory-specific team.',
    },
    {
      question: 'How quickly can you attend a property?',
      answer: 'Turnaround times vary by region but many territories offer same-day or next-day appointments depending on availability.',
    },
    {
      question: 'How soon will I receive my report?',
      answer: 'Reports are typically delivered within 24 hours, though some territories may deliver sooner depending on workload and job type.',
    },
    {
      question: 'Do you collect keys?',
      answer: 'Yes. Most territories offer key collection from letting agents or landlords. You can specify key location during booking.',
    },
    {
      question: 'What areas do you cover?',
      answer: 'Coverage depends on postcode territories. Use our Find Your Local Office tool to locate your nearest miServices team.',
    },
  ];
const pricingPayments = [
    {
      question: 'Do you display pricing online?',
      answer: 'No. Pricing varies by territory due to local cost differences. Request a price list, and we\'ll send the correct rates for your area.',
    },
    {
      question: 'How do I get a price list?',
      answer: 'Fill out the pricing request form on our website and we\'ll match you to your local office and send the relevant price list.',
    },
    {
      question: 'Do you offer invoicing?',
      answer: 'Yes. Agents can receive consolidated monthly invoices, and private landlords can pay per job.',
    },
    {
      question: 'Can you handle large volumes?',
      answer: 'Yes. Our network supports multi-branch agencies, large portfolios, and seasonal peaks (e.g., student housing turnover).',
    },
  ];
const territoriesCoverage = [
    {
      question: 'How do I know which territory I fall under?',
      answer: 'Simply enter your postcode on our Our Network page. We\'ll connect you with the correct office automatically.',
    },
    {
      question: 'Can a franchise cover more than one area?',
      answer: 'Yes. Some franchisees manage multiple adjoining territories depending on capacity and demand.',
    },
    {
      question: 'Can you support national agencies?',
      answer: 'Yes. We provide coordinated support for multi-branch and nationwide clients.',
    },
  ];
const franchiseFaqs = [
    {
      question: 'How much does it cost to start a franchise?',
      answer: 'Investment starts from £995 – £19,995 depending on territory size and availability.',
    },
    {
      question: 'Do I need experience to run a franchise?',
      answer: 'No prior property experience is required. Full training is provided.',
    },
    {
      question: 'What support do franchisees receive?',
      answer: 'Franchisees receive training, operational support, branding, software access, legal templates, ongoing guidance, and access to our 30+ person head office team.',
    },
    {
      question: 'How long does onboarding take?',
      answer: 'Most franchisees launch within a few weeks, depending on training and document completion.',
    },
    {
      question: 'How much can I earn as a franchisee?',
      answer: 'Earnings vary by territory size and workload. Many franchisees operate profitable full-time businesses, with some reaching six-figure turnover.',
    },
    {
      question: 'Is financing available?',
      answer: 'Some franchisees use personal finance or business loans. This is at your discretion.',
    },
    {
      question: 'Will I get a protected territory?',
      answer: 'Yes. Each franchise comes with a clearly defined postcode-based territory.',
    },
  ];

export default [
  {
    _id: 'faqPage',
    _type: 'faqPage',
    hero: hero('Frequently Asked Questions', 'Find answers to the most common questions about our services, pricing, and processes.'),
    categories: [
      { _type: 'faqCategory', title: 'General Questions', faqs: generalQuestions.map((f) => ({ _type: 'faq', ...f })) },
      { _type: 'faqCategory', title: 'Services & Reports', faqs: servicesReports.map((f) => ({ _type: 'faq', ...f })) },
      { _type: 'faqCategory', title: 'Bookings & Turnaround Times', faqs: bookingsTurnaround.map((f) => ({ _type: 'faq', ...f })) },
      { _type: 'faqCategory', title: 'Pricing & Payments', faqs: pricingPayments.map((f) => ({ _type: 'faq', ...f })) },
      { _type: 'faqCategory', title: 'Territories & Coverage', faqs: territoriesCoverage.map((f) => ({ _type: 'faq', ...f })) },
      { _type: 'faqCategory', title: 'Franchise FAQ', faqs: franchiseFaqs.map((f) => ({ _type: 'faq', ...f })) },
    ],
    cta: cta('Still have a question?', 'Our team is here to help.', link('Contact Us', '/contact'), link('Explore Our Network', '/our-network')),
    seo: seo('FAQs | miServices', 'Find answers to frequently asked questions about miServices, including property reports, bookings, pricing, territories, and franchise opportunities.'),
  },
];
