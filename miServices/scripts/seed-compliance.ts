/**
 * Seed the starter compliance requirements (scripts/data/compliance-requirements.ts).
 *
 *   npx tsx --env-file=.env scripts/seed-compliance.ts            # dry run: check links
 *   npx tsx --env-file=.env scripts/seed-compliance.ts --write    # create ones that don't exist yet
 *
 * Source headings are found by their exact text, and the script stops if one
 * can't be found. Existing requirements (which Head Office may have edited)
 * are left alone, so it's safe to re-run. New ones are tracked from today.
 */
import { createClient } from '@sanity/client';
import { COMPLIANCE_REQUIREMENTS } from './data/compliance-requirements';
import { ukToday } from '../lib/dates';

const write = process.argv.includes('--write');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a4q9j3x1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

async function main() {
  const docs = await client.fetch<{ _id: string; slug: string; headings: { _key: string; text: string }[] }[]>(
    `*[_type == "memberDocument" && !(_id in path("drafts.**"))] {
      _id, "slug": slug.current, "headings": body[_type == "block" && style in ["h2", "h3"]] { _key, "text": pt::text(@) }
    }`
  );
  const bySlug = new Map(docs.map((d) => [d.slug, d]));
  const clean = (s: string) => s.replace(/\s+/g, ' ').trim();
  const problems: string[] = [];
  const today = ukToday();

  const prepared = COMPLIANCE_REQUIREMENTS.map((r, i) => {
    const sources = r.sources.map((s, j) => {
      const doc = bySlug.get(s.doc);
      if (!doc) {
        problems.push(`${r.id}: no document "${s.doc}"`);
        return null;
      }
      const heading = s.heading ? doc.headings.find((h) => clean(h.text) === clean(s.heading!)) : undefined;
      if (s.heading && !heading) problems.push(`${r.id}: heading "${s.heading}" not found in ${s.doc}`);
      return {
        _type: 'complianceSource',
        _key: `${r.id}-s${j}`,
        document: { _type: 'reference', _ref: doc._id },
        ...(heading ? { headingKey: heading._key, headingText: clean(heading.text) } : {}),
      };
    });
    const { id, sources: _unused, ...fields } = r;
    return {
      _id: `complianceRequirement-${id}`,
      _type: 'complianceRequirement',
      ...fields,
      remindBefore: 7,
      remindEvery: 7,
      startsOn: today,
      order: i + 1,
      isActive: true,
      sources: sources.filter(Boolean),
    };
  });

  if (problems.length) {
    console.error(`${problems.length} problem(s), nothing written:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    process.exit(1);
  }

  const existing = new Set(await client.fetch<string[]>(`*[_type == "complianceRequirement" && _id in $ids]._id`, { ids: prepared.map((p) => p._id) }));
  const toCreate = prepared.filter((p) => !existing.has(p._id));
  console.log(`${prepared.length} requirements, ${prepared.reduce((n, p) => n + p.sources.length, 0)} source links found. ${toCreate.length} new, ${existing.size} already exist (left alone).`);
  if (!write) {
    console.log('Dry run. Re-run with --write to save.');
    return;
  }
  const tx = client.transaction();
  toCreate.forEach((doc) => tx.createIfNotExists(doc));
  await tx.commit();
  console.log('Done.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
