/**
 * Seed member documents into Sanity CMS.
 *
 * Reads PDFs from a local folder structure and uploads them as memberDocument
 * records. The folder names map to subcategories:
 *   General           → general
 *   Operating Procedures → operating-procedures
 *   Personnel         → personnel
 *   Training          → training
 *
 * Idempotent: checks for existing documents by slug before creating.
 *
 * Run: npx tsx --env-file=.env scripts/seed-documents.ts
 */

import { createClient } from '@sanity/client';
import * as fs from 'fs';
import * as path from 'path';

const client = createClient({
  projectId: process.env.NEXT_PUBLIC_SANITY_PROJECT_ID || 'a4q9j3x1',
  dataset: process.env.NEXT_PUBLIC_SANITY_DATASET || 'production',
  apiVersion: '2024-01-01',
  useCdn: false,
  token: process.env.SANITY_API_TOKEN,
});

if (!process.env.SANITY_API_TOKEN) {
  console.error('SANITY_API_TOKEN is required. Set it in .env');
  process.exit(1);
}

const SOURCE_DIR = '/Users/alexmccormick/Downloads/Processes Documentation';

const FOLDER_TO_SUBCATEGORY: Record<string, string> = {
  'General': 'general',
  'Operating Procedures': 'operating-procedures',
  'Personnel': 'personnel',
  'Training': 'training',
};

function slugify(text: string): string {
  return text
    .toLowerCase()
    .replace(/\.pdf$/i, '')
    .replace(/\([^)]*\)/g, '') // remove parenthetical like (1)
    .trim()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-+|-+$/g, '');
}

function cleanTitle(filename: string): string {
  return filename
    .replace(/\.pdf$/i, '')
    .replace(/\s*\(\d+\)\s*$/, '') // remove trailing (1) etc
    .trim();
}

interface DocumentEntry {
  title: string;
  slug: string;
  subcategory: string;
  filePath: string;
}

async function discoverDocuments(): Promise<DocumentEntry[]> {
  const entries: DocumentEntry[] = [];

  for (const [folderName, subcategory] of Object.entries(FOLDER_TO_SUBCATEGORY)) {
    const folderPath = path.join(SOURCE_DIR, folderName);

    if (!fs.existsSync(folderPath)) {
      console.log(`  Skipping ${folderName} — folder not found`);
      continue;
    }

    const files = fs.readdirSync(folderPath).filter((f) => f.endsWith('.pdf'));

    for (const file of files) {
      entries.push({
        title: cleanTitle(file),
        slug: slugify(file),
        subcategory,
        filePath: path.join(folderPath, file),
      });
    }
  }

  return entries;
}

async function main() {
  console.log('Discovering documents...\n');
  const documents = await discoverDocuments();
  console.log(`Found ${documents.length} PDFs across ${Object.keys(FOLDER_TO_SUBCATEGORY).length} subcategories.\n`);

  let created = 0;
  let skipped = 0;

  for (const doc of documents) {
    // Check if already exists
    const existing = await client.fetch(
      `*[_type == "memberDocument" && slug.current == $slug][0]._id`,
      { slug: doc.slug }
    );

    if (existing) {
      console.log(`  SKIP  ${doc.title} (already exists: ${existing})`);
      skipped++;
      continue;
    }

    // Upload the PDF file
    console.log(`  UPLOAD  ${doc.title}...`);
    const fileBuffer = fs.readFileSync(doc.filePath);
    const filename = path.basename(doc.filePath);

    const asset = await client.assets.upload('file', fileBuffer, {
      filename,
      contentType: 'application/pdf',
    });

    // Create the memberDocument
    const result = await client.create({
      _type: 'memberDocument',
      title: doc.title,
      slug: { _type: 'slug', current: doc.slug },
      category: 'documents',
      subcategory: doc.subcategory,
      file: {
        _type: 'file',
        asset: {
          _type: 'reference',
          _ref: asset._id,
        },
      },
      publishedAt: new Date().toISOString(),
      isPublished: true,
      order: 0,
    });

    console.log(`  CREATE  ${doc.title} → ${result._id} [${doc.subcategory}]`);
    created++;
  }

  console.log(`\nDone. Created: ${created}, Skipped: ${skipped}, Total: ${documents.length}`);
}

main().catch((err) => {
  console.error('Seed failed:', err);
  process.exit(1);
});
