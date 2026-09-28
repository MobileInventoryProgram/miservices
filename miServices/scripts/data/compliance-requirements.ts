import type { ComplianceCategory, ComplianceEvidence, ComplianceFrequency } from '../../lib/compliance/options';

/**
 * Starter compliance requirements, from the Members Area documents (mainly the
 * Pre-contract Disclosure Document and the Daily Operating Procedures). Seeded
 * by scripts/seed-compliance.ts; Head Office edits them in the Members Area.
 * Descriptions only restate what the documents say.
 */
export interface SeedRequirement {
  /** Stable id: becomes complianceRequirement-<id> */
  id: string;
  title: string;
  description: string;
  category: ComplianceCategory;
  frequency: ComplianceFrequency;
  evidence: ComplianceEvidence;
  askExpiry?: boolean;
  dueWithinDays?: number;
  monthlyDay?: number;
  monthOffset?: boolean;
  /** Exact heading text in the document (omit for the whole document) */
  sources: { doc: string; heading?: string }[];
}

const PCDD = 'pre-contract-disclosure-document';
const DOP = 'daily-operating-procedures';

export const COMPLIANCE_REQUIREMENTS: SeedRequirement[] = [
  // Setting up
  {
    id: 'limited-company',
    title: 'Trading as a limited company',
    description:
      'All franchises operate as limited companies. The company name cannot include the words Mobile Inventory or miServices. Upload your certificate of incorporation (showing the company number).',
    category: 'setup',
    frequency: 'once',
    evidence: 'upload',
    dueWithinDays: 30,
    sources: [{ doc: PCDD, heading: 'Forming a limited company' }],
  },
  {
    id: 'business-bank-account',
    title: 'Business bank account in the company name',
    description: "A business bank account in your limited company's name (for example Fred Bloggs Limited).",
    category: 'setup',
    frequency: 'once',
    evidence: 'confirm',
    dueWithinDays: 30,
    sources: [{ doc: PCDD, heading: 'Bank accounts' }],
  },
  {
    id: 'franchise-agreement',
    title: 'Franchise agreement signed',
    description: 'Your obligations and responsibilities are mainly listed in sections 7–17 of the franchise agreement.',
    category: 'setup',
    frequency: 'once',
    evidence: 'admin',
    sources: [{ doc: PCDD, heading: 'Overview of your responsibilities' }],
  },
  {
    id: 'quickbooks',
    title: 'QuickBooks set up',
    description: 'All franchisees must use QuickBooks (basic package) for invoicing and bookkeeping.',
    category: 'setup',
    frequency: 'once',
    evidence: 'confirm',
    dueWithinDays: 30,
    sources: [
      { doc: PCDD, heading: 'Invoicing' },
      { doc: DOP, heading: 'Operational and financial reporting' },
    ],
  },
  {
    id: 'servicem8',
    title: 'ServiceM8 set up',
    description:
      'All franchise owners use ServiceM8 to receive centrally managed jobs. If you employ any staff you need your own subscription; if you work alone you can be added to Head Office’s ServiceM8.',
    category: 'setup',
    frequency: 'once',
    evidence: 'confirm',
    dueWithinDays: 30,
    sources: [{ doc: DOP, heading: 'Service M8' }],
  },
  {
    id: 'google-workspace',
    title: 'Google Workspace account',
    description: 'Your Google account is set up by Head Office and gives access to the Franchise Owners Drive.',
    category: 'setup',
    frequency: 'once',
    evidence: 'admin',
    sources: [{ doc: DOP, heading: 'Google Workspace' }],
  },
  {
    id: 'voicemail',
    title: 'Voicemail turned on',
    description: 'Your voicemail is turned on and introduces you as Mobile Inventory Services.',
    category: 'setup',
    frequency: 'once',
    evidence: 'confirm',
    dueWithinDays: 30,
    sources: [{ doc: DOP, heading: 'Voicemail requirement' }],
  },
  {
    id: 'inventory-kit',
    title: 'Inventory kit complete',
    description: 'You have put together an inventory kit containing all the items on the list.',
    category: 'setup',
    frequency: 'once',
    evidence: 'confirm',
    dueWithinDays: 30,
    sources: [{ doc: PCDD, heading: 'Initial things you need' }],
  },
  {
    id: 'uniform-id',
    title: 'Uniform and ID card',
    description: 'All staff wear company-branded uniform on the job, ordered only from miServices, and each clerk has an ID card.',
    category: 'setup',
    frequency: 'once',
    evidence: 'confirm',
    dueWithinDays: 30,
    sources: [
      { doc: PCDD, heading: 'Uniforms' },
      { doc: 'ordering-uniforms', heading: 'Standardisation of uniforms' },
    ],
  },
  {
    id: 'website-profile',
    title: 'Website profile set up',
    description: 'Your profile page on the miServices website (Our Network) is set up with Head Office.',
    category: 'setup',
    frequency: 'once',
    evidence: 'admin',
    sources: [{ doc: 'marketing-procedures', heading: 'Your website profile' }],
  },

  // Training
  {
    id: 'initial-training',
    title: 'Initial AIP training passed',
    description: 'Initial training completed, including the multiple choice test where at least 90% is needed to pass.',
    category: 'training',
    frequency: 'once',
    evidence: 'admin',
    sources: [
      { doc: PCDD, heading: 'Initial training programme' },
      { doc: PCDD, heading: 'Scheduling initial training' },
    ],
  },
  {
    id: 'sales-training',
    title: 'Sales training completed',
    description: 'A senior member of the Head Office sales team spends 2 days with you in your area cold calling agents.',
    category: 'training',
    frequency: 'once',
    evidence: 'admin',
    sources: [{ doc: 'sales-procedures', heading: 'We’ll come out with you' }],
  },

  // Insurance & legal
  {
    id: 'insurance',
    title: 'Compulsory insurance',
    description:
      'All-risk insurance including employer’s and public liability, professional indemnity, property damage (including equipment and vehicles) and data protection & cyber security. Upload your certificate or schedule and its expiry date; a copy of each annual renewal is expected every year.',
    category: 'insurance',
    frequency: 'annual',
    evidence: 'upload',
    askExpiry: true,
    dueWithinDays: 30,
    sources: [{ doc: PCDD, heading: 'Compulsory insurance cover' }],
  },

  // Data protection
  {
    id: 'gdpr-policy',
    title: 'GDPR policy completed and signed',
    description: 'The GDPR policy completed with your limited company’s details, signed and dated, with a review date.',
    category: 'data',
    frequency: 'once',
    evidence: 'upload',
    dueWithinDays: 60,
    sources: [{ doc: 'gdpr-policy-2021', heading: 'Implementation of Policy' }],
  },
  {
    id: 'edi-policy',
    title: 'Equality, Diversity and Inclusion policy completed',
    description: 'The Equality, Diversity and Inclusion policy completed with your limited company’s name.',
    category: 'data',
    frequency: 'once',
    evidence: 'upload',
    dueWithinDays: 60,
    sources: [{ doc: 'equality-diversity-and-inclusion-policy' }],
  },

  // Monthly reporting
  {
    id: 'monthly-turnover',
    title: 'Monthly turnover report',
    description:
      'Report your turnover for the month to Head Office: share the spreadsheet with all jobs for the month, or send QuickBooks “Summary by Customer” reports. Include details of any new customers.',
    category: 'reporting',
    frequency: 'monthly',
    evidence: 'upload',
    monthlyDay: 0,
    sources: [
      { doc: DOP, heading: 'Operational and financial reporting' },
      { doc: DOP, heading: 'Customers’ information' },
    ],
  },
  {
    id: 'central-invoices',
    title: 'Centrally managed work invoiced',
    description:
      'One invoice per customer for all centrally managed jobs in the month, sent to miServices no later than 30 days after the month the job was completed. Invoices arriving after the deadline will not be paid.',
    category: 'reporting',
    frequency: 'monthly',
    evidence: 'confirm',
    monthlyDay: 0,
    monthOffset: true,
    sources: [{ doc: DOP, heading: 'Invoicing' }],
  },

  // Fees (Head Office marks paid)
  {
    id: 'monthly-fees',
    title: 'Monthly franchise fee and subscriptions paid',
    description: 'The set monthly payment in your agreement’s payment schedule, and monthly subscriptions paid by Head Office on your behalf.',
    category: 'fees',
    frequency: 'monthly',
    evidence: 'admin',
    monthlyDay: 0,
    sources: [{ doc: PCDD, heading: 'Fees' }],
  },
  {
    id: 'annual-fees',
    title: 'Annual fees paid',
    description: 'Annual fees for things Head Office pays for on your behalf, such as your Google Workspace email account.',
    category: 'fees',
    frequency: 'annual',
    evidence: 'admin',
    sources: [{ doc: PCDD, heading: 'Fees' }],
  },
  {
    id: 'initial-fees',
    title: 'Initial and documentation fees paid',
    description: 'The initial franchise fee and the documentation fee.',
    category: 'fees',
    frequency: 'once',
    evidence: 'admin',
    sources: [{ doc: PCDD, heading: 'Fees' }],
  },

  // Operations & standards (confirmed each year)
  {
    id: 'operating-hours',
    title: 'Operating hours',
    description: 'You are operational on weekdays between 9am and 5pm.',
    category: 'standards',
    frequency: 'ongoing',
    evidence: 'confirm',
    dueWithinDays: 30,
    sources: [{ doc: DOP, heading: 'Required days & hours of operation' }],
  },
  {
    id: 'complaints-register',
    title: 'Complaints recorded and serious ones passed on',
    description:
      'All complaints are recorded and stored for audit purposes. Complaints of a serious nature are passed to the central office immediately.',
    category: 'standards',
    frequency: 'ongoing',
    evidence: 'confirm',
    dueWithinDays: 30,
    sources: [{ doc: DOP, heading: 'Customer complaints procedure' }],
  },
  {
    id: 'crm',
    title: 'CRM kept up to date',
    description: 'Customer and potential customer details are put into the CRM when you first get them.',
    category: 'standards',
    frequency: 'ongoing',
    evidence: 'confirm',
    dueWithinDays: 30,
    sources: [{ doc: 'sales-procedures', heading: 'Using the CRM' }],
  },
  {
    id: 'brand-guidelines',
    title: 'Brand guidelines followed',
    description: 'All marketing keeps to the brand guidelines, and larger campaigns are approved by the central office first.',
    category: 'standards',
    frequency: 'ongoing',
    evidence: 'confirm',
    dueWithinDays: 30,
    sources: [{ doc: 'marketing-procedures', heading: 'Brand guidelines' }],
  },
  {
    id: 'staff-trained',
    title: 'Staff trained before live work',
    description: 'Staff and subcontractors complete AIP training and are never used on live jobs until Head Office is satisfied they are trained.',
    category: 'standards',
    frequency: 'ongoing',
    evidence: 'confirm',
    dueWithinDays: 30,
    sources: [{ doc: PCDD, heading: 'Staff training' }],
  },
  {
    id: 'holiday-cover',
    title: 'Holidays notified and covered',
    description: 'Both head offices are told about holidays as soon as possible (ideally 6 weeks ahead), and a replacement is arranged to cover the work.',
    category: 'standards',
    frequency: 'ongoing',
    evidence: 'confirm',
    dueWithinDays: 30,
    sources: [{ doc: DOP, heading: 'Holidays and days off' }],
  },
  {
    id: 'openrent-rules',
    title: 'OpenRent rules followed',
    description: 'OpenRent jobs are accepted within 24 hours, and there is no direct business with OpenRent landlords.',
    category: 'standards',
    frequency: 'ongoing',
    evidence: 'confirm',
    dueWithinDays: 30,
    sources: [{ doc: 'openrent-procedures', heading: 'OpenRent' }],
  },
  {
    id: 'gdpr-controls',
    title: 'Data protection followed',
    description: 'Personal data is handled as the GDPR policy sets out, including records of processing and reporting any breach immediately.',
    category: 'standards',
    frequency: 'ongoing',
    evidence: 'confirm',
    dueWithinDays: 30,
    sources: [
      { doc: 'gdpr-policy-2021', heading: 'Accountability and Record-Keeping' },
      { doc: 'gdpr-policy-2021', heading: 'Data Breach Notification' },
    ],
  },
];
