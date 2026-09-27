import type { SeedHelpArticle } from './types';

/**
 * Starter Help Centre answers drawn from: GDPR Policy 2021,
 * Pre-contract Disclosure Document, Daily Operating Procedures, Marketing
 * Procedures and Sales Procedures. Every answer only restates its sources.
 */
export const OPERATIONS_ARTICLES: SeedHelpArticle[] = [
  // ──────────────────────── miProgram (from operating docs) ────────────────────────
  {
    id: 'ops-what-is-miprogram',
    topic: 'getting-started',
    question: 'What is miProgram, and is it exclusive to miServices?',
    answer: [
      'miProgram is the software used to create inventory, mid-term and check-out reports on a mobile device. It was built by Stuart McCormick, and by September 2010 it was operational on iPhone and available on the Apple Store. It now has a customer base of over 1000 letting agents across the UK.',
      'miServices requires you to use this software, but it is a separate company and it is not exclusive to miServices franchise owners. You will be a customer of the software company, licensed to use it, but without exclusive rights to its use in your territory, just like any other customer.',
    ],
    keywords: ['inventory app', 'software', 'licence', 'Mobile Inventory', 'exclusivity', 'who owns miProgram'],
    sources: [
      { doc: 'pre-contract-disclosure-document', heading: 'History of the company' },
      { doc: 'daily-operating-procedures', heading: 'Your duty as a franchise owner of miServices' },
    ],
  },
  {
    id: 'ops-miprogram-device',
    topic: 'getting-started',
    question: 'Which phone or tablet should I use for inspections?',
    answer: [
      'miProgram works on both Apple and Android devices, but reports produced on Apple devices are much better. Some people prefer an iPad and others an iPhone. Whichever you prefer, it is best practice to carry both at all times so you have a back-up if one breaks down during the day.',
      '- **iPhone**: smaller and lighter, easier to move around small spaces, comes with a 4G link that helps report upload, and may have a camera flash. However, calls and notifications can distract you, the battery may drain quickly, it can run slower with too many apps open, and it is less durable if dropped.\n- **iPad**: larger screen, more durable, longer battery life and no distractions from calls. However, it is larger and heavier, might not have a 4G link (so relies on Wi-Fi or a hotspot) and has no camera flash.',
      'The Daily Operating Procedures also say franchise owners and their staff will need an iPhone or iPad to operate ServiceM8.',
    ],
    keywords: ['iPhone', 'iPad', 'Android', 'which device', 'tablet', 'handheld', 'equipment'],
    sources: [
      { doc: 'pre-contract-disclosure-document', heading: 'Computer systems and handheld devices' },
      { doc: 'daily-operating-procedures', heading: 'Service M8' },
    ],
  },

  // ──────────────────────────── Getting started ────────────────────────────
  {
    id: 'ops-who-to-contact',
    topic: 'getting-started',
    question: 'Who do I contact at Head Office about what?',
    answer: [
      '- **Stuart McCormick** — Contracts & Operations — 0345 680 7976\n- **William Forbes** — Sales Activity — 0345 680 7976\n- **Marta Janes** — Franchise Operations — 0345 680 7976\n- **Alex McCormick** — Marketing & Software — 0345 680 7976\n- **Fred Davies** — Southern Office Director — 0345 680 2178',
      'All customer complaints need to be addressed FAO Stuart McCormick, Managing Director.',
    ],
    keywords: ['contact', 'phone number', 'head office', 'central office', 'support', 'directors'],
    sources: [
      { doc: 'pre-contract-disclosure-document', heading: 'Who to call' },
      { doc: 'daily-operating-procedures', heading: 'Customer complaints procedure' },
    ],
  },
  {
    id: 'ops-working-hours',
    topic: 'getting-started',
    question: 'What days and hours do I have to be operating?',
    answer: [
      'You must be operational Monday to Friday, 9am–5pm. Saturday and Sunday are optional, and you are welcome to set weekend hours and extra weekday hours if you wish.',
      'Take your customers’ working hours into account: most letting/estate agencies are open on Saturday mornings and some on Sundays, and last-minute bookings are likely for the following week, for example for tenants wanting to move in on a Monday morning.',
    ],
    keywords: ['opening hours', 'weekends', 'Saturday', 'working days', '9 to 5'],
    sources: [{ doc: 'daily-operating-procedures', heading: 'Required days & hours of operation' }],
  },
  {
    id: 'ops-holidays',
    topic: 'getting-started',
    question: 'What do I need to do before taking a holiday?',
    answer: [
      'Inform both head offices as soon as possible, ideally with at least 6 weeks’ notice. You must find a replacement to fulfil the work while you are away — one of your staff or a temporary subcontractor, it’s up to you. A head office may be able to help cover depending on your location, but often this is not possible, so make arrangements beforehand so customers are not let down.',
      'The busiest time of year for the industry is June to August, so please avoid that period where possible.',
    ],
    keywords: ['holiday', 'annual leave', 'time off', 'cover', 'days off', 'absence'],
    sources: [{ doc: 'daily-operating-procedures', heading: 'Holidays and days off' }],
  },
  {
    id: 'ops-phone-manner',
    topic: 'getting-started',
    question: 'How should I answer the phone, and when can I contact customers?',
    answer: [
      'Ideally answer calls within the first three rings with a professional greeting, for example “Good afternoon, Mobile Inventory, Hannah speaking” or “Good morning, you’re through to Mobile Inventory, how can I help?”. Mobile calls should be answered the same way. Never keep anyone on hold for over one minute.',
      'Only phone or message customers between 8:30am and 7:30pm. Please don’t call or message late at night — there have been complaints from private landlords and tenants about this in the past.',
      'If a mobile is your main contact number during business hours, turn your voicemail on and introduce yourself as Mobile Inventory Services.',
    ],
    keywords: ['telephone', 'greeting', 'voicemail', 'calling hours', 'texting customers', 'on hold'],
    sources: [
      { doc: 'daily-operating-procedures', heading: 'Answering the telephone' },
      { doc: 'daily-operating-procedures', heading: 'Voicemail requirement' },
      { doc: 'daily-operating-procedures', heading: 'Working / interacting with customers' },
    ],
  },
  {
    id: 'ops-complaints-refunds',
    topic: 'getting-started',
    question: 'What do I do with a customer complaint or refund request?',
    answer: [
      'All franchisees must record all complaints and store them for audit purposes. Complaints of a serious nature must be passed to the central office immediately. All complaints need to be addressed FAO Stuart McCormick, Managing Director.',
      'All refund requests need to come through to the central office so there is a record on file.',
      'If a complaint leads to any bad press for your franchise, let Central Office know as quickly as possible so they can advise and help manage it.',
    ],
    keywords: ['complaint', 'refund', 'unhappy customer', 'dispute', 'escalate', 'bad press'],
    sources: [
      { doc: 'daily-operating-procedures', heading: 'Customer complaints procedure' },
      { doc: 'daily-operating-procedures', heading: 'Refund requests' },
      { doc: 'marketing-procedures', heading: 'What about bad PR?' },
    ],
  },
  {
    id: 'ops-servicem8',
    topic: 'getting-started',
    question: 'Do I need my own ServiceM8 subscription, and what does it cost?',
    answer: [
      'ServiceM8 is the booking system used by the miServices booking teams in the South and North offices, and all franchise owners must use it to receive centrally managed jobs.',
      'If you are the only person working for your franchise, you can be added to head office’s ServiceM8. If you employ any staff, you need your own subscription. Current prices are:',
      '- “Growing Package” — £59 per month (unlimited staff, 150 new jobs per month)\n- “Premium Package” — £119 per month (unlimited staff, 500 new jobs per month)',
      'ServiceM8 has an iOS app for field staff and an online dashboard accessed through a web browser such as Google Chrome.',
    ],
    keywords: ['ServiceM8', 'Service M8', 'booking system', 'job management', 'subscription cost', 'diary'],
    sources: [{ doc: 'daily-operating-procedures', heading: 'Service M8' }],
  },
  {
    id: 'ops-confirming-central-jobs',
    topic: 'getting-started',
    question: 'How do I book and confirm a centrally managed job?',
    answer: [
      '**If you have your own ServiceM8 subscription:** centrally managed jobs are built by head office and sent to you. It is your responsibility to book the job, agree the time, arrange key collection etc. with the landlord or tenant, then let the office know it’s done by sending a message through the job card.',
      '**If you don’t have a subscription:** head office books the job on your ServiceM8 diary. After you confirm it with the landlord or tenant, leave a note on the job card to let the office know.',
      'Keep your Google diary up to date and make sure entries sync to ServiceM8 correctly to avoid overbooking — if you have no ServiceM8 subscription, this includes all your self-managed jobs and personal appointments so the booking teams can see your availability. Tell a head office urgently if you notice any discrepancies.',
    ],
    keywords: ['booking', 'job card', 'key collection', 'Google Calendar', 'diary', 'overbooking', 'confirm appointment'],
    sources: [
      { doc: 'daily-operating-procedures', heading: 'Service M8' },
      { doc: 'daily-operating-procedures', heading: 'Google Workspace' },
    ],
  },
  {
    id: 'ops-monthly-reporting',
    topic: 'getting-started',
    question: 'What do I need to report to Head Office each month?',
    answer: [
      'All franchisees must use QuickBooks for bookkeeping. Every Franchise Owner must report their turnover to head office at the end of each month, either by sharing the spreadsheet with all jobs for the month recorded, or by sending “Summary by Customer” reports from QuickBooks.',
      'You also need to tell head office about new customers, and keep all your customers’ contact information updated regularly on your turnover spreadsheets or otherwise.',
    ],
    keywords: ['turnover', 'monthly report', 'QuickBooks', 'Summary by Customer', 'spreadsheet', 'new customers'],
    sources: [
      { doc: 'daily-operating-procedures', heading: 'Operational and financial reporting' },
      { doc: 'daily-operating-procedures', heading: 'Customers’ information' },
    ],
  },
  {
    id: 'ops-invoicing-central-work',
    topic: 'getting-started',
    question: 'How and when do I invoice for centrally managed work, and when will I be paid?',
    answer: [
      'You need the basic package of QuickBooks to issue invoices. For Centrally Managed Customers, send miServices **one invoice per customer**, covering all jobs completed for them during the month. Invoices must be issued no later than 30 days after the month in which the job was completed — for example, for an inventory on 7th May 2024, the invoice must be sent by 30th June 2024. **Invoices arriving after the deadline will not be paid.** In exceptional circumstances, contact Head Office to ask permission to submit late.',
      'miServices pays your invoices as quickly as it receives the money from customers, which varies from customer to customer; on average payments are received in 30 to 60 days. miServices acts as administrator and collection agent, you are not its subcontractor, and payment is by agreement rather than solely on your invoice terms. miServices does not operate on the basis that you get paid if it doesn’t.',
      'For your private customers, you invoice them directly and agree the payment terms with them.',
    ],
    keywords: ['invoice deadline', 'payment', 'getting paid', 'QuickBooks', 'late invoice', 'payment terms'],
    sources: [{ doc: 'daily-operating-procedures', heading: 'Invoicing' }],
  },
  {
    id: 'ops-territory-boundaries',
    topic: 'getting-started',
    question: 'Can I take jobs outside my territory?',
    answer: [
      'Centrally managed work is allocated by where the **property** is, not where the branch is. The job goes first to the franchise owner whose territory the property is in, and second to the franchise owner in the next nearest territory.',
      'You may work outside your territory where no franchise owner operates there. But if miServices sells that area, all the customers using your services there must be passed to the new Franchise Owner. Don’t manage bookings outside your territory or organise work for other Franchise Owners — contact head office to pass these on.',
      'If an agent in your territory has a substantial amount of work in someone else’s territory, the customer should be classed as centrally managed and handed back to the Chester or Dover office.',
    ],
    keywords: ['territory', 'boundaries', 'outside area', 'neighbouring franchise', 'next nearest', 'allocation'],
    sources: [{ doc: 'daily-operating-procedures', heading: 'Respecting territory boundaries' }],
  },
  {
    id: 'ops-central-customers',
    topic: 'getting-started',
    question: 'What is a centrally managed customer, and what is the management fee?',
    answer: [
      'A Central Customer is one whose branches or jobs cover more than one franchise territory. The Chester or Dover office manages these jobs: taking the booking, passing the work to the relevant franchise owner, making sure the job is fulfilled and received by the client, handling any issues or complaints, and collecting the money, which is paid to you when the funds are received. **For this service you are charged a management fee of 20%.**',
      'Whoever won the client, it must be handed to the Chester office in the first instance to decide how it is dealt with. If you win a client in your area who also needs work outside it, it becomes a centrally managed contract.',
      'A client who only operates in your territory will usually be managed by you, unless you specifically ask miServices to manage them for you. miServices cannot guarantee how much work you will receive from Centrally Managed Customers in your area, or for how long.',
    ],
    keywords: ['central customers', 'national accounts', '20%', 'management fee', 'Chester office', 'Dover office'],
    sources: [{ doc: 'pre-contract-disclosure-document', heading: 'Central customers and other customer types' }],
  },
  {
    id: 'ops-franchise-fees',
    topic: 'getting-started',
    question: 'What fees do I pay as a franchisee?',
    answer: [
      'Fees fall into five main areas:',
      '- **Initial fee** — your first payment; the amount depends on the size of your territory. There is also a fee of £250 plus VAT for producing the documentation.\n- **Ongoing franchise fee** — usually based on 20% of the amount of centrally managed work, plus a set monthly payment based on the agreed payment schedule.\n- **Annual fees** — things paid on your behalf annually, e.g. your G-suite email account (currently £50 plus VAT per user, per year).\n- **Monthly subscriptions** — software paid monthly on your behalf, e.g. SharpSpring CRM (currently £10 plus VAT).\n- **Renewal fee** — paid to carry on at the end of your contract term: £995 + VAT, plus a £250 documentation fee.',
      'These are listed in the schedules at the back of your agreement and may be named differently there. All fees are subject to change — if in doubt, ask Head Office.',
    ],
    keywords: ['franchise fee', 'costs', 'renewal fee', 'monthly fee', 'initial fee', 'G-suite', 'SharpSpring'],
    sources: [{ doc: 'pre-contract-disclosure-document', heading: 'Fees' }],
  },
  {
    id: 'ops-limited-company',
    topic: 'getting-started',
    question: 'Do I have to trade as a limited company?',
    answer: [
      'Yes. Mobile Inventory Services insists that all franchises operate as limited companies. Your limited company is the franchise licence owner — for example, “Fred Bloggs Limited trading as Mobile Inventory Services (region)”. Your limited company name **cannot include the words Mobile Inventory or miServices**.',
      'When describing your company’s nature of business to Companies House, the SIC code to use is 74909 (Other professional, scientific and technical activities). You are asked to seek independent advice on this.',
      'You also need a business bank account in your company’s name — e.g. the account name would be Fred Bloggs Limited.',
    ],
    keywords: ['Ltd', 'company formation', 'Companies House', 'SIC code', 'sole trader', 'business bank account'],
    sources: [
      { doc: 'pre-contract-disclosure-document', heading: 'Forming a limited company' },
      { doc: 'pre-contract-disclosure-document', heading: 'Bank accounts' },
    ],
  },
  {
    id: 'ops-initial-training',
    topic: 'getting-started',
    question: 'What training do I get when I start?',
    answer: [
      'Allow two full, consecutive days for initial training, one day for field training, and an additional two days for sales training later on. Training cannot start until you have paid your initial franchise fee, and you fund your own travel, accommodation and hospitality. You need at least one miProgram-compatible device (iPhone, iPad or Android handset).',
      'The first two days cover inventories, check-ins, check-outs and mid-terms/management visits, the inventory software, and core business processes such as job management, record keeping, accounts, marketing, customer relations and recruiting staff. You then practise on a “live” property and on your own (your own property is recommended), with the report assessed by the Training Manager. Finally you take a multiple-choice test and need **at least 90% to pass**.',
      'Once you are doing live jobs, you will get feedback on your reports for the first two to three weeks. Further training can be arranged at any time through the franchise manager.',
    ],
    keywords: ['AIP training', 'induction', 'training course', 'test', 'pass mark', 'Training Manager'],
    sources: [
      { doc: 'pre-contract-disclosure-document', heading: 'Scheduling initial training' },
      { doc: 'pre-contract-disclosure-document', heading: 'Initial training programme' },
      { doc: 'pre-contract-disclosure-document', heading: 'Ongoing training' },
    ],
  },
  {
    id: 'ops-staff-training',
    topic: 'getting-started',
    question: 'Do my staff or subcontractors need to be trained?',
    answer: [
      'Yes. Staff members and subcontractors must complete AIP training at a cost of £295 plus VAT. It is similar to franchisee training but generally slightly shorter, as it doesn’t cover the business side. On-the-job training is also offered at £100 per day.',
      'Staff members or subcontractors must never be used on “live” jobs until miServices is satisfied they have completed the training to the required standard.',
    ],
    keywords: ['employee training', 'subcontractor', 'AIP', 'new clerk', '£295', 'on the job training'],
    sources: [{ doc: 'pre-contract-disclosure-document', heading: 'Staff training' }],
  },
  {
    id: 'ops-insurance',
    topic: 'getting-started',
    question: 'What insurance do I need?',
    answer: [
      'You must take out and maintain all-risk insurance with a reputable insurer, including (but not limited to):',
      '- Liability for employees and third parties\n- Public liability\n- Liability under the Consumer Protection Act 1987\n- Professional indemnity cover\n- Liability for damage to property (including equipment and any vehicles used in the business)\n- Liability for Data Protection and Cyber security\n- Any other cover the Franchisor specifies',
      'You will be told the amount of cover for each element when you are setting up, and you must send copies of your annual renewals each year. Hiscox Online can often offer the right cover, but you are under no obligation to use them.',
    ],
    keywords: ['public liability', 'professional indemnity', 'cover', 'insurer', 'Hiscox', 'renewal certificate'],
    sources: [{ doc: 'pre-contract-disclosure-document', heading: 'Compulsory insurance cover' }],
  },
  {
    id: 'ops-uniform',
    topic: 'getting-started',
    question: 'Where do I get a uniform and ID card, and what else should I wear?',
    answer: [
      'All staff must wear some form of company-branded uniform on the job. Branded clothing must only be ordered from miServices at https://miservices.bigcartel.com — polo tops, T-shirts, jumpers, baseball caps, rain jackets and ID cards (1 free card per clerk, then £7.50 per replacement; you supply a portrait photo).',
      'Trousers, skirts and shoes should be plain (no branding), dark and practical, as you will often be working in grubby, dusty places — dark jeans or work trousers are popular. Shorts are acceptable in the summer months.',
    ],
    keywords: ['uniform', 'branded clothing', 'ID badge', 'dress code', 'polo shirt', 'Big Cartel'],
    sources: [{ doc: 'pre-contract-disclosure-document', heading: 'Uniforms' }],
  },
  {
    id: 'ops-inventory-kit',
    topic: 'getting-started',
    question: 'What should I carry in my inventory kit?',
    answer: [
      '- Practical bag\n- Meter key (for meter boxes)\n- Fire brigade (FB) keys (for communal meter cupboards)\n- Ruler or tape measure (to show the size of issues in photos)\n- Screwdriver (to prise open water meter covers)\n- Long-handled brush (to clear debris from water meters)\n- Torch\n- Pen and paper\n- Shoe covers\n- Device charger cable and a fully charged battery pack\n- First aid kit\n- Hand sanitiser, wet wipes and toilet roll\n- Face covering\n- Envelopes (for posting keys to a customer)\n- Extendable/telescopic sticks (for reaching and testing high-level smoke/CO alarms)',
    ],
    keywords: ['equipment', 'kit list', 'meter key', 'torch', 'what to bring', 'tools'],
    sources: [{ doc: 'pre-contract-disclosure-document', heading: 'Initial things you need' }],
  },

  {
    id: 'ops-territory-selection',
    topic: 'getting-started',
    question: 'How is my territory decided, and can I expand it later?',
    answer: [
      'Territory selection is carried out with you. In general the size of a territory is worked out from the number of target businesses in the area, using information from Rightmove, Zoopla, City Living (Scotland) and On the Market. A basic/smaller territory has circa 60 letting agents.',
      'Once the type of area is agreed, a map and a list of target customers are drawn up with you and added to the territory schedule in your agreement. You are still expected to do some extra digging of your own to know exactly where and who your potential customers are.',
      'If you wish to expand your territory later, that is always possible — many franchise owners have already done so.',
    ],
    keywords: ['territory size', 'area', 'letting agents', 'expand territory', 'territory schedule', 'map'],
    sources: [
      { doc: 'pre-contract-disclosure-document', heading: 'Territory selection' },
      { doc: 'pre-contract-disclosure-document', heading: 'Territory selection criteria and market analysis for the area' },
    ],
  },
  {
    id: 'ops-confidentiality',
    topic: 'getting-started',
    question: 'Can I share the process documents with anyone else?',
    answer: [
      'No. Passing the information to others and breaching the confidentiality set out in your agreement could damage the core business, which your franchise relies on. Any breach of confidentiality of the process documents will be considered a serious breach of conduct.',
      'Take care when handling any data and documentation given to you, whether physically or virtually.',
    ],
    keywords: ['confidential', 'process documentation', 'sharing documents', 'breach of conduct', 'NDA'],
    sources: [{ doc: 'pre-contract-disclosure-document', heading: 'Importance of confidentiality' }],
  },
  {
    id: 'ops-customer-feedback',
    topic: 'getting-started',
    question: 'What should I do with customer feedback?',
    answer: [
      'Keep track of all feedback. When a customer gives feedback, note who they are, where they are calling from and the date you spoke, and follow it up in due time. Pass relevant feedback — for example software improvement suggestions or bugs — on to the central office.',
      'Take feedback about your own work into account on your next job. If a customer asks for a specific detail to be added to documents, follow up after the next booking to check you have understood what they want.',
    ],
    keywords: ['feedback', 'suggestions', 'software bugs', 'customer comments', 'improvements'],
    sources: [{ doc: 'daily-operating-procedures', heading: 'Customer feedback' }],
  },

  // ──────────────────────────────── Marketing ────────────────────────────────
  {
    id: 'ops-own-marketing',
    topic: 'marketing',
    question: 'Can I do my own local marketing, and when do I need approval?',
    answer: [
      'Yes — you are encouraged to market within your own area. Keep to the brand guidelines at all times, use your best judgement and follow the laws on advertising. All marketing must be an accurate description of the services, and legal, decent, truthful, honest and socially responsible.',
      'For marketing on a higher level — for example a regional newspaper or any larger campaign — speak to central office for approval first. If you are unsure about anything, contact central office.',
      'The full brand guidelines are in the brand guidelines document in the processes documentation.',
    ],
    keywords: ['advertising', 'approval', 'brand guidelines', 'local marketing', 'newspaper ad', 'campaign'],
    sources: [
      { doc: 'marketing-procedures', heading: 'Obtaining marketing approval' },
      { doc: 'marketing-procedures', heading: 'Marketing standards' },
      { doc: 'marketing-procedures', heading: 'Brand guidelines' },
    ],
  },
  {
    id: 'ops-social-media',
    topic: 'marketing',
    question: 'Can I set up social media accounts for my territory?',
    answer: [
      'Yes. For **LinkedIn and Facebook**, ask Head Office to set the accounts up for you and you will be given admin access. For any other platform, notify Head Office and follow the brand guidelines.',
      'miServices itself posts regularly on LinkedIn, Facebook and Twitter, which it has found the most effective platforms for the industry.',
    ],
    keywords: ['Facebook', 'LinkedIn', 'Twitter', 'social accounts', 'admin access', 'Instagram'],
    sources: [{ doc: 'marketing-procedures', heading: 'Social media' }],
  },
  {
    id: 'ops-website-profile',
    topic: 'marketing',
    question: 'Do I get my own page on the miServices website?',
    answer: [
      'Yes. Every franchise territory is entitled to its own profile on the “Our Network” page of www.mobileinventoryservices.co.uk, with your contact details, opening hours, links to your social media accounts, booking forms and details about you.',
      'Contact Head Office to set this up — they will need some more information from you to create your page.',
    ],
    keywords: ['website', 'Our Network', 'profile page', 'franchise page', 'online listing'],
    sources: [
      { doc: 'marketing-procedures', heading: 'Your website profile' },
      { doc: 'marketing-procedures', heading: 'Website' },
    ],
  },
  {
    id: 'ops-press-release',
    topic: 'marketing',
    question: 'Do I need Central Office to approve my press release?',
    answer: [
      'If it is for a local audience only, Central Office doesn’t need to see it, though they are happy to check it over and give feedback. If a story is likely to gain wider regional or national attention, Central Office definitely wants to see it and sign it off, so they can also support you with journalists.',
      'Keep press releases short — no longer than 400 words — clearly written and free of spelling and grammar mistakes. Include the right photography (around 1MB per image is fine) and say who is in the picture.',
      'If your franchise gets any bad press, for example because of a complaint, let Central Office know as quickly as possible so they can advise and help manage negative coverage.',
    ],
    keywords: ['PR', 'public relations', 'press', 'news story', 'journalist', 'media', 'bad press'],
    sources: [
      { doc: 'marketing-procedures', heading: 'Do I need to get my press release approved by Central Office?' },
      { doc: 'marketing-procedures', heading: 'Public relations (PR)' },
      { doc: 'marketing-procedures', heading: 'What about bad PR?' },
    ],
  },
  {
    id: 'ops-head-office-marketing',
    topic: 'marketing',
    question: 'What marketing does Head Office do, and what can they give me?',
    answer: [
      '- **Website and SEO** — Head Office works on the website to improve search rankings.\n- **Pay-per-click** — national PPC campaigns are run from time to time by head office, when it sees fit.\n- **Email marketing** — carried out by central office from time to time to the CRM list, which is why it is essential you keep the CRM up to date.\n- **Flyers** — contact Head Office for flyer designs for direct mail.',
      'For marketing and software questions, contact Alex McCormick — Marketing & Software — 0345 680 7976.',
    ],
    keywords: ['flyers', 'leaflets', 'PPC', 'SEO', 'email campaigns', 'marketing support', 'Google ads'],
    sources: [
      { doc: 'marketing-procedures', heading: 'Introduction' },
      { doc: 'marketing-procedures', heading: 'SEO' },
      { doc: 'marketing-procedures', heading: 'Paid search ads' },
      { doc: 'marketing-procedures', heading: 'Email marketing' },
      { doc: 'marketing-procedures', heading: 'Direct mail' },
    ],
  },

  // ──────────────────────────── Pricing & sales ────────────────────────────
  {
    id: 'ops-sales-support',
    topic: 'pricing-sales',
    question: 'How will Head Office help me win new clients?',
    answer: [
      'miServices works with you through the whole sales process. Our sales director William Forbes (Sales Activity — 0345 680 7976) is on hand for questions.',
      '- Identify all target agents in your area using Rightmove, Zoopla and On The Market plus your local knowledge.\n- Identify decision makers from agents’ websites and LinkedIn, and add them to the CRM.\n- Understand the competition active in your area.\n- Arrange a postal mail shot of your area with a corporate leaflet; enquiries are directed to you via Head Office.\n- Cold call agents in person with a senior member of the Head Office sales team.\n- Debrief and coaching, then repeat the process throughout your area with continued central office support.',
    ],
    keywords: ['sales', 'new business', 'leads', 'prospecting', 'target agents', 'mail shot', 'William Forbes'],
    sources: [
      { doc: 'sales-procedures', heading: 'Our sales procedure' },
      { doc: 'sales-procedures', heading: 'Who to contact' },
    ],
  },
  {
    id: 'ops-sales-visits',
    topic: 'pricing-sales',
    question: 'Will someone from Head Office come out cold calling with me?',
    answer: [
      'Yes. A senior member of the Head Office sales team will spend 2 days with you in your franchise area cold calling agents in person — in their experience the most effective and direct way to win business.',
      'There is no pressure on you: they lead the pitches, showing how to identify agents’ needs, build rapport and overcome common objections. One of the business Directors will be with you until you are confident to do this on your own. Afterwards you are debriefed with suggestions to improve your pitch, and this coaching continues throughout the relationship.',
    ],
    keywords: ['cold calling', 'sales visit', 'door knocking', 'pitch', 'sales coaching', 'objections'],
    sources: [
      { doc: 'sales-procedures', heading: 'We’ll come out with you' },
      { doc: 'sales-procedures', heading: 'No pressure' },
      { doc: 'sales-procedures', heading: 'What’s next?' },
    ],
  },
  {
    id: 'ops-sales-follow-up',
    topic: 'pricing-sales',
    question: 'What happens when an agent shows interest?',
    answer: [
      'If an agent shows interest, Head Office will close the deal and book the service in with central office, who will send out a formal quotation. You must then follow this up with either a call or a visit.',
    ],
    keywords: ['quotation', 'quote', 'closing a deal', 'follow up', 'interested agent', 'new client'],
    sources: [{ doc: 'sales-procedures', heading: 'Follow up procedure' }],
  },
  {
    id: 'ops-crm',
    topic: 'pricing-sales',
    question: 'Which CRM do we use and what do I put in it?',
    answer: [
      'The CRM is SharpSpring. Add your customers’ and potential customers’ details when you first get them. The contact may already be there if someone at miServices has been in touch before, in which case you can see all the previous activity with them.',
      'Keeping the CRM up to date lets Head Office send mass emails with news and updates to your potential customers to help win business for you. See the SharpSpring guide in the processes documentation.',
    ],
    keywords: ['SharpSpring', 'customer database', 'contacts', 'leads', 'customer relationship management'],
    sources: [{ doc: 'sales-procedures', heading: 'Using the CRM' }],
  },

  // ─────────────────────────────── GDPR / policies ───────────────────────────────
  {
    id: 'ops-gdpr-personal-data',
    topic: 'policies',
    question: 'What counts as personal data under GDPR?',
    answer: [
      'Personal data is any information relating to a living person who can be identified, directly or indirectly — for example by a name, identification number, location data, an online identifier, or factors specific to their physical, physiological, genetic, mental, economic, cultural or social identity.',
      '“Special category” personal data means data revealing racial or ethnic origin, political opinions, religious or philosophical beliefs, trade union membership, health, sex life, sexual orientation, biometric or genetic data.',
    ],
    keywords: ['GDPR', 'data protection', 'definition', 'sensitive data', 'special category', 'data subject'],
    sources: [{ doc: 'gdpr-policy-2021', heading: 'Definitions' }],
  },
  {
    id: 'ops-gdpr-data-we-hold',
    topic: 'policies',
    question: 'What personal data does my business hold, and why?',
    answer: [
      '- **Staff recruitment** — name, address, phone number, email, bank account number and National Insurance number, for recruitment and employment (e.g. tax and pension).\n- **Customer information** — names, branch addresses, phone numbers and email addresses, so you can contact customers about the service.\n- **Tenants and landlords** — names, addresses and phone numbers, to find the property location and tell them when an inventory, mid-term or check-out visit will take place.',
      'Only collect personal data to the extent needed for your job duties — excessive personal data must not be collected.',
    ],
    keywords: ['GDPR', 'tenant data', 'landlord data', 'customer data', 'staff records', 'data minimisation'],
    sources: [
      { doc: 'gdpr-policy-2021', heading: 'Personal Data Collected, Held and Processed' },
      { doc: 'gdpr-policy-2021', heading: 'Adequate, Relevant, and Limited Data Processing' },
    ],
  },
  {
    id: 'ops-gdpr-lawful-basis',
    topic: 'policies',
    question: 'What is a lawful basis for using someone’s personal data?',
    answer: [
      'Processing personal data is lawful if at least one of these applies:',
      '- the person has given consent for one or more specific purposes;\n- it is necessary for a contract with the person, or to take steps at their request before entering into one;\n- it is necessary to comply with a legal obligation;\n- it is necessary to protect someone’s vital interests;\n- it is necessary for a task in the public interest or official authority; or\n- it is necessary for legitimate interests, except where these are overridden by the person’s rights and freedoms.',
      'If you rely on consent, it must be a clear statement or positive action (silence, pre-ticked boxes or inactivity are unlikely to count), people must be able to withdraw it easily at any time, and you must keep records of all consents.',
    ],
    keywords: ['lawful basis', 'legal basis', 'consent', 'legitimate interest', 'GDPR', 'contract'],
    sources: [
      { doc: 'gdpr-policy-2021', heading: 'Lawful, Fair, and Transparent Data Processing' },
      { doc: 'gdpr-policy-2021', heading: 'Consent' },
    ],
  },
  {
    id: 'ops-gdpr-rights',
    topic: 'policies',
    question: 'What rights do people have over their personal data?',
    answer: [
      'Under the UK GDPR, the key rights are:',
      '- the right to be informed;\n- the right of access;\n- the right to rectification;\n- the right to erasure (the “right to be forgotten”);\n- the right to restrict processing;\n- the right to data portability;\n- the right to object; and\n- rights relating to automated decision-making and profiling.',
    ],
    keywords: ['data subject rights', 'GDPR', 'right to be forgotten', 'access', 'object', 'portability'],
    sources: [{ doc: 'gdpr-policy-2021', heading: 'The Rights of the Subjects' }],
  },
  {
    id: 'ops-gdpr-subject-access-request',
    topic: 'policies',
    question: 'Someone has asked for a copy of the data we hold about them — what do I do?',
    answer: [
      'This is a subject access request (SAR). People can make one at any time to find out what personal data you hold about them, what you are doing with it and why. Employees making a SAR should use a Subject Access Request Form, sent to the Franchisee and/or the directors of the limited company. All SARs are handled by the Company’s Director, or its Data Protection Officer if one is nominated.',
      '**You must normally respond within one month of receipt.** This can be extended by up to two months if the request is complex or there are numerous requests — if so, tell the person.',
      'There is no fee for a normal SAR. A reasonable fee may be charged for additional copies of information already supplied, and for requests that are manifestly unfounded or excessive, particularly repetitive ones.',
    ],
    keywords: ['SAR', 'subject access request', 'data request', 'copy of my data', 'one month', 'GDPR'],
    sources: [{ doc: 'gdpr-policy-2021', heading: 'Data Subject Access' }],
  },
  {
    id: 'ops-gdpr-correct-or-delete',
    topic: 'policies',
    question: 'Someone wants their personal data corrected or deleted — how long do I have?',
    answer: [
      '**Correction (rectification):** people can require you to correct inaccurate or incomplete data. Correct it and tell them within one month of being informed. This can be extended by up to two months for complex requests (tell them if so). If the data has been shared with third parties, tell those parties about the correction.',
      '**Deletion (erasure):** unless there are reasonable grounds to refuse, comply with the request and tell the person within one month of receipt, extendable by up to two months for complex requests (again, tell them). Circumstances include where the data is no longer needed for its original purpose, or the person withdraws consent. If the data has been shared with third parties, tell them about the erasure unless that is impossible or would take disproportionate effort.',
    ],
    keywords: ['right to be forgotten', 'erasure', 'rectification', 'delete my data', 'correct data', 'GDPR'],
    sources: [
      { doc: 'gdpr-policy-2021', heading: 'Rectification of Personal Data' },
      { doc: 'gdpr-policy-2021', heading: 'Erasure of Personal Data' },
    ],
  },
  {
    id: 'ops-gdpr-data-breach',
    topic: 'policies',
    question: 'What do I do if there’s a data breach?',
    answer: [
      'All personal data breaches must be reported **immediately** to the Franchise owner and to the Franchise Director at Head Office. If you become aware of or suspect a breach, don’t try to investigate it yourself, and carefully keep any evidence.',
      'If the breach is likely to result in a risk to people’s rights and freedoms (e.g. financial loss, breach of confidentiality, discrimination or reputational damage), the Franchise Owner must make sure the Information Commissioner’s Office is told without delay and **within 72 hours** of becoming aware of it. If it is likely to result in a high risk, the Franchise owner must also make sure all affected people are told directly and without undue delay.',
      'Notifications must include the categories and approximate number of people and records concerned, the Franchise owner’s name and contact details, the likely consequences, and the measures taken or proposed to deal with the breach.',
    ],
    keywords: ['data breach', 'ICO', '72 hours', 'lost data', 'security incident', 'report breach'],
    sources: [{ doc: 'gdpr-policy-2021', heading: 'Data Breach Notification' }],
  },
  {
    id: 'ops-gdpr-retention',
    topic: 'policies',
    question: 'How long can I keep personal data?',
    answer: [
      'No longer than is necessary for the purpose it was originally collected, held and processed for. When it is no longer needed, take all reasonable steps to erase or dispose of it without delay.',
      'When personal data is erased or disposed of for any reason (including copies no longer needed), it should be securely deleted and disposed of. If there is any uncertainty about the retention period for a type of data, the policy says to consult the Business Owner.',
    ],
    keywords: ['data retention', 'keep records', 'delete old data', 'disposal', 'shredding', 'GDPR'],
    sources: [
      { doc: 'gdpr-policy-2021', heading: 'Data Retention' },
      { doc: 'gdpr-policy-2021', heading: 'Data Security - Disposal' },
      { doc: 'gdpr-policy-2021', heading: 'Scope' },
    ],
  },
  {
    id: 'ops-gdpr-sending-storing',
    topic: 'policies',
    question: 'How should I send and store personal data securely?',
    answer: [
      '**Sending:** emails containing personal data must be sent from within the miServices email domain and marked “confidential”; personal data may only be transmitted over secure networks; hard copies should be passed directly to the recipient.',
      '**Storing:** electronic copies should be stored securely on the mobile service space dedicated to each Franchise, accessed by user login and password. Hard copies and removable media go in a locked box, drawer or cabinet. No personal data should be stored on any mobile device (laptop, tablet or smartphone) without the Franchise owner’s formal written approval, and none should be transferred to an employee’s personal device.',
      '**Day to day:** lock your computer screen if you leave it unattended while personal data is on view, don’t share data informally, and never write down or share passwords. Passwords must mix uppercase and lowercase letters, numbers and symbols and be changed regularly.',
    ],
    keywords: ['data security', 'email', 'confidential', 'passwords', 'storage', 'lock screen', 'GDPR'],
    sources: [
      { doc: 'gdpr-policy-2021', heading: 'Data Security - Transferring Personal Data and Communications' },
      { doc: 'gdpr-policy-2021', heading: 'Data Security - Storage' },
      { doc: 'gdpr-policy-2021', heading: 'Data Security - Use of Personal Data' },
      { doc: 'gdpr-policy-2021', heading: 'Data Security - IT Security' },
    ],
  },
  {
    id: 'ops-gdpr-direct-marketing',
    topic: 'policies',
    question: 'Can I send marketing emails or texts to customers?',
    answer: [
      'Electronic direct marketing (email, text messages and automated phone calls) needs the person’s prior consent, with one limited exception: you may send marketing texts or emails to a customer if their details were obtained in the course of a sale, the marketing relates to similar products or services, and they were given the chance to opt out when their details were first collected and in every later communication.',
      'The right to object to direct marketing must be offered clearly and kept separate from other information. If someone objects, comply promptly. The Franchise owner is responsible for making sure the right consent is in place and that nobody has opted out, whether directly or via a service such as the TPS.',
    ],
    keywords: ['direct marketing', 'consent', 'opt out', 'unsubscribe', 'TPS', 'newsletter', 'GDPR'],
    sources: [
      { doc: 'gdpr-policy-2021', heading: 'Direct Marketing' },
      { doc: 'gdpr-policy-2021', heading: 'Data Security - Use of Personal Data' },
    ],
  },
];
