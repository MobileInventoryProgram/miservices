import type { Quote } from '@/lib/quote/types';

/** Example draft quote used to preview the Head Office template */
export function sampleQuote(validityDays: number): Quote {
  const validUntil = new Date(Date.now() + validityDays * 86400000).toISOString().slice(0, 10);
  return {
    _id: 'sample',
    reference: 'SAMPLE',
    status: 'draft',
    propertyCount: 40,
    jobTypes: ['inventory', 'check-out'],
    sections: [],
    validUntil,
    contact: {
      _id: 'sample-contact',
      firstName: 'Sarah',
      lastName: 'Example',
      companyName: 'Example Lettings Ltd',
      email: 'sarah@example.com',
      phone: '01234 567890',
      address: '1 High Street\nAnytown',
      postcode: 'AB1 2CD',
    },
    franchise: {
      _id: 'sample-franchise',
      companyName: 'miServices Example',
      territory: 'Example',
      owners: [{ firstName: 'Jo', lastName: 'Bloggs', email: 'example@miservices.co.uk', phone: '07000 000000' }],
    },
    ownerName: 'Jo Bloggs',
    ownerEmail: 'example@miservices.co.uk',
  };
}
