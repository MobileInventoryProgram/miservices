import { blocks, cta, hero, link, seo } from './helpers';

/** Copied from the previous hardcoded booking, pricing and sample documents pages (the placeholder sample "PDFs" are not uploaded) */
export default [
  {
    _id: 'bookingPage',
    _type: 'bookingPage',
    hero: hero('Book a Property Report', 'Complete the form below to book your inventory, inspection or block management visit.'),
    seo: seo("Book a Property Report | miServices", "Book an inventory, check-in, check-out, mid-term inspection or block management visit with miServices. Fast scheduling and nationwide coverage."),
  },
  {
    _id: 'pricingPage',
    _type: 'pricingPage',
    hero: hero('Request Our Pricing', "Pricing varies by region, but our service quality doesn't. Request the correct price list for your area.", { primaryButton: link('Request Pricing', '#pricing-form') }),
    callButtonLabel: 'Book A Call',
    why: {
      heading: "Why We Don't Display Fixed Prices Online",
      text: 'miServices operates in over 65 territories, each serving different towns, cities and postcode groups.',
      factorsHeading: 'Pricing varies due to:',
      factors: ['Regional operating costs', 'Travel distances', 'Local demand', 'Staffing levels', 'Territory size'],
      closing: blocks(
        'Every franchise follows the same high standard of reporting — but local pricing ensures fairness, accuracy and competitiveness.',
        'When you request pricing, we will match you with your nearest office and send the price list directly to your inbox.'
      ),
    },
    form: {
      heading: 'Request Your Local Price List',
      text: 'Fill out the form and our team will send you the correct price list for your territory.',
      note: '(We respond quickly — usually within the hour.)',
    },
    networkCta: {
      heading: 'Find Your Local miServices Office',
      text: 'Not sure which territory you fall into? Use our network tool to locate the correct miServices office for your area.',
      button: link('Explore Our Network', '/our-network'),
    },
    seo: seo("Pricing | Request Local Property Reporting Prices | miServices", "miServices pricing varies by territory. Request an accurate price list for your area and learn more about our national network of professional property reporting specialists.", "property inventory pricing, inventory report cost, check-in check-out pricing, property visit pricing, inventory clerk prices, property inspection prices UK, request price list, regional pricing property reporting, local inventory clerk prices"),
  },
  {
    _id: 'sampleDocumentsPage',
    _type: 'sampleDocumentsPage',
    hero: hero(
      'Sample Property Reports',
      'Preview the quality of our Inventory, Check-Out and Property Visit reports. See firsthand how our detailed documentation protects both landlords and tenants.'
    ),
    documents: [
      { _type: 'sampleDocument', name: 'Inventory', title: 'Inventory Report Sample', description: 'See a sample of our detailed, compliant inventory reports that meet industry standards and provide comprehensive property documentation.' },
      { _type: 'sampleDocument', name: 'Check-Out', title: 'Check-Out Report Sample', description: 'Review a sample of our end-of-tenancy check-out documentation, highlighting property condition changes and deposit recommendations.' },
      { _type: 'sampleDocument', name: 'Property Visit', title: 'Property Visit Report Sample', description: "Explore our mid-tenancy property visit report format, designed to keep landlords informed about their property's condition." },
    ],
    cta: cta(
      'Need Full Service Documentation?',
      'Our nationwide network of professional clerks delivers comprehensive, legally compliant property reports for landlords, letting agents, and property managers across the UK.',
      link('Book a Property Report', '/booking'),
      link('Contact Us for Pricing', '/contact')
    ),
    seo: seo("Sample Property Reports - Inventory, Check-Out & Visit Samples | miServices", "View sample property inventory reports, check-out documentation, and mid-tenancy property visit reports. See firsthand how our detailed documentation protects both landlords and tenants.", "inventory report sample, check-out report sample, property visit report, property inspection samples, miServices samples"),
  },
];
