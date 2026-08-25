/**
 * Seed script to populate Sanity with the Privacy Policy page.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/seed-privacy-policy.ts
 *
 * Requires SANITY_API_TOKEN in .env
 */

import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a4q9j3x1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  token: process.env.SANITY_API_TOKEN,
  useCdn: false,
});

function block(text: string, style: string = 'normal'): any {
  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style,
    markDefs: [],
    children: [
      {
        _type: 'span',
        _key: Math.random().toString(36).slice(2, 10),
        text,
        marks: [],
      },
    ],
  };
}

function linkBlock(segments: Array<{ text: string; href?: string }>): any {
  const markDefs: any[] = [];
  const children: any[] = [];

  for (const seg of segments) {
    if (seg.href) {
      const markKey = Math.random().toString(36).slice(2, 10);
      markDefs.push({
        _type: 'link',
        _key: markKey,
        href: seg.href,
        blank: true,
      });
      children.push({
        _type: 'span',
        _key: Math.random().toString(36).slice(2, 10),
        text: seg.text,
        marks: [markKey],
      });
    } else {
      children.push({
        _type: 'span',
        _key: Math.random().toString(36).slice(2, 10),
        text: seg.text,
        marks: [],
      });
    }
  }

  return {
    _type: 'block',
    _key: Math.random().toString(36).slice(2, 10),
    style: 'normal',
    markDefs,
    children,
  };
}

function heading(text: string, level: 'h2' | 'h3' = 'h2'): any {
  return block(text, level);
}

function paragraph(text: string): any {
  return block(text, 'normal');
}

const body: any[] = [
  // What personal data we collect and why
  heading('What personal data we collect and why we collect it'),

  paragraph('We collect information automatically through cookies and information that is completed by yourself in contact forms for statistical tracking and marketing.'),

  paragraph('To collect and store any information through contact forms, you must first be aware of what we are collecting, how it will be stored and check a consent tickbox.'),

  paragraph('The data gathered is usually your name, email address and contact phone number. Depending on the nature of the enquiry form we may ask for different types of data, such as your job title, the use of which will be explained in the particular contact form.'),

  paragraph('If you telephone us with an enquiry, we will ask you for consent to store any personal or business information that you give to us and may request you complete an opt-in form online. Please note that calls may be recorded for training and monitoring purposes. You can opt out of this.'),

  paragraph('Data will be stored on our systems until you opt out or request that your information is erased.'),

  paragraph('You can opt out of receiving marketing any time \u2013 by either clicking a link in an email we send to you or by contacting us on the details below.'),

  paragraph('We will also remove any sales leads that we do not think represent commercial opportunities, or users that we find are not in their previous job position anymore.'),

  // How do we use the information about you?
  heading('How do we use the information about you?'),

  paragraph('We use any information that you have submitted to the website to send you the relevant information you have requested, as well as using your data to market our offerings, products and services and keep you up to date on industry news.'),

  paragraph('We do not share, sell or rent your data with third parties without your previous consent or unless ordered to by a court of law. We only use privacy compliant software internally to perform marketing if you have consented to this.'),

  paragraph('To perform this marketing, we store your data in a core "Contact Management System" which is linked to our semi-automated marketing system. When we wish to put out marketing campaigns, names in this system are checked for suitability and if they have been asked to be marketed to.'),

  paragraph('Access to marketing data at miServices is limited, with only key members of the team having any of the data contained if required; the rest of the marketing process is automated.'),

  paragraph('Information gathered from your website activity can also be used to personalise your repeat visits, as well as for statistical analysis to see how our website is performing and for improvement. Please refer to the "Cookies" section for more information.'),

  paragraph('If using a live chat feature, we may pass any information voluntarily submitted during the conversation through a data privacy compliant third-party live chat system. This data will never be shared.'),

  // Cookies
  heading('Cookies'),

  paragraph('Cookies are text files that collect basic information about your visit. Most websites including ours use cookies to track traffic on their website for data collection and personalisation. Cookies are stored on your device or computer and "read" by the website.'),

  paragraph('We will create cookies that are stored on your device for tracking visits which \u2013 for example \u2013 contain timestamps and session amounts (amounts of visits) as well as any preferences that you have indicated.'),

  paragraph('If using a live chat feature, we may also store a cookie that informs us that you have entered into a live chat before for streamlining the process.'),

  paragraph('Other cookies we store are primarily statistical and broadly anonymous (although geolocation, IP addresses and network addresses can be logged). Google Analytics, DoubleClick (part of Google) and AddThis are the current examples of "Big Data" collection. These help us improve and target content.'),

  paragraph('You can always clear your cookies or block cookies using your browser settings.'),

  // Right to Access your Information
  heading('Right to Access your Information'),

  paragraph('Under data protection laws, you have a right to request personal information that a company holds on you, and to request deletion of the data if appropriate, as well as other rights, such as modifying data that may be incorrect.'),

  paragraph('These actions come under the "Right of Access" data privacy laws. For more information or to make a request, please contact us on the details below and we will explain our Right of Access process.'),

  // Contact Us
  heading('Contact Us'),

  paragraph('Please contact us if you would like any more information on our policies or to make a data access request:'),

  linkBlock([
    { text: 'Email us: ' },
    { text: 'bookings@mobileinventory.co.uk', href: 'mailto:bookings@mobileinventory.co.uk' },
  ]),

  paragraph('By post: miServices, Third Floor Suite A3 (3), Chester Steam Mill, Steam Mill Street, Chester, CH3 5AN'),

  paragraph('By phone: 0345 680 7976'),

  // Useful Links
  heading('Useful Links'),

  linkBlock([
    { text: 'Cookies: ' },
    { text: 'www.allaboutcookies.org', href: 'https://www.allaboutcookies.org' },
  ]),

  linkBlock([
    { text: 'Right to Access: ' },
    { text: 'ICO - Your right of access', href: 'https://ico.org.uk/your-data-matters/your-right-of-access/' },
  ]),
];

async function seed() {
  if (!process.env.SANITY_API_TOKEN) {
    console.error('Missing SANITY_API_TOKEN in .env');
    process.exit(1);
  }

  const existing = await client.fetch(
    `*[_type == "page" && slug.current == "privacy-policy"][0]._id`
  );

  const doc = {
    _type: 'page' as const,
    title: 'Privacy Policy',
    slug: { _type: 'slug' as const, current: 'privacy-policy' },
    body,
    publishedAt: new Date().toISOString(),
  };

  if (existing) {
    console.log(`Updating existing document: ${existing}`);
    await client
      .patch(existing)
      .set({
        title: doc.title,
        body: doc.body,
        publishedAt: doc.publishedAt,
      })
      .commit();
    console.log('Privacy Policy page updated successfully.');
  } else {
    console.log('Creating new Privacy Policy page...');
    const result = await client.create(doc);
    console.log(`Created document: ${result._id}`);
  }
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
