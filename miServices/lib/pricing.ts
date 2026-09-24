/**
 * Pure pricing calculation functions.
 * No React, no Sanity client — framework-agnostic so these can be
 * reused by the editor UI, proposal generator, and flyer generator.
 */

// ─── Types (mirroring the Sanity shapes but kept standalone) ─────

export interface ServiceRow {
  serviceType: 'inventory' | 'combined' | 'checkout' | 'midterm' | 'checkin' | 'virtualTourBundle' | 'virtualTourFloorplan' | 'floorplan';
  bedrooms: 'studio_1' | '2' | '3' | '4' | '5' | '6';
  maxRooms: number;
  unfurnishedPrice: number;
  furnishedPrice?: number;
}

export interface FlatRate {
  name: string;
  price: number;
  unit?: string;
}

export interface AdditionalRoomRates {
  unfurnishedPerRoom: number;
  furnishedPerRoom: number;
}

export interface PriceList {
  serviceRows?: ServiceRow[];
  flatRates: FlatRate[];
  additionalRoomRates: AdditionalRoomRates;
  cancellationFee: number;
}

// ─── Labels ──────────────────────────────────────────────────────

export const SERVICE_TYPE_LABELS: Record<string, string> = {
  inventory: 'Inventory Only',
  combined: 'Combined Inventory & Check-in',
  checkout: 'Check Out',
  midterm: 'Mid Term Inspection',
  checkin: 'Separate Check In',
  virtualTourBundle: 'Virtual Tour, Floor Plan & Photography',
  virtualTourFloorplan: 'Virtual Tour & Floorplan',
  floorplan: 'Floorplan Only',
};

export const BEDROOM_LABELS: Record<string, string> = {
  studio_1: 'Studio / 1 Bed',
  '2': '2 Bed',
  '3': '3 Bed',
  '4': '4 Bed',
  '5': '5 Bed',
  '6': '6 Bed',
};

export const SERVICE_TYPE_ORDER: Array<ServiceRow['serviceType']> = [
  'inventory',
  'combined',
  'checkout',
  'midterm',
  'checkin',
  'virtualTourBundle',
  'virtualTourFloorplan',
  'floorplan',
];

export const BEDROOM_ORDER: Array<ServiceRow['bedrooms']> = [
  'studio_1',
  '2',
  '3',
  '4',
  '5',
  '6',
];

// ─── Duplication helper ─────────────────────────────────────────

/**
 * Apply a blanket percentage adjustment to a template's service rows,
 * returning new rows with baked-in (rounded) prices.
 *
 * Used when duplicating a template to create a franchisee-owned list.
 * After this, prices are stored directly — no runtime resolution needed.
 */
export function bakeAdjustedPrices(
  serviceRows: ServiceRow[],
  blanketAdjustment: number
): ServiceRow[] {
  if (blanketAdjustment === 0) {
    return serviceRows.map((row) => ({ ...row }));
  }

  const multiplier = 1 + blanketAdjustment / 100;
  return serviceRows.map((row) => ({
    ...row,
    unfurnishedPrice: Math.round(row.unfurnishedPrice * multiplier),
    furnishedPrice: row.furnishedPrice != null
      ? Math.round(row.furnishedPrice * multiplier)
      : undefined,
  }));
}

// ─── Leaflet (Pricing Documents) ────────────────────────────────

export interface LeafletRow {
  bedrooms: ServiceRow['bedrooms'];
  bedroomsLabel: string;
  maxRooms: number | null;
  unfurnished: number;
  furnished: number | null;
}

export interface LeafletSection {
  serviceType: ServiceRow['serviceType'];
  label: string;
  showMaxRooms: boolean;
  showFurnished: boolean;
  rows: LeafletRow[];
}

export interface LeafletData {
  title: string;
  sections: LeafletSection[];
  flatRates: FlatRate[];
  /** "Other Services" beside the tables; just "Services" on flat-rate-only lists */
  flatRatesHeading: string;
  additionalRoomRates: { unfurnishedPerRoom: number | null; furnishedPerRoom: number | null } | null;
  cancellationFee: number | null;
}

/**
 * Shape a price list for display on a leaflet. Shared by the HTML
 * leaflet and the PDF so both always show the same tables.
 */
export function buildLeafletData(priceList: {
  title: string;
  serviceRows?: ServiceRow[] | null;
  flatRates?: FlatRate[] | null;
  additionalRoomRates?: Partial<AdditionalRoomRates> | null;
  cancellationFee?: number | null;
}): LeafletData {
  const serviceRows = priceList.serviceRows || [];
  const unfurnishedPerRoom = priceList.additionalRoomRates?.unfurnishedPerRoom ?? null;
  const furnishedPerRoom = priceList.additionalRoomRates?.furnishedPerRoom ?? null;

  const sections: LeafletSection[] = [];
  for (const serviceType of SERVICE_TYPE_ORDER) {
    const rows = serviceRows
      .filter((row) => row.serviceType === serviceType)
      .sort((a, b) => BEDROOM_ORDER.indexOf(a.bedrooms) - BEDROOM_ORDER.indexOf(b.bedrooms));
    if (rows.length === 0) continue;

    sections.push({
      serviceType,
      label: SERVICE_TYPE_LABELS[serviceType],
      showMaxRooms: rows.some((row) => row.maxRooms > 0),
      showFurnished: rows.some((row) => row.furnishedPrice != null),
      rows: rows.map((row) => ({
        bedrooms: row.bedrooms,
        bedroomsLabel: BEDROOM_LABELS[row.bedrooms],
        maxRooms: row.maxRooms > 0 ? row.maxRooms : null,
        unfurnished: row.unfurnishedPrice,
        furnished: row.furnishedPrice ?? null,
      })),
    });
  }

  return {
    title: priceList.title,
    sections,
    flatRates: priceList.flatRates || [],
    flatRatesHeading: sections.length > 0 ? 'Other Services' : 'Services',
    additionalRoomRates:
      unfurnishedPerRoom != null || furnishedPerRoom != null
        ? { unfurnishedPerRoom, furnishedPerRoom }
        : null,
    cancellationFee: priceList.cancellationFee ?? null,
  };
}

/** £69 for whole pounds, £55.50 otherwise. */
export function formatPrice(amount: number): string {
  return Number.isInteger(amount)
    ? `£${amount.toLocaleString('en-GB')}`
    : `£${amount.toLocaleString('en-GB', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

/** File-safe name for a downloaded leaflet, e.g. "standard-pricing.pdf". */
export function leafletFilename(title: string): string {
  const slug = title
    .toLowerCase()
    .replace(/&/g, 'and')
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
  return `${slug || 'price-list'}.pdf`;
}
