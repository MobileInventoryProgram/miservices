import { hero, link, seo } from './helpers';

/** Copied from the previous hardcoded app/contact/page.tsx and components/ui/BookingPromptModal.tsx */
export default [
  {
    _id: 'contactPage',
    _type: 'contactPage',
    hero: hero('Contact miServices', "We're here to help with any enquiry — get in touch with our team."),
    detailsHeading: 'Get In Touch',
    formNote: 'Fill out the form and our team will get back to you as soon as possible.',
    bookingCard: {
      heading: 'Need to Book a Job?',
      text: "If you're ready to schedule a property inspection, use our dedicated booking form for faster service.",
      button: link('Go to Booking Form', '/booking'),
    },
    bookingPrompt: {
      enabled: true,
      heading: 'Are You Looking to Make a Booking?',
      text: 'If so, fill out the booking form on our Booking Page for faster service.',
      button: link('Go to Booking Page', '/booking'),
      note: [
        {
          _type: 'block',
          _key: 'n1',
          style: 'normal',
          markDefs: [],
          children: [
            { _type: 'span', _key: 's1', text: "If you're after ongoing work, close this pop-up and choose ", marks: [] },
            { _type: 'span', _key: 's2', text: "'Quote'", marks: ['strong'] },
            { _type: 'span', _key: 's3', text: ' from the contact form, and one of the sales team will be with you ASAP.', marks: [] },
          ],
        },
      ],
    },
    seo: seo('Contact miServices | Speak With Our Team', 'Get in touch with miServices for quotes, support, job bookings and general enquiries. Fast response and nationwide coverage.'),
  },
];
