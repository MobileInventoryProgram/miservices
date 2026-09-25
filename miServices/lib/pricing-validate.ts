import { BEDROOM_LABELS, SERVICE_TYPE_LABELS, SERVICE_TYPE_ORDER, BEDROOM_ORDER } from '@/lib/pricing';

/**
 * Validate a price list from the editor (franchise or admin). Returns the
 * cleaned fields ready to save, or a message to show the member.
 */
export interface PriceListInput {
  title: string;
  serviceRows: {
    _type: 'object';
    _key: string;
    serviceType: string;
    bedrooms: string;
    maxRooms: number;
    unfurnishedPrice: number;
    furnishedPrice?: number;
  }[];
  flatRates: { _type: 'object'; _key: string; name: string; price: number; unit?: string }[];
  additionalRoomRates: { unfurnishedPerRoom: number; furnishedPerRoom: number };
  cancellationFee: number;
}

const money = (value: unknown) => typeof value === 'number' && Number.isFinite(value) && value >= 0 && value < 100000;
const pence = (value: number) => Math.round(value * 100) / 100;

export function parsePriceListInput(body: unknown): { data?: PriceListInput; error?: string } {
  if (!body || typeof body !== 'object') return { error: 'Invalid request' };
  const input = body as Record<string, unknown>;

  const title = typeof input.title === 'string' ? input.title.trim().slice(0, 120) : '';
  if (!title) return { error: 'Please give the price list a name.' };

  if (!Array.isArray(input.serviceRows)) return { error: 'Invalid service prices.' };
  const seen = new Set<string>();
  const serviceRows: PriceListInput['serviceRows'] = [];
  for (const raw of input.serviceRows as Record<string, unknown>[]) {
    const serviceType = String(raw?.serviceType || '');
    const bedrooms = String(raw?.bedrooms || '');
    if (!(SERVICE_TYPE_ORDER as string[]).includes(serviceType)) return { error: `Unknown service "${serviceType}".` };
    if (!(BEDROOM_ORDER as string[]).includes(bedrooms)) return { error: `Unknown property size "${bedrooms}".` };
    const label = `${SERVICE_TYPE_LABELS[serviceType]} — ${BEDROOM_LABELS[bedrooms]}`;
    const key = `${serviceType}-${bedrooms}`;
    if (seen.has(key)) return { error: `${label} appears twice.` };
    seen.add(key);
    if (!money(raw.unfurnishedPrice)) return { error: `${label}: enter a price of £0 or more.` };
    if (raw.furnishedPrice != null && !money(raw.furnishedPrice)) return { error: `${label}: enter a furnished price of £0 or more.` };
    const maxRooms = Number(raw.maxRooms);
    serviceRows.push({
      _type: 'object',
      _key: key,
      serviceType,
      bedrooms,
      maxRooms: Number.isInteger(maxRooms) && maxRooms >= 0 && maxRooms <= 99 ? maxRooms : 0,
      unfurnishedPrice: pence(raw.unfurnishedPrice as number),
      ...(raw.furnishedPrice != null ? { furnishedPrice: pence(raw.furnishedPrice as number) } : {}),
    });
  }

  if (!Array.isArray(input.flatRates)) return { error: 'Invalid flat rates.' };
  const flatRates: PriceListInput['flatRates'] = [];
  (input.flatRates as Record<string, unknown>[]).forEach((raw, i) => {
    const name = typeof raw?.name === 'string' ? raw.name.trim().slice(0, 80) : '';
    if (!name && !raw?.price) return; // ignore blank rows left in the editor
    flatRates.push({
      _type: 'object',
      _key: typeof raw._key === 'string' && raw._key ? raw._key : `flat-${i}-${Date.now()}`,
      name,
      price: money(raw.price) ? pence(raw.price as number) : NaN,
      ...(typeof raw.unit === 'string' && raw.unit.trim() ? { unit: raw.unit.trim().slice(0, 40) } : {}),
    });
  });
  for (const rate of flatRates) {
    if (!rate.name) return { error: 'Every flat rate needs a name.' };
    if (!Number.isFinite(rate.price)) return { error: `${rate.name}: enter a price of £0 or more.` };
  }

  if (serviceRows.length === 0 && flatRates.length === 0) {
    return { error: 'Add at least one service price or flat rate.' };
  }

  const rooms = input.additionalRoomRates as Record<string, unknown> | undefined;
  if (!rooms || !money(rooms.unfurnishedPerRoom) || !money(rooms.furnishedPerRoom)) {
    return { error: 'Enter additional room rates of £0 or more.' };
  }
  if (!money(input.cancellationFee)) return { error: 'Enter a cancellation fee of £0 or more.' };

  return {
    data: {
      title,
      serviceRows,
      flatRates,
      additionalRoomRates: {
        unfurnishedPerRoom: pence(rooms.unfurnishedPerRoom as number),
        furnishedPerRoom: pence(rooms.furnishedPerRoom as number),
      },
      cancellationFee: pence(input.cancellationFee as number),
    },
  };
}
