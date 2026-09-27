/**
 * Rename "Franchise Login" to "Members Area" in the live CMS text: the login
 * heading, the document notice and the footer link. Safe to re-run: only
 * text still saying "Franchise Login" is changed.
 *
 *   npx tsx --env-file=.env scripts/rename-members-area.ts            # dry run
 *   npx tsx --env-file=.env scripts/rename-members-area.ts --write
 */
import { createClient } from '@sanity/client';

const OLD = 'Franchise Login';
const NEW = 'Members Area';
const write = process.argv.includes('--write');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a4q9j3x1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function main() {
  const members = await client.fetch<{ login?: { heading?: string }; documentNotice?: string } | null>(
    `*[_id == "membersArea"][0]{ login, documentNotice }`
  );
  const settings = await client.fetch<{ legalLinks?: { _key: string; label?: string }[] } | null>(`*[_id == "siteSettings"][0]{ legalLinks }`);

  const changes: string[] = [];
  const membersPatch: Record<string, string> = {};
  if (members?.login?.heading?.includes(OLD)) membersPatch['login.heading'] = members.login.heading.replaceAll(OLD, NEW);
  if (members?.documentNotice?.includes(OLD)) membersPatch.documentNotice = members.documentNotice.replaceAll(OLD, NEW);
  for (const [field, value] of Object.entries(membersPatch)) changes.push(`membersArea.${field} → "${value}"`);

  const linksPatch: Record<string, string> = {};
  for (const item of settings?.legalLinks || []) {
    if (item.label?.includes(OLD)) linksPatch[`legalLinks[_key=="${item._key}"].label`] = item.label.replaceAll(OLD, NEW);
  }
  for (const value of Object.values(linksPatch)) changes.push(`siteSettings footer link → "${value}"`);

  if (!changes.length) {
    console.log('Nothing to change: the CMS already says "Members Area".');
    return;
  }
  console.log(changes.join('\n'));
  if (!write) {
    console.log('\nDry run. Re-run with --write to apply.');
    return;
  }

  const tx = client.transaction();
  if (Object.keys(membersPatch).length) tx.patch('membersArea', (p) => p.set(membersPatch));
  if (Object.keys(linksPatch).length) tx.patch('siteSettings', (p) => p.set(linksPatch));
  await tx.commit();
  console.log('\nDone.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
