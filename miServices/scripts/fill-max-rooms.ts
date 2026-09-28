/**
 * Give price list rows with no max rooms (0) the standard room limits by
 * size: Studio/1 bed 8, 2 bed 9, 3 bed 10, 4 bed 11, 5 bed 12, 6 bed 13
 * (the same defaults the price list editor uses). Rows that already have a
 * limit are left alone, so it's safe to re-run.
 *
 *   npx tsx --env-file=.env scripts/fill-max-rooms.ts            # dry run
 *   npx tsx --env-file=.env scripts/fill-max-rooms.ts --write
 */
import { createClient } from '@sanity/client';

const STANDARD: Record<string, number> = { studio_1: 8, '2': 9, '3': 10, '4': 11, '5': 12, '6': 13 };
const write = process.argv.includes('--write');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a4q9j3x1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function main() {
  const lists = await client.fetch<{ _id: string; title: string; rows: { _key: string; bedrooms: string }[] }[]>(
    `*[_type == "priceList" && count(serviceRows[!defined(maxRooms) || maxRooms == 0]) > 0] | order(title asc) {
      _id, title, "rows": serviceRows[!defined(maxRooms) || maxRooms == 0] { _key, bedrooms }
    }`
  );
  if (!lists.length) {
    console.log('Every price list row already has a max rooms number.');
    return;
  }

  const tx = client.transaction();
  for (const list of lists) {
    const set: Record<string, number> = {};
    for (const row of list.rows) {
      if (STANDARD[row.bedrooms]) set[`serviceRows[_key=="${row._key}"].maxRooms`] = STANDARD[row.bedrooms];
    }
    console.log(`${list.title}: ${Object.keys(set).length} row(s)`);
    tx.patch(list._id, (p) => p.set(set));
  }
  if (!write) {
    console.log('\nDry run. Re-run with --write to save.');
    return;
  }
  await tx.commit();
  console.log('\nDone.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
