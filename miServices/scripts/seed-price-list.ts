/**
 * Seed price lists into Sanity.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/seed-price-list.ts
 */
import { createClient } from '@sanity/client';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a4q9j3x1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

type ServiceType = 'inventory' | 'combined' | 'checkout' | 'midterm' | 'checkin' | 'virtualTourBundle' | 'virtualTourFloorplan' | 'floorplan';
type Bedrooms = 'studio_1' | '2' | '3' | '4' | '5' | '6';

function row(
  serviceType: ServiceType,
  bedrooms: Bedrooms,
  maxRooms: number,
  unfurnishedPrice: number,
  furnishedPrice?: number
) {
  return {
    _type: 'object' as const,
    _key: `${serviceType}-${bedrooms}`,
    serviceType,
    bedrooms,
    maxRooms,
    unfurnishedPrice,
    ...(furnishedPrice != null ? { furnishedPrice } : {}),
  };
}

function flat(key: string, name: string, price: number, unit?: string) {
  return {
    _type: 'object' as const,
    _key: key,
    name,
    price,
    ...(unit ? { unit } : {}),
  };
}

function terms(text: string, key: string = 'terms-block') {
  return [
    {
      _type: 'block',
      _key: key,
      style: 'normal',
      markDefs: [],
      children: [
        {
          _type: 'span',
          _key: `${key}-span`,
          text,
          marks: [],
        },
      ],
    },
  ];
}

interface SeedPriceList {
  _type: 'priceList';
  title: string;
  isDefault: boolean;
  availableToFranchisees: boolean;
  serviceRows: ReturnType<typeof row>[];
  flatRates: ReturnType<typeof flat>[];
  additionalRoomRates?: {
    unfurnishedPerRoom: number;
    furnishedPerRoom?: number;
  };
  cancellationFee?: number;
  terms: ReturnType<typeof terms>;
}

// ─── Price Lists ────────────────────────────────────────────────

const PRICE_LISTS: SeedPriceList[] = [
  // 1. Standard Pricing (existing — updated)
  {
    _type: 'priceList' as const,
    title: 'Standard Pricing',
    isDefault: true,
    availableToFranchisees: true,
    serviceRows: [
      row('inventory', 'studio_1', 8, 69, 81),
      row('inventory', '2', 9, 80, 93),
      row('inventory', '3', 10, 92, 104),
      row('inventory', '4', 11, 105, 118),
      row('inventory', '5', 12, 122, 135),
      row('combined', 'studio_1', 8, 104, 116),
      row('combined', '2', 9, 118, 131),
      row('combined', '3', 10, 138, 150),
      row('combined', '4', 11, 156, 168),
      row('combined', '5', 12, 181, 193),
      row('checkout', 'studio_1', 8, 62, 74),
      row('checkout', '2', 9, 67, 80),
      row('checkout', '3', 10, 81, 93),
      row('checkout', '4', 11, 92, 104),
      row('checkout', '5', 12, 105, 118),
    ],
    flatRates: [
      flat('management-property-visits', 'Management/Property Visits', 47, 'per visit'),
    ],
    additionalRoomRates: {
      unfurnishedPerRoom: 9,
      furnishedPerRoom: 13,
    },
    cancellationFee: 45,
    terms: terms(
      'All prices exclude VAT at the prevailing rate. Bookings cancelled with less than 24 hours notice or jobs aborted on the day may be subject to a cancellation fee of \u00A345.'
    ),
  },

  // 2. OpenRent Pricing
  {
    _type: 'priceList' as const,
    title: 'OpenRent Pricing',
    isDefault: false,
    availableToFranchisees: true,
    serviceRows: [
      row('inventory', 'studio_1', 0, 44, 44),
      row('inventory', '2', 0, 52, 52),
      row('inventory', '3', 0, 60, 60),
      row('inventory', '4', 0, 68, 68),
      row('inventory', '5', 0, 80, 80),
      row('combined', 'studio_1', 0, 68, 68),
      row('combined', '2', 0, 72, 72),
      row('combined', '3', 0, 84, 84),
      row('combined', '4', 0, 96, 96),
      row('combined', '5', 0, 108, 108),
      row('checkout', 'studio_1', 0, 40, 40),
      row('checkout', '2', 0, 44, 44),
      row('checkout', '3', 0, 52, 52),
      row('checkout', '4', 0, 60, 60),
      row('checkout', '5', 0, 68, 68),
    ],
    flatRates: [
      flat('management-property-visits', 'Management/Property Visits', 40),
    ],
    cancellationFee: 40,
    terms: terms(
      '20% management and usage fee deducted. Prices exclusive of VAT. Cancellation fee charged if cancelled after 5pm.'
    ),
  },

  // 3. HCGB & Vonder Pricing
  {
    _type: 'priceList' as const,
    title: 'HCGB & Vonder Pricing',
    isDefault: false,
    availableToFranchisees: true,
    serviceRows: [],
    flatRates: [
      flat('inventory-checkin', 'Inventory/Inventory and Check-in', 64),
      flat('checkout', 'Check Out', 52),
    ],
    cancellationFee: 32,
    terms: terms(
      '20% management/usage fee/Franchise Fee for centrally managed accounts deducted already. New price list from 1st June 2023.'
    ),
  },

  // 4. Freshwater 2024 Pricing
  {
    _type: 'priceList' as const,
    title: 'Freshwater 2024 Pricing',
    isDefault: false,
    availableToFranchisees: true,
    serviceRows: [
      row('inventory', 'studio_1', 0, 62),
      row('inventory', '2', 0, 67),
      row('inventory', '3', 0, 78),
      row('inventory', '4', 0, 90),
      row('inventory', '5', 0, 101),
      row('combined', 'studio_1', 0, 78),
      row('combined', '2', 0, 90),
      row('combined', '3', 0, 90),
      row('combined', '4', 0, 112),
      row('combined', '5', 0, 112),
      row('checkout', 'studio_1', 0, 56),
      row('checkout', '2', 0, 62),
      row('checkout', '3', 0, 73),
      row('checkout', '4', 0, 84),
      row('checkout', '5', 0, 95),
    ],
    flatRates: [
      flat('management-property-visits', 'Management/Property Visits', 45),
      flat('key-postage', 'Key Postage', 8),
    ],
    additionalRoomRates: {
      unfurnishedPerRoom: 6,
    },
    cancellationFee: 45,
    terms: terms(
      'Franchisees to invoice @ 80%. Partly furnished +\u00A36 on unfurnished rate. All prices subject to VAT. Cancelled after 5pm previous working day = \u00A345 fee.'
    ),
  },

  // 5. David Tomlinson Pricing
  {
    _type: 'priceList' as const,
    title: 'David Tomlinson Pricing',
    isDefault: false,
    availableToFranchisees: true,
    serviceRows: [
      row('inventory', 'studio_1', 0, 55.50),
      row('inventory', '2', 0, 64),
      row('inventory', '3', 0, 72.50),
      row('inventory', '4', 0, 78),
      row('inventory', '5', 0, 84),
      row('combined', 'studio_1', 0, 84),
      row('combined', '2', 0, 94.50),
      row('combined', '3', 0, 105.50),
      row('combined', '4', 0, 122.50),
      row('combined', '5', 0, 139.50),
      row('checkout', 'studio_1', 0, 44.50),
      row('checkout', '2', 0, 50),
      row('checkout', '3', 0, 55.50),
      row('checkout', '4', 0, 61),
      row('checkout', '5', 0, 72.50),
    ],
    flatRates: [
      flat('midterms', 'Mid Terms', 28),
    ],
    additionalRoomRates: {
      unfurnishedPerRoom: 8,
    },
    terms: terms(
      'Prices based on unfurnished. Add \u00A312 for furnished. Prices exclusive of VAT.'
    ),
  },

  // 6. National Home Move Pricing
  {
    _type: 'priceList' as const,
    title: 'National Home Move Pricing',
    isDefault: false,
    availableToFranchisees: true,
    serviceRows: [
      row('inventory', 'studio_1', 0, 53.50),
      row('inventory', '2', 0, 61.50),
      row('inventory', '3', 0, 69.50),
      row('inventory', '4', 0, 75),
      row('inventory', '5', 0, 80.50),
      row('combined', 'studio_1', 0, 80.50),
      row('combined', '2', 0, 91),
      row('combined', '3', 0, 101.50),
      row('combined', '4', 0, 118),
      row('combined', '5', 0, 134),
      row('checkout', 'studio_1', 0, 43),
      row('checkout', '2', 0, 48),
      row('checkout', '3', 0, 53.50),
      row('checkout', '4', 0, 59),
      row('checkout', '5', 0, 69.50),
    ],
    flatRates: [
      flat('midterms', 'Mid Terms', 27),
    ],
    additionalRoomRates: {
      unfurnishedPerRoom: 7.50,
    },
    terms: terms(
      'Prices based on unfurnished. Add \u00A311 for furnished. Prices exclusive of VAT.'
    ),
  },

  // 7. Northern Pricing 2025
  {
    _type: 'priceList' as const,
    title: 'Northern Pricing 2025',
    isDefault: false,
    availableToFranchisees: true,
    serviceRows: [
      row('inventory', 'studio_1', 0, 66),
      row('inventory', '2', 0, 77),
      row('inventory', '3', 0, 88),
      row('inventory', '4', 0, 101),
      row('inventory', '5', 0, 117.50),
      row('combined', 'studio_1', 0, 100),
      row('combined', '2', 0, 113.50),
      row('combined', '3', 0, 132.50),
      row('combined', '4', 0, 150),
      row('combined', '5', 0, 174),
      row('checkout', 'studio_1', 0, 59.50),
      row('checkout', '2', 0, 64.50),
      row('checkout', '3', 0, 77.50),
      row('checkout', '4', 0, 88),
      row('checkout', '5', 0, 101),
    ],
    flatRates: [
      flat('midterms', 'Mid Terms', 30),
    ],
    additionalRoomRates: {
      unfurnishedPerRoom: 8,
    },
    terms: terms(
      'Prices based on unfurnished. Add \u00A312 for furnished. Additional rooms \u00A38 (\u00A312 if furnished). Prices exclusive of VAT.'
    ),
  },

  // 8. Southern Pricing
  {
    _type: 'priceList' as const,
    title: 'Southern Pricing',
    isDefault: false,
    availableToFranchisees: true,
    serviceRows: [
      row('inventory', 'studio_1', 0, 67),
      row('inventory', '2', 0, 78),
      row('inventory', '3', 0, 88),
      row('inventory', '4', 0, 100),
      row('inventory', '5', 0, 117),
      row('combined', 'studio_1', 0, 95),
      row('combined', '2', 0, 107),
      row('combined', '3', 0, 116),
      row('combined', '4', 0, 128),
      row('combined', '5', 0, 145),
      row('checkout', 'studio_1', 0, 56),
      row('checkout', '2', 0, 67),
      row('checkout', '3', 0, 78),
      row('checkout', '4', 0, 89),
      row('checkout', '5', 0, 101),
    ],
    flatRates: [
      flat('midterms', 'Mid Terms', 28),
    ],
    additionalRoomRates: {
      unfurnishedPerRoom: 6,
    },
    terms: terms(
      'Prices based on unfurnished. Add \u00A312 for furnished. Prices exclusive of VAT.'
    ),
  },

  // 9. Countrywide Pricing
  {
    _type: 'priceList' as const,
    title: 'Countrywide Pricing',
    isDefault: false,
    availableToFranchisees: true,
    serviceRows: [],
    flatRates: [
      flat('inventories', 'Inventories (up to 4 bed)', 77),
      flat('checkouts', 'Check-outs (up to 4 bed)', 67),
      flat('management-visits', 'Management Visits', 43),
    ],
    additionalRoomRates: {
      unfurnishedPerRoom: 7,
    },
    terms: terms(
      'Flat fee agreed at national level with Countrywide. Max 11 rooms. Additional rooms \u00A37 per room. Prices exclusive of VAT.'
    ),
  },

  // 10. Slater Hogg & Howison Pricing
  {
    _type: 'priceList' as const,
    title: 'Slater Hogg & Howison Pricing',
    isDefault: false,
    availableToFranchisees: true,
    serviceRows: [
      row('inventory', 'studio_1', 0, 59),
      row('inventory', '2', 0, 70),
      row('inventory', '3', 0, 80),
      row('inventory', '4', 0, 91),
      row('inventory', '5', 0, 107),
      row('combined', 'studio_1', 0, 90),
      row('combined', '2', 0, 103),
      row('combined', '3', 0, 120),
      row('combined', '4', 0, 137),
      row('combined', '5', 0, 158),
      row('checkout', 'studio_1', 0, 53.50),
      row('checkout', '2', 0, 59),
      row('checkout', '3', 0, 70),
      row('checkout', '4', 0, 80),
      row('checkout', '5', 0, 91),
    ],
    flatRates: [
      flat('midterms', 'Mid Terms', 27),
    ],
    additionalRoomRates: {
      unfurnishedPerRoom: 5.50,
    },
    cancellationFee: 40,
    terms: terms(
      'Prices based on unfurnished. Add \u00A311 for furnished. Additional mileage fee may apply. Prices exclusive of VAT.'
    ),
  },

  // 11. The Online Letting Agent Pricing
  {
    _type: 'priceList' as const,
    title: 'The Online Letting Agent Pricing',
    isDefault: false,
    availableToFranchisees: true,
    serviceRows: [
      row('inventory', 'studio_1', 0, 59),
      row('inventory', '2', 0, 70),
      row('inventory', '3', 0, 80),
      row('inventory', '4', 0, 91),
      row('inventory', '5', 0, 107),
      row('combined', 'studio_1', 0, 90),
      row('combined', '2', 0, 103),
      row('combined', '3', 0, 120),
      row('combined', '4', 0, 137),
      row('combined', '5', 0, 158),
      row('checkout', 'studio_1', 0, 53.50),
      row('checkout', '2', 0, 59),
      row('checkout', '3', 0, 70),
      row('checkout', '4', 0, 80),
      row('checkout', '5', 0, 91),
    ],
    flatRates: [
      flat('midterms', 'Mid Terms', 27),
    ],
    additionalRoomRates: {
      unfurnishedPerRoom: 5.50,
    },
    cancellationFee: 40,
    terms: terms(
      'Prices based on unfurnished. Add \u00A311 for furnished. Cancellation fee \u00A340. Prices exclusive of VAT.'
    ),
  },

  // 12. Virtual Tours, Floor Plans & Photography
  {
    _type: 'priceList' as const,
    title: 'Virtual Tours, Floor Plans & Photography',
    isDefault: false,
    availableToFranchisees: true,
    serviceRows: [
      row('virtualTourBundle', '2', 0, 115),
      row('virtualTourBundle', '3', 0, 125),
      row('virtualTourBundle', '4', 0, 135),
      row('virtualTourBundle', '5', 0, 145),
      row('virtualTourFloorplan', '2', 0, 110),
      row('virtualTourFloorplan', '3', 0, 120),
      row('virtualTourFloorplan', '4', 0, 130),
      row('virtualTourFloorplan', '5', 0, 140),
      row('floorplan', '2', 0, 45),
      row('floorplan', '3', 0, 50),
      row('floorplan', '4', 0, 55),
      row('floorplan', '5', 0, 60),
    ],
    flatRates: [],
    terms: terms(
      'Virtual tours include 3 months hosting. Extra months \u00A37.50+VAT. Photos from virtual tour in high resolution. All prices +VAT.'
    ),
  },
];

async function seed() {
  console.log('Seeding price lists...\n');

  for (const list of PRICE_LISTS) {
    const existing = await client.fetch(
      `*[_type == "priceList" && title == $title && !defined(owner)][0]._id`,
      { title: list.title }
    );

    if (existing) {
      console.log(`  "${list.title}" already exists — updating...`);
      const { _type, ...patch } = list;
      await client.patch(existing).set(patch).commit();
      console.log(`  Updated.`);
    } else {
      await client.create(list);
      console.log(`  Created "${list.title}".`);
    }
  }

  // Clean up the slug field from old documents if present
  const withSlug = await client.fetch(
    `*[_type == "priceList" && defined(slug)]._id`
  );
  if (withSlug.length > 0) {
    console.log(`\n  Removing slug from ${withSlug.length} document(s)...`);
    for (const id of withSlug) {
      await client.patch(id).unset(['slug']).commit();
    }
    console.log('  Done.');
  }

  console.log('\nDone!');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
