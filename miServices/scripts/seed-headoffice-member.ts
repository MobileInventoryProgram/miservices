/**
 * Seed a Head Office member account into Sanity.
 * Links directly to the Head Office franchisee document via reference.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/seed-headoffice-member.ts
 */
import { createClient } from '@sanity/client';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a4q9j3x1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

const HEAD_OFFICE_FRANCHISEE_ID = 'afH2HH6ETPTX8FYNV3S9EO';
const EMAIL = 'headoffice@mobileinventoryservices.co.uk';
const PASSWORD = 'HeadOffice2025!';

async function seed() {
  console.log('Seeding Head Office member account...\n');

  // Verify the franchisee document exists
  const franchisee = await client.fetch(
    `*[_type == "franchisee" && _id == $id][0] { _id, companyName, territory }`,
    { id: HEAD_OFFICE_FRANCHISEE_ID }
  );

  if (!franchisee) {
    console.error(`  ERROR: Franchisee document ${HEAD_OFFICE_FRANCHISEE_ID} not found.`);
    process.exit(1);
  }

  console.log(`  Found franchisee: ${franchisee.companyName} (territory: ${franchisee.territory})`);

  // Check if member already exists
  const existing = await client.fetch(
    `*[_type == "member" && email == $email][0]._id`,
    { email: EMAIL }
  );

  if (existing) {
    console.log(`  Member ${EMAIL} already exists — updating franchisee reference...`);
    await client
      .patch(existing)
      .set({
        franchisee: { _type: 'reference', _ref: HEAD_OFFICE_FRANCHISEE_ID },
        territory: franchisee.territory,
      })
      .commit();
    console.log('  Updated existing member with franchisee reference.');
  } else {
    const hashedPassword = await hashPassword(PASSWORD);

    await client.create({
      _type: 'member',
      email: EMAIL,
      name: 'Head Office',
      hashedPassword,
      role: 'franchisee',
      franchisee: { _type: 'reference', _ref: HEAD_OFFICE_FRANCHISEE_ID },
      territory: franchisee.territory,
      isActive: true,
    });

    console.log(`  Created member: ${EMAIL}`);
    console.log(`  Password: ${PASSWORD}`);
  }

  console.log(`  Franchisee ref: ${HEAD_OFFICE_FRANCHISEE_ID}`);
  console.log(`  Territory: ${franchisee.territory}`);
  console.log('\nDone! Log in at /members/login');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
