/**
 * Seed the Help Centre's starter answers (scripts/data/help/*.ts).
 *
 *   npx tsx --env-file=.env scripts/seed-help-articles.ts            # dry run: check links, report only
 *   npx tsx --env-file=.env scripts/seed-help-articles.ts --write    # create answers that don't exist yet
 *   npx tsx --env-file=.env scripts/seed-help-articles.ts --write --update   # also overwrite existing ones
 *
 * Each source heading is found by its exact text in the document, so links
 * land on the right section; the script stops if any heading can't be found.
 * Safe to re-run: answers are keyed by id, and without --update existing
 * answers (which Head Office may have edited) are left alone.
 */
import { createClient } from '@sanity/client';
import { answerToBlocks } from '../lib/help/markup';
import { HELP_TOPICS } from '../lib/help/topics';
import { MEMBERS_AREA_ARTICLES } from './data/help/members-area';
import { OPERATIONS_ARTICLES } from './data/help/operations';
import { PEOPLE_ARTICLES } from './data/help/people';
import { TRAINING_ARTICLES } from './data/help/training';
import type { SeedHelpArticle } from './data/help/types';

const write = process.argv.includes('--write');
const update = process.argv.includes('--update');

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a4q9j3x1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

type Doc = { _id: string; slug: string; headings: { _key: string; style: string; text: string }[] };

async function main() {
  const all: SeedHelpArticle[] = [...OPERATIONS_ARTICLES, ...TRAINING_ARTICLES, ...PEOPLE_ARTICLES, ...MEMBERS_AREA_ARTICLES];

  // Checks before anything is written
  const problems: string[] = [];
  const ids = new Set<string>();
  for (const a of all) {
    if (ids.has(a.id)) problems.push(`Duplicate id: ${a.id}`);
    ids.add(a.id);
    if (!HELP_TOPICS.some((t) => t.value === a.topic)) problems.push(`${a.id}: unknown topic "${a.topic}"`);
    if (!a.question.trim() || !a.answer.join('').trim()) problems.push(`${a.id}: empty question or answer`);
  }

  const docs = await client.fetch<Doc[]>(
    `*[_type == "memberDocument" && category == "documents" && !(_id in path("drafts.**"))] {
      _id, "slug": slug.current,
      "headings": body[_type == "block" && style in ["h2", "h3"]] { _key, style, "text": pt::text(@) }
    }`
  );
  const bySlug = new Map(docs.map((d) => [d.slug, d]));
  const clean = (s: string) => s.replace(/\s+/g, ' ').trim();

  const warnings: string[] = [];
  const prepared = all.map((a) => {
    const sources = a.sources.map((s, i) => {
      const doc = bySlug.get(s.doc);
      if (!doc) {
        problems.push(`${a.id}: no document with slug "${s.doc}"`);
        return null;
      }
      let heading: Doc['headings'][number] | undefined;
      if (s.heading) {
        const matches = doc.headings.filter((h) => clean(h.text) === clean(s.heading!));
        if (!matches.length) problems.push(`${a.id}: heading "${s.heading}" not found in ${s.doc}`);
        else if (s.occurrence && !matches[s.occurrence - 1]) problems.push(`${a.id}: "${s.heading}" has no occurrence ${s.occurrence} in ${s.doc}`);
        else if (matches.length > 1 && !s.occurrence) warnings.push(`${a.id}: "${s.heading}" appears ${matches.length} times in ${s.doc}; linked to the first`);
        heading = matches[(s.occurrence || 1) - 1];
      }
      return {
        _type: 'helpSource',
        _key: `${a.id}-s${i}`,
        document: { _type: 'reference', _ref: doc._id },
        ...(heading ? { headingKey: heading._key, headingText: clean(heading.text) } : {}),
      };
    });
    const order = all.filter((b) => b.topic === a.topic).indexOf(a) + 1;
    return {
      _id: `helpArticle-${a.id}`,
      _type: 'helpArticle',
      question: a.question.trim(),
      answer: answerToBlocks(a.answer.join('\n\n'), `${a.id}-`),
      topic: a.topic,
      keywords: a.keywords,
      order,
      isPublished: true,
      sources: sources.filter(Boolean),
    };
  });

  warnings.forEach((w) => console.warn(`Note: ${w}`));
  if (problems.length) {
    console.error(`\n${problems.length} problem(s), nothing written:\n${problems.map((p) => `  - ${p}`).join('\n')}`);
    process.exit(1);
  }

  const existing = new Set(await client.fetch<string[]>(`*[_type == "helpArticle" && _id in $ids]._id`, { ids: prepared.map((p) => p._id) }));
  const toCreate = prepared.filter((p) => !existing.has(p._id));
  const toUpdate = update ? prepared.filter((p) => existing.has(p._id)) : [];

  const perTopic = HELP_TOPICS.map((t) => `${t.title}: ${prepared.filter((p) => p.topic === t.value).length}`).join(', ');
  console.log(`${prepared.length} answers (${perTopic}); ${prepared.reduce((n, p) => n + p.sources.length, 0)} source links all found.`);
  console.log(`${toCreate.length} new, ${existing.size} already exist${update ? ` (${toUpdate.length} will be overwritten)` : ' (left alone)'}.`);

  if (!write) {
    console.log('\nDry run. Re-run with --write to save.');
    return;
  }
  for (let i = 0; i < toCreate.length + toUpdate.length; i += 50) {
    const tx = client.transaction();
    for (const doc of [...toCreate, ...toUpdate].slice(i, i + 50)) tx.createOrReplace(doc);
    await tx.commit();
  }
  console.log('\nDone.');
}

main().catch((error) => {
  console.error(error);
  process.exit(1);
});
