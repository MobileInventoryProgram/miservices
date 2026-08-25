/**
 * Seed member accounts for ALL active franchisees in Sanity.
 * Each franchisee's primary owner email becomes their login.
 * Skips franchisees that already have a linked member account.
 *
 * Default password: Welcome2025!
 *
 * Usage:
 *   npx tsx --env-file=.env scripts/seed-all-members.ts
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

const DEFAULT_PASSWORD = 'Welcome2025!';

interface Owner {
  firstName: string;
  lastName: string;
  email: string;
}

interface Franchisee {
  _id: string;
  companyName: string;
  territory: string;
  owners: Owner[];
}

async function seed() {
  console.log('Seeding member accounts for all franchisees...\n');

  // Fetch all active franchisees
  const franchisees: Franchisee[] = await client.fetch(
    `*[_type == "franchisee" && isActive == true] | order(territory asc) {
      _id,
      companyName,
      territory,
      owners[] { firstName, lastName, email }
    }`
  );

  console.log(`Found ${franchisees.length} active franchisees.\n`);

  // Fetch all existing members with their franchisee references
  const existingMembers: { email: string; franchiseeId: string | null }[] = await client.fetch(
    `*[_type == "member"] { email, "franchiseeId": franchisee._ref }`
  );

  const existingByEmail = new Map(existingMembers.map((m) => [m.email, m]));
  const linkedFranchiseeIds = new Set(
    existingMembers.filter((m) => m.franchiseeId).map((m) => m.franchiseeId)
  );

  let created = 0;
  let skipped = 0;
  let errors = 0;

  // Hash the default password once (reused for all new accounts)
  const hashedPassword = await hashPassword(DEFAULT_PASSWORD);

  for (const franchisee of franchisees) {
    const primaryOwner = franchisee.owners?.[0];

    if (!primaryOwner?.email) {
      console.log(`  SKIP  ${franchisee.territory} — no owner email`);
      skipped++;
      continue;
    }

    // Skip if this franchisee already has a linked member
    if (linkedFranchiseeIds.has(franchisee._id)) {
      console.log(`  SKIP  ${franchisee.territory} — already has a member account`);
      skipped++;
      continue;
    }

    // Skip if a member with this email already exists
    if (existingByEmail.has(primaryOwner.email)) {
      console.log(`  SKIP  ${franchisee.territory} — email ${primaryOwner.email} already in use`);
      skipped++;
      continue;
    }

    try {
      await client.create({
        _type: 'member',
        email: primaryOwner.email,
        name: `${primaryOwner.firstName} ${primaryOwner.lastName}`.trim(),
        hashedPassword,
        role: 'franchisee' as const,
        franchisee: { _type: 'reference', _ref: franchisee._id },
        territory: franchisee.territory,
        isActive: true,
      });

      console.log(`  OK    ${franchisee.territory} — ${primaryOwner.email}`);
      created++;
    } catch (err) {
      console.error(`  ERROR ${franchisee.territory} — ${err}`);
      errors++;
    }
  }

  console.log(`\n--- Summary ---`);
  console.log(`  Created: ${created}`);
  console.log(`  Skipped: ${skipped}`);
  console.log(`  Errors:  ${errors}`);
  console.log(`\nDefault password for all new accounts: ${DEFAULT_PASSWORD}`);
  console.log('Log in at /members/login');
}

seed().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
