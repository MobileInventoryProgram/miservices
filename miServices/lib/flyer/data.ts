import {
  buildLeafletData,
  formatPrice,
  type AdditionalRoomRates,
  type FlatRate,
  type ServiceRow,
} from '@/lib/pricing';

/**
 * Content model for A5 price flyers. Shared by the PDF (lib/flyer/pdf.tsx)
 * and the HTML flyer (components/pricing/flyer/), so both always match.
 */

// ─── Marketing copy (editable in Studio → Flyer Settings) ────────

export interface FlyerSellingPoint {
  prefix?: string;
  highlight: string;
  detail?: string;
}

export interface FlyerSettings {
  showOffer: boolean;
  offerEyebrow: string;
  offerHeadline: string;
  offerSmallPrint: string;
  introText: string;
  sellingPoints: FlyerSellingPoint[];
  bookingPhone: string;
  bookingEmail: string;
  bookingUrl: string;
  websiteNote: string;
  vatNote: string;
}

/** Wording from the original Illustrator leaflet; Studio values override these. */
export const DEFAULT_FLYER_SETTINGS: FlyerSettings = {
  showOffer: true,
  offerEyebrow: 'TRY US OUT TODAY',
  offerHeadline: 'First Inventory FREE*',
  offerSmallPrint: '*terms apply',
  introText:
    'miServices is a specialist inventory provider to the lettings industry. All of our clerks are trained to the same professional standard by the AIP. Using our own inventory app we are able to produce documents quickly and effectively.',
  sellingPoints: [
    { highlight: 'National coverage', detail: 'across the UK from 45+ regional offices.' },
    { highlight: 'Inventories', detail: 'signed digitally and seamlessly. No third-party apps.' },
    { highlight: 'Reports', detail: 'available next day.' },
    { highlight: 'Professional inventory clerks', detail: 'available Mon-Sat.' },
    { highlight: 'Last-minute bookings', detail: 'accepted.' },
    { prefix: 'Dedicated', highlight: 'customer support.' },
    { highlight: 'Outsource and/or use our software', detail: 'anytime.' },
  ],
  bookingPhone: '0345 680 7976',
  bookingEmail: 'booking@mobileinventory.co.uk',
  bookingUrl: 'www.mobileinventoryservices.co.uk/booking',
  websiteNote:
    'See further information about miServices, sample reports and our terms by visiting www.miservices.co.uk',
  vatNote: 'All prices are exclusive of VAT.',
};

// ─── Flyer content ───────────────────────────────────────────────

export type FlyerLayout = 'double' | 'single';

export interface FlyerPrice {
  label: string;
  price: string;
}

export interface FlyerCell {
  /** Main (unfurnished) price, or a flat rate */
  main: string;
  /** Furnished price, when shown alongside */
  sub?: string;
  /** Flat rates read "From £30" like the original leaflet */
  from?: boolean;
}

export interface FlyerTableRow {
  /** Bold part, e.g. "2" or "Studio / 1" */
  size: string;
  /** e.g. "(*9 rooms max)" */
  maxRooms: string | null;
  cells: FlyerCell[];
}

export interface FlyerTable {
  columns: string[];
  rows: FlyerTableRow[];
  /** Cells show "unfurnished / furnished" and need a key */
  dualPrices: boolean;
}

export interface FlyerData {
  title: string;
  hero: FlyerPrice | null;
  secondary: FlyerPrice[];
  table: FlyerTable | null;
  /** Flat rates that don't fit as table columns (or flat-rate-only lists) */
  extraRates: FlyerPrice[];
  furnishedNote: string | null;
  extraRoomNote: string | null;
  flyerNote: string | null;
  settings: FlyerSettings;
}

/** Short, flyer-style service names, as used on the original leaflet */
const FLYER_SERVICE_LABELS: Record<ServiceRow['serviceType'], string> = {
  inventory: 'Inventories',
  combined: 'Inventory & Check-ins',
  checkout: 'Check-outs',
  midterm: 'Mid-terms',
  checkin: 'Check-ins',
  virtualTourBundle: 'Virtual Tour, Floor Plan & Photos',
  virtualTourFloorplan: 'Virtual Tour & Floor Plan',
  floorplan: 'Floor Plans',
};

/** Services named in the furnished-uplift sentence */
const FURNISHED_NOTE_NAMES: Record<ServiceRow['serviceType'], string> = {
  inventory: 'inventory',
  combined: 'inventory and check-in',
  checkout: 'check-out',
  midterm: 'mid-term',
  checkin: 'check-in',
  virtualTourBundle: 'virtual tour',
  virtualTourFloorplan: 'virtual tour',
  floorplan: 'floor plan',
};

/** Table fits at most this many price columns before flat rates move below it */
const MAX_PRICE_COLUMNS = 4;

/** "Management/Property Visits" → "Management / Property Visits" so it can wrap */
function rateName(name: string): string {
  return name.replace(/\s*\/\s*/g, ' / ');
}

function rateLabel(rate: FlatRate): string {
  return rate.unit ? `${rateName(rate.name)} (${rate.unit})` : rateName(rate.name);
}

function joinWords(words: string[]): string {
  if (words.length <= 1) return words.join('');
  return `${words.slice(0, -1).join(', ')} and ${words[words.length - 1]}`;
}

export function buildFlyerData(
  priceList: {
    title: string;
    serviceRows?: ServiceRow[] | null;
    flatRates?: FlatRate[] | null;
    additionalRoomRates?: Partial<AdditionalRoomRates> | null;
    cancellationFee?: number | null;
    flyerNote?: string | null;
  },
  settings: FlyerSettings = DEFAULT_FLYER_SETTINGS
): FlyerData {
  const leaflet = buildLeafletData(priceList);
  const { sections, flatRates } = leaflet;

  // "From" prices: cheapest unfurnished price per service, then flat rates
  const fromPrices: FlyerPrice[] = [
    ...sections.map((section) => ({
      label: FLYER_SERVICE_LABELS[section.serviceType],
      price: formatPrice(Math.min(...section.rows.map((row) => row.unfurnished))),
    })),
    ...flatRates.map((rate) => ({ label: rateName(rate.name), price: formatPrice(rate.price) })),
  ];
  const [hero = null, ...rest] = fromPrices;
  const secondary = rest.slice(0, 3);

  // Furnished pricing: a single uplift becomes a note, otherwise show both prices
  const furnishedRows = sections.flatMap((section) =>
    section.rows
      .filter((row) => row.furnished != null)
      .map((row) => ({ serviceType: section.serviceType, diff: (row.furnished as number) - row.unfurnished }))
  );
  const uplifts = Array.from(new Set(furnishedRows.map((row) => row.diff)));
  const singleUplift = furnishedRows.length > 0 && uplifts.length === 1 ? uplifts[0] : null;
  const dualPrices = furnishedRows.length > 0 && singleUplift === null;

  let furnishedNote: string | null = null;
  if (singleUplift !== null && singleUplift > 0) {
    const names = Array.from(new Set(furnishedRows.map((row) => FURNISHED_NOTE_NAMES[row.serviceType])));
    furnishedNote = `The prices below are based on unfurnished properties. Please add ${formatPrice(
      singleUplift
    )} to all ${joinWords(names)} prices for all furnished properties.`;
  }

  // Table: bedroom sizes down the side, services (and flat rates if they fit) across
  let table: FlyerTable | null = null;
  let extraRates: FlyerPrice[] = [];

  if (sections.length > 0) {
    const flatColumns = sections.length + flatRates.length <= MAX_PRICE_COLUMNS ? flatRates : [];
    extraRates = flatRates
      .filter((rate) => !flatColumns.includes(rate))
      .map((rate) => ({ label: rateLabel(rate), price: formatPrice(rate.price) }));

    const sizes = Array.from(new Set(sections.flatMap((section) => section.rows.map((row) => row.bedrooms))));
    const hasMaxRooms = sections.some((section) => section.showMaxRooms);

    table = {
      columns: [
        ...sections.map((section) => FLYER_SERVICE_LABELS[section.serviceType]),
        ...flatColumns.map((rate) => rateName(rate.name)),
      ],
      dualPrices,
      rows: sizes.map((bedrooms) => {
        const rowsForSize = sections.map((section) => section.rows.find((row) => row.bedrooms === bedrooms));
        const label = rowsForSize.find(Boolean)?.bedroomsLabel || '';
        const maxRooms = rowsForSize.find((row) => row?.maxRooms)?.maxRooms ?? null;
        return {
          size: label.replace(/ Bed$/, ''),
          maxRooms: hasMaxRooms && maxRooms ? `(*${maxRooms} rooms max)` : null,
          cells: [
            ...rowsForSize.map((row): FlyerCell =>
              row
                ? {
                    main: formatPrice(row.unfurnished),
                    sub: dualPrices && row.furnished != null ? formatPrice(row.furnished) : undefined,
                  }
                : { main: '—' }
            ),
            ...flatColumns.map((rate): FlyerCell => ({ main: formatPrice(rate.price), from: true })),
          ],
        };
      }),
    };
  } else {
    // Flat-rate-only lists: the rates themselves are the price list
    extraRates = flatRates.map((rate) => ({ label: rateLabel(rate), price: formatPrice(rate.price) }));
  }

  // Additional rooms
  let extraRoomNote: string | null = null;
  const rates = leaflet.additionalRoomRates;
  if (rates?.unfurnishedPerRoom != null) {
    const star = table?.rows.some((row) => row.maxRooms) ? '*' : '';
    const furnished =
      rates.furnishedPerRoom != null && rates.furnishedPerRoom !== rates.unfurnishedPerRoom
        ? ` (${formatPrice(rates.furnishedPerRoom)} furnished)`
        : '';
    extraRoomNote = `${star}Properties with additional rooms will be charged at ${formatPrice(
      rates.unfurnishedPerRoom
    )}${furnished} extra per room.`;
  }
  if (leaflet.cancellationFee != null) {
    const fee = `Cancellation fee ${formatPrice(leaflet.cancellationFee)}.`;
    extraRoomNote = extraRoomNote ? `${extraRoomNote} ${fee}` : fee;
  }

  return {
    title: priceList.title,
    hero,
    secondary,
    table,
    extraRates,
    furnishedNote,
    extraRoomNote,
    flyerNote: priceList.flyerNote?.trim() || null,
    settings,
  };
}
