import type { SeedHelpArticle } from './types';

/** How to use the Members Area itself (taken from how the app works, so no document sources) */
export const MEMBERS_AREA_ARTICLES: SeedHelpArticle[] = [
  {
    id: 'app-create-quote',
    topic: 'members-area',
    question: 'How do I create a quote?',
    answer: [
      'Go to **Quotes** in the menu and press **New Quote**. The quote builder takes you through five steps:',
      '- **Client**: search your contacts, or add a new client there and then\n- **The job**: the number of properties and the job types\n- **Price list**: your default price list is already chosen\n- **Quote wording**: edit the sections you’re allowed to change\n- **Validity and email**: how long the quote is valid, and the email subject and message',
      'Press **Save and preview** to check it before sending.',
    ],
    keywords: ['new quote', 'quotation', 'proposal', 'quote builder', 'price a job'],
    sources: [],
  },
  {
    id: 'app-send-quote',
    topic: 'members-area',
    question: 'How do I send a quote to a client, and can I change it afterwards?',
    answer: [
      'Open the quote and press **Send quote**. You can send it by email, or press **Copy client link instead** and send the link from your own email.',
      'Sending locks the quote: its wording and prices are saved exactly as the client sees them. To offer something different, use **Duplicate** to start a new draft from it.',
      'The client can accept or decline from the link, and the quote’s status changes to Viewed, Accepted or Declined. You can also **Download PDF** or **Email again** at any time.',
    ],
    keywords: ['email quote', 'client link', 'accept', 'decline', 'resend', 'edit sent quote', 'pdf'],
    sources: [],
  },
  {
    id: 'app-add-contact',
    topic: 'members-area',
    question: 'How do I add a contact and keep track of them?',
    answer: [
      'Go to **Contacts** and press **Add Contact**. You can also add a new client while creating a quote.',
      'Each contact has a status (**Lead**, **Prospect**, **Client** or **Lost**) so you can see where they are. Open a contact to see their details and the quotes you’ve sent them, or to start a new quote for them.',
    ],
    keywords: ['client', 'customer', 'crm', 'lead', 'prospect', 'agent'],
    sources: [],
  },
  {
    id: 'app-price-lists',
    topic: 'members-area',
    question: 'How do I set up my own price list?',
    answer: [
      'Go to **Pricing**. Under **Shared Templates**, press **Duplicate** on the Head Office list you want to start from. This makes your own copy under **My Price Lists**, which you can **Edit**.',
      'Press **Set Default** on the list you use most. It’s chosen for you automatically when you create a new quote.',
    ],
    keywords: ['prices', 'price list', 'rates', 'template', 'default price list', 'duplicate'],
    sources: [],
  },
  {
    id: 'app-leaflet',
    topic: 'members-area',
    question: 'How do I make a pricing leaflet?',
    answer: [
      'Go to **Pricing** and press **Leaflet** on any price list (or **Generate leaflet** when you’re viewing or editing one). The leaflet is an A5 flyer built from that list’s prices.',
      'Choose **Double-sided** or **Single-sided**, then download the **print-ready PDF** (with bleed, to send straight to a printer) or the **digital PDF** (to email). **Share link** gives you a web link to the leaflet that you can send to clients, and you can turn the link off again later.',
      'If you’re editing a price list, save your changes first so the leaflet shows them.',
    ],
    keywords: ['flyer', 'leaflet', 'print', 'pdf', 'share link', 'pricing document'],
    sources: [],
  },
  {
    id: 'app-documents',
    topic: 'members-area',
    question: 'Where do I find the operating procedures, training guides and HR documents?',
    answer: [
      'Go to **Documents** in the menu. They’re grouped into sections such as General, Operating Procedures, Personnel and Training.',
      'Long documents have a contents list so you can jump to a section. Documents are for viewing in the Members Area only, so please don’t share or copy them.',
      'You can also search the Help Centre: results include the matching sections of the documents.',
    ],
    keywords: ['procedures', 'handbook', 'training', 'policies', 'guides', 'manual'],
    sources: [],
  },
  {
    id: 'app-edit-profile',
    topic: 'members-area',
    question: 'How do I update my franchise’s page on the website?',
    answer: [
      'Press **Edit profile** at the bottom of the menu. You can update your details, the description that appears on your public profile page, your photo and a photo of your area.',
      'Photos save straight away; other changes are saved when you press **Save Changes**.',
    ],
    keywords: ['profile', 'website page', 'photo', 'territory page', 'about us', 'bio'],
    sources: [],
  },
  {
    id: 'app-help-centre',
    topic: 'members-area',
    question: 'I can’t find what I’m looking for. Who can I ask?',
    answer: [
      'Try searching the Help Centre with a different word: it searches these answers and every section of the documents.',
      'If you still can’t find it, use the **Still stuck?** box to phone or email Head Office.',
    ],
    keywords: ['contact head office', 'support', 'help', 'question'],
    sources: [],
  },
];
