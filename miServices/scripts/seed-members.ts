/**
 * Seed initial member accounts into Sanity.
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/seed-members.ts
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

const MEMBERS = [
  {
    email: 'admin@mobileinventoryservices.co.uk',
    name: 'Admin User',
    password: 'Admin123!',
    role: 'admin' as const,
  },
  {
    email: 'franchisee@mobileinventoryservices.co.uk',
    name: 'Test Franchisee',
    password: 'Franchise123!',
    role: 'franchisee' as const,
    territory: 'Leeds',
  },
];

async function seed() {
  console.log('Seeding members...\n');

  for (const member of MEMBERS) {
    const existing = await client.fetch(
      `*[_type == "member" && email == $email][0]._id`,
      { email: member.email }
    );

    if (existing) {
      console.log(`  Skipping ${member.email} (already exists)`);
      continue;
    }

    const hashedPassword = await hashPassword(member.password);

    await client.create({
      _type: 'member',
      email: member.email,
      name: member.name,
      hashedPassword,
      role: member.role,
      territory: member.territory || undefined,
      isActive: true,
    });

    console.log(`  Created ${member.role}: ${member.email} (password: ${member.password})`);
  }

  console.log('\nDone! You can now log in at /members/login');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
