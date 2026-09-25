/**
 * Website content migration: writes the site's content into the CMS.
 *
 *   npx tsx --env-file=.env scripts/cms-seed/run.ts             # create documents that don't exist yet
 *   npx tsx --env-file=.env scripts/cms-seed/run.ts --force     # replace them (overwrites Studio edits!)
 *   npx tsx --env-file=.env scripts/cms-seed/run.ts --only homePage
 *
 * By default nothing edited in Studio is ever overwritten. Local images
 * (img('/stock_images/…')) are uploaded to the CMS once and reused.
 */
import fs from 'fs';
import path from 'path';
import crypto from 'crypto';
import { createClient } from '@sanity/client';
import { MODULES } from './modules';

const FORCE = process.argv.includes('--force');
const ONLY = process.argv.includes('--only') ? process.argv[process.argv.indexOf('--only') + 1].split(',') : null;

const client = createClient({ projectId: 'a4q9j3x1', dataset: 'production', apiVersion: '2024-01-01', token: process.env.SANITY_API_TOKEN, useCdn: false });

// eslint-disable-next-line @typescript-eslint/no-explicit-any
type Any = any;
const uploads = new Map<string, string>();

async function uploadImage(publicPath: string): Promise<string> {
  if (uploads.has(publicPath)) return uploads.get(publicPath)!;
  const file = path.join(process.cwd(), 'public', publicPath);
  const buffer = fs.readFileSync(file);
  // Reuse an asset already uploaded from the same file
  const sha1 = crypto.createHash('sha1').update(buffer).digest('hex');
  const existing = await client.fetch<string | null>(`*[_type == "sanity.imageAsset" && sha1hash == $sha1][0]._id`, { sha1 });
  const id = existing || (await client.assets.upload('image', buffer, { filename: path.basename(file) }))._id;
  uploads.set(publicPath, id);
  return id;
}

/** Upload images, resolve franchise slugs to references, add _keys to array items */
async function resolve(value: Any): Promise<Any> {
  if (Array.isArray(value)) {
    const out = [];
    for (let i = 0; i < value.length; i++) {
      const r = await resolve(value[i]);
      out.push(r && typeof r === 'object' && !Array.isArray(r) && !r._key ? { _key: `i${i}${crypto.randomBytes(3).toString('hex')}`, ...r } : r);
    }
    return out;
  }
  if (!value || typeof value !== 'object') return value;
  if (value.__upload) {
    const ref = await uploadImage(value.__upload);
    return { _type: 'image', asset: { _type: 'reference', _ref: ref }, ...(value.alt ? { alt: value.alt } : {}) };
  }
  if (value.__franchiseeSlug) {
    const id = await client.fetch<string | null>(`*[_type == "franchisee" && slug.current == $slug][0]._id`, { slug: value.__franchiseeSlug });
    if (!id) throw new Error(`No franchise with slug ${value.__franchiseeSlug}`);
    return { _type: 'reference', _ref: id };
  }
  if (value.__serviceSlug) {
    const id = await client.fetch<string | null>(`*[_type == "service" && slug.current == $slug][0]._id`, { slug: value.__serviceSlug });
    if (!id) throw new Error(`No service with slug ${value.__serviceSlug}`);
    return { _type: 'reference', _ref: id };
  }
  const out: Any = {};
  for (const [k, v] of Object.entries(value)) out[k] = await resolve(v);
  return out;
}

/**
 * Update an existing document in place (matched by slug): `fix` is always
 * applied, `setIfMissing` fills empty fields, and `set`/`unset` only run with
 * --force. Creates the document if none matches.
 */
async function applyPatch(doc: Any) {
  const { type, slugs } = doc.__patch;
  const existingId = await client.fetch<string | null>(`*[_type == $type && slug.current in $slugs && !(_id in path("drafts.**"))][0]._id`, { type, slugs });
  const fix = await resolve(doc.fix || {});
  const setIfMissing = await resolve(doc.setIfMissing || {});
  const set = await resolve(doc.set || {});
  if (!existingId) {
    await client.createIfNotExists({ _id: doc._id, _type: doc._type, ...setIfMissing, ...set, ...fix });
    console.log(`created           ${doc._id}`);
    return;
  }
  let patch = client.patch(existingId).set(fix).setIfMissing(setIfMissing);
  if (FORCE) {
    if (Object.keys(set).length) patch = patch.set(set);
    if (doc.unset?.length) patch = patch.unset(doc.unset);
  }
  await patch.commit();
  console.log(`updated           ${existingId} (${slugs[0]})${FORCE ? ' [force]' : ''}`);
}

/** Point each Franchise Login document at its section document (from its old section name) */
async function linkDocumentSections() {
  const docs = await client.fetch<{ _id: string; subcategory: string }[]>(
    `*[_type == "memberDocument" && category == "documents" && defined(subcategory) && !defined(section)] { _id, subcategory }`
  );
  for (const doc of docs) {
    const sectionId = await client.fetch<string | null>(`*[_type == "documentSection" && slug.current == $slug][0]._id`, { slug: doc.subcategory });
    if (!sectionId) continue;
    await client.patch(doc._id).set({ section: { _type: 'reference', _ref: sectionId } }).commit();
  }
  if (docs.length) console.log(`linked            ${docs.length} documents to their sections`);
}

(async () => {
  for (const [name, docs] of Object.entries(MODULES)) {
    for (const doc of docs as Any[]) {
      if (ONLY && !ONLY.includes(doc._id) && !ONLY.includes(name)) continue;
      if (doc.__patch) {
        await applyPatch(doc);
        continue;
      }
      const exists = await client.fetch<number>(`count(*[_id == $id])`, { id: doc._id });
      if (exists && !FORCE) {
        console.log(`skipped (exists)  ${doc._id}`);
        continue;
      }
      const resolved = await resolve(doc);
      if (FORCE) await client.createOrReplace(resolved);
      else await client.createIfNotExists(resolved);
      console.log(`${exists ? 'replaced' : 'created '}          ${doc._id}`);
    }
  }
  if (!ONLY || ONLY.includes('membersArea')) await linkDocumentSections();
})().catch((e) => {
  console.error(e);
  process.exit(1);
});
