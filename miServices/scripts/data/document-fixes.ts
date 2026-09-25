/**
 * Hand-checked fixes for the imported member documents, used by
 * scripts/standardise-member-documents.ts. The documents were converted from
 * PDFs, which flattened tables into "A — B" text rows and split some
 * sentences; each fix below was checked against the original PDF page.
 *
 * Blocks are matched by their text (after whitespace tidy-up): exactly, or by
 * its start for patterns of 8+ characters.
 */
import { newKey, type DocBlock, type DocTableBlock } from '../../lib/documents/standard';

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;

export interface DocumentFix {
  /** Replace blocks from the one starting `from` to the one starting `to` (or `count` blocks) */
  replace?: { from: string; to?: string; count?: number; with: DocBlock[] | ((blocks: Any[]) => Any[]) }[];
  /** Blocks that are the end of the previous paragraph, split off by the PDF layout */
  joinPrevious?: string[];
  /** Justified-text gaps imported as " — " inside a sentence */
  removeDashGaps?: string[];
  /** A line of labels under a photo: becomes the photo's caption */
  captionPreviousImage?: Record<string, string>;
  /** The import made whole paragraphs bold: make them plain */
  unboldParagraphs?: boolean;
  /** Final style for particular blocks, by their original text */
  style?: Record<string, 'h2' | 'h3' | 'normal' | 'remove'>;
  numberHeadings?: boolean;
}

export const table = (header: string[] | null, rows: string[][]): DocTableBlock => ({
  _type: 'table',
  _key: newKey(),
  headerRow: !!header,
  rows: [...(header ? [header] : []), ...rows].map((cells) => ({ _type: 'tableRow', _key: newKey(), cells })),
});

const text = (block: Any) => (block.children || []).map((c: Any) => c.text).join('').trim();
const split = (block: Any) => text(block).split(' — ').map((c: string) => c.trim());

/** Put captions on the images that follow a line of labels */
const captionImages = (captions: string[]) => (blocks: Any[]) => {
  const images = blocks.filter((b) => b._type === 'image');
  images.forEach((image, i) => {
    if (captions[i]) image.caption = captions[i];
  });
  return images;
};

export const DOCUMENT_FIXES: Record<string, DocumentFix> = {
  'gdpr-policy-2021': {
    numberHeadings: true,
    replace: [
      {
        // Definitions: a two-column layout, with some terms wrapped over lines
        from: '“consent” — means',
        to: 'personal data” — origin',
        with: (blocks) => {
          const rows: string[][] = [];
          for (const block of blocks) {
            const [term, meaning = ''] = split(block);
            if (term.startsWith('“') || rows.length === 0) rows.push([term, meaning]);
            else {
              const row = rows[rows.length - 1];
              row[0] = term === 'on”' ? row[0] + term : `${row[0]} ${term}`;
              row[1] = `${row[1]} ${meaning}`.trim();
            }
          }
          return [table(['Term', 'Meaning'], rows)];
        },
      },
      {
        from: 'Data Reference — Type of Data',
        to: 'Landlord — phone numbers',
        with: [
          table(
            ['Data reference', 'Type of data', 'Purpose of data'],
            [
              [
                'Staff recruitment',
                'Name, address, phone number, email, bank account number, National Insurance number',
                'HR requirements for undergoing recruitment processes and employment of successful candidates. (Ex. information needed for calculating tax, pension scheme ect)',
              ],
              [
                'Customer information',
                'Names, addresses of the branches, phone numbers, email addresses',
                'Data obtained from customers for communication purposes. Ability to contact customers regarding the service provided by us.',
              ],
              [
                'Tenant\nLandlord',
                'Names, addresses, phone numbers',
                'To obtain the information about property location and to inform when inventory/ mid term/check out visit will be taking place.',
              ],
            ]
          ),
        ],
      },
    ],
    joinPrevious: ['Company — can — demonstrate', 'Protection — Impact — Assessments', 'Officer, and — any — applicable', 'processing — of the personal data', 'marketing — including — email'],
    removeDashGaps: ['30.5. The — categories'],
  },

  'daily-operating-procedures': {
    replace: [{ from: 'Monday — 9am-5pm', to: 'Sunday — Optional', with: (blocks) => [table(['Day', 'Hours'], blocks.map(split))] }],
  },

  'employee-handbook': {
    numberHeadings: true,
    replace: [
      {
        from: 'FIRST — SECOND — THIRD',
        to: 'Gross misconduct — Dismissal',
        with: [
          table(
            ['Offence', 'First occasion', 'Second occasion', 'Third occasion', 'Fourth occasion'],
            [
              ['Unsatisfactory conduct', 'Formal verbal warning', 'Written warning', 'Final written warning', 'Dismissal'],
              ['Misconduct', 'Written warning', 'Final written warning', 'Dismissal', ''],
              ['Serious misconduct', 'Final written warning', 'Dismissal', '', ''],
              ['Gross misconduct', 'Dismissal', '', '', ''],
            ]
          ),
        ],
      },
    ],
  },

  'pre-contract-disclosure-document': {
    replace: [
      {
        from: 'iPhone — iPad — iPhone — iPad',
        to: 'with taking photos — damage if dropped',
        with: [
          table(
            ['iPhone advantages', 'iPad advantages', 'iPhone disadvantages', 'iPad disadvantages'],
            [
              [
                'Smaller, lighter, easier to carry',
                'Larger screen size, may be easier to use the app on screen',
                'If a call or notification comes through while you are using the app, the device can become a distraction',
                'Larger and heavier, can cause aching arms when carried for long periods',
              ],
              ['Easier to move device around small spaces to take photos', 'More durable', 'Battery may drain down quickly', 'Might not have a 4G link, reliant on Wi-fi or hotspot connection'],
              ['Comes with a 4G link, assists report upload', 'Will not be distracted by notifications / phone calls', 'Can run slower if too many apps are active', 'No camera flash'],
              ['May come with a camera flash, helps with taking photos of dim areas', 'Battery lasts longer', 'Less durable, will suffer more damage if dropped', ''],
            ]
          ),
        ],
      },
      {
        from: 'Item — For..',
        to: 'Toilet roll — Personal hygiene',
        with: (blocks) => [
          table(
            ['Item', 'For'],
            blocks.slice(1).map((block) =>
              text(block).startsWith('Device battery pack') ? ['Device battery pack (fully charged!)', 'Recharging device during the day'] : split(block)
            )
          ),
        ],
      },
    ],
  },

  'staff-appraisal': {
    numberHeadings: true,
    unboldParagraphs: true,
    replace: [
      {
        from: '1 – 3 poor — 7 – 9 good',
        to: '4 – 6 satisfactory',
        with: [
          table(
            ['Score', 'Meaning'],
            [
              ['1 – 3', 'Poor'],
              ['4 – 6', 'Satisfactory'],
              ['7 – 9', 'Good'],
              ['10', 'Excellent'],
            ]
          ),
        ],
      },
      {
        from: 'Appraisee’s name: — Appraiser’s Name:',
        to: 'Date of joining: — Appraisal review period:',
        with: [
          table(
            ['Appraisee', 'Appraiser'],
            [
              ['Name:', 'Name:'],
              ['Job title:', 'Date of meeting:'],
              ['Date of joining:', 'Appraisal review period:'],
            ]
          ),
        ],
      },
      {
        from: 'Key Skills — Rating — Comments',
        count: 1,
        with: [
          table(
            ['Key skills', 'Rating', 'Comments'],
            ['Job knowledge', 'Communication skills', 'Problem-solving skills', 'Initiative', 'Customer service skills', 'Attendance and time keeping'].map((skill) => [skill, '', ''])
          ),
        ],
      },
      { from: 'Overall performance — Rating Comments', count: 1, with: [table(['Overall performance', 'Rating', 'Comments'], [['', '', '']])] },
      { from: '1.', to: '5.', with: [table(['', 'Objective', 'Support needed'], ['1', '2', '3', '4', '5'].map((n) => [n, '', '']))] },
      {
        from: 'Signed by appraisee:',
        to: 'PRINT NAME: — DATE:',
        with: [
          table(
            ['Signed by', 'Print name', 'Date'],
            [
              ['Appraisee', '', ''],
              ['Appraiser', '', ''],
            ]
          ),
        ],
      },
    ],
    style: {
      'Staff Appraisal, Training and Development Documents': 'remove',
      'Signed by appraiser:': 'remove',
      'PRINT NAME: — DATE:': 'remove',
      'Staff Performance Appraisal Form: Guidance Notes for Appraisee': 'h2',
      'Performance Appraisal Form': 'h2',
      'Scoring Table': 'h3',
      'Performance Evaluation': 'h3',
      Review: 'h3',
      Objectives: 'h3',
      'What was particularly successful over the review period?': 'normal',
      'What were the areas for improvement?': 'normal',
      'Appraisee’s general comments:': 'normal',
      'Appraiser’s general comments:': 'normal',
    },
  },

  'company-vehicle-rules': {
    style: { 'FUEL ETC.': 'h2' },
    replace: [
      {
        from: 'SIGNATURE:',
        to: 'DATE:',
        with: [
          table(null, [
            ['Employee signature:', ''],
            ['Print name:', ''],
            ['Date:', ''],
          ]),
        ],
      },
    ],
  },

  'miprogram-guide': {
    replace: [{ from: 'Casement — Sash — Roof Velux', count: 4, with: captionImages(['Casement', 'Sash', 'Roof Velux']) }],
  },

  'aip-training-guide': {
    replace: [
      {
        from: 'Does — Does Not',
        to: '— Reporting on the cosmetics appearances',
        with: [
          table(
            ['Does', 'Does not'],
            [
              ['Condition statements', 'Pat testing/electrical safety tests'],
              ['Highlighting any defects', 'Gas safety tests'],
              ['Visual inspection of the property and its contents', 'Comment on the structural soundness of a property'],
              ['Reporting on the cosmetics appearances', 'The removal/moving around of carpets, floor coverings, large items etc.'],
            ]
          ),
        ],
      },
      // The key photos weren't carried over from the PDF, so their labels have nothing to caption
      { from: 'Yale Keys — Chubb Key', count: 1, with: [] },
    ],
    captionPreviousImage: { 'Meter Key — FB Kets — Star Key.': 'Meter key, FB keys and star key' },
  },
};
