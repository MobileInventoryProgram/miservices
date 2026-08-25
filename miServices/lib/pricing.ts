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
