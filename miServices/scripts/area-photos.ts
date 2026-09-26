/**
 * Sets each franchise's Area photo (a landmark or view of its area) from Pexels.
 * Pexels photos are free for commercial use and need no credit.
 *
 * Never replaces an area photo that's already set (e.g. one a franchise uploaded
 * in Edit Profile) unless run with --force.
 *
 *   npx tsx --env-file=.env scripts/area-photos.ts [--force] [--only <slug>]
 *
 * Needs PEXELS_API_KEY and SANITY_API_TOKEN in .env.
 */
import { createClient } from '@sanity/client';

// [franchise slug, Pexels photo ID, what the photo shows]
const PHOTOS: [string, number, string][] = [
  ['head-office', 37919942, 'Eastgate Street and the Eastgate Clock, Chester'],
  ['west-cheshire-and-wirral', 37944221, 'The Old Dee Bridge over the River Dee, Chester'],
  ['bath-and-swindon', 15799024, 'Pulteney Bridge over the River Avon, Bath'],
  ['birmingham', 31270291, 'Selfridges building at the Bullring, Birmingham'],
  ['brighton', 2673227, 'Brighton Palace Pier'],
  ['bristol', 9537393, 'Clifton Suspension Bridge over the Avon Gorge, Bristol'],
  ['dorset', 10443152, 'Durdle Door on the Jurassic Coast, Dorset'],
  ['dundee', 7911508, 'V&A Dundee on the River Tay waterfront'],
  ['east-kent', 38088299, 'Canterbury Cathedral above the city walls'],
  ['essex', 38735974, 'Sunset over Southend-on-Sea and its pier'],
  ['glasgow-central', 10569130, 'University of Glasgow and the West End skyline'],
  ['herts', 6678844, 'St Albans Cathedral at sunset'],
  ['kingston', 10550652, "The 'Out of Order' telephone box sculpture, Kingston upon Thames"],
  ['lancashire', 16065708, 'The Atom panopticon above Wycoller, Pendle'],
  ['london-central', 35375959, 'Covent Garden Market, London'],
  ['london-south-east', 38277933, 'The dinosaur sculptures in Crystal Palace Park'],
  ['london-south-east-north', 34532454, 'Tower Bridge over the River Thames, London'],
  ['north-wales', 29814765, 'Steam train at Llangollen Railway station'],
  ['peterborough', 31269573, 'The nave of Peterborough Cathedral'],
  ['reading', 1796720, 'The Radcliffe Camera, Oxford'],
  ['sheffield', 12932002, 'Sheaf Square fountains, Sheffield city centre'],
  ['south-manchester', 31283302, 'Stockport Town Hall'],
  ['south-wales', 19825429, 'The Norman keep of Cardiff Castle'],
  ['twickenham', 4300272, 'Richmond Bridge over the River Thames'],
  ['west-yorkshire', 33898463, 'The River Aire waterfront, Leeds'],
  ['worcester-and-west-midlands', 31269277, 'The quire of Worcester Cathedral'],
];

const force = process.argv.includes('--force');
const onlyIndex = process.argv.indexOf('--only');
const only = onlyIndex > -1 ? process.argv[onlyIndex + 1] : null;

const client = createClient({
  projectId: 'a4q9j3x1',
  dataset: 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function main() {
  const key = process.env.PEXELS_API_KEY;
  if (!key) throw new Error('PEXELS_API_KEY is missing from .env');

  for (const [slug, photoId, alt] of PHOTOS) {
    if (only && slug !== only) continue;
    const franchisee = await client.fetch<{ _id: string; hasPhoto: boolean } | null>(
      `*[_type == "franchisee" && slug.current == $slug][0]{ _id, "hasPhoto": defined(areaImage.asset) }`,
      { slug }
    );
    if (!franchisee) {
      console.log(`${slug}: no franchisee, skipped`);
      continue;
    }
    if (franchisee.hasPhoto && !force) {
      console.log(`${slug}: already has an area photo, kept`);
      continue;
    }

    const photo = await fetch(`https://api.pexels.com/v1/photos/${photoId}`, { headers: { Authorization: key } }).then((r) => {
      if (!r.ok) throw new Error(`Pexels ${photoId}: ${r.status}`);
      return r.json();
    });
    // Full quality, capped at 2400px wide — plenty for a full-width header
    const image = await fetch(`${photo.src.original}?auto=compress&cs=tinysrgb&w=2400`).then((r) => r.arrayBuffer());
    const asset = await client.assets.upload('image', Buffer.from(image), { filename: `area-${slug}-pexels-${photoId}.jpg` });

    await client
      .patch(franchisee._id)
      .set({
        areaImage: {
          _type: 'image',
          asset: { _type: 'reference', _ref: asset._id },
          alt,
          source: photo.url,
          licence: `Pexels licence (photo by ${photo.photographer})`,
        },
      })
      .commit();
    console.log(`${slug}: set — ${alt}`);
  }
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
