/**
 * One-off (safe to re-run) setup of Resend for Head Office email marketing:
 * the three mailing lists, the contact fields we fill in, and optionally the
 * webhook that tells the Members Area about unsubscribes.
 *
 *   npx tsx --conditions=react-server --env-file=.env scripts/setup-resend-marketing.ts
 *   … --webhook-url=https://your-site/api/webhooks/resend   (also creates the webhook)
 *
 * Needs a full-access RESEND_API_KEY.
 */
import { CONTACT_PROPERTIES, LISTS } from '../lib/marketing/lists';
import {
  createContactProperty,
  createSegment,
  createWebhook,
  listContactProperties,
  listSegments,
  listWebhooks,
  renameSegment,
  ResendError,
  segmentContacts,
} from '../lib/marketing/resend';

async function main() {
  if (!process.env.RESEND_API_KEY) throw new Error('RESEND_API_KEY is not set.');

  // Lists
  const segments = await listSegments();
  const ours = Object.values(LISTS).map((l) => l.name) as string[];
  for (const list of Object.values(LISTS)) {
    const found = segments.find((s) => s.name === list.name);
    if (found) {
      console.log(`✓ List "${list.name}" already exists (${found.id})`);
      continue;
    }
    // Resend's free plan allows 3 lists and starts with an empty "General" one: reuse it rather than fail
    const spare = segments.find((s) => !ours.includes(s.name) && s.name === 'General');
    if (spare && !(await segmentContacts(spare.id, { limit: 1 })).contacts.length) {
      await renameSegment(spare.id, list.name);
      spare.name = list.name;
      console.log(`~ Renamed Resend's empty "General" list to "${list.name}" (${spare.id})`);
      continue;
    }
    console.log(`+ Created list "${list.name}" (${(await createSegment(list.name)).id})`);
  }

  // Contact fields
  const properties = await listContactProperties();
  for (const key of CONTACT_PROPERTIES) {
    if (properties.some((p) => p.key === key)) console.log(`✓ Contact field "${key}" already exists`);
    else {
      await createContactProperty(key);
      console.log(`+ Created contact field "${key}"`);
    }
  }

  // Webhook (production only: Resend can't reach localhost)
  const arg = process.argv.find((a) => a.startsWith('--webhook-url='));
  if (arg) {
    const url = arg.split('=')[1];
    if (!/^https:\/\//.test(url)) throw new Error('The webhook URL must start with https://');
    const existing = (await listWebhooks()).find((w) => w.endpoint === url);
    if (existing) console.log(`✓ Webhook for ${url} already exists. Its signing secret is in Resend → Webhooks.`);
    else {
      const hook = await createWebhook(url, ['contact.updated', 'contact.created']);
      console.log(`+ Created webhook for ${url}`);
      console.log('  Add its signing secret to the site as RESEND_WEBHOOK_SECRET:');
      console.log(`  ${hook.signing_secret || '(see Resend → Webhooks)'}`);
    }
  } else {
    console.log('– Webhook not created (pass --webhook-url=https://…/api/webhooks/resend to create it).');
  }
}

main().catch((error) => {
  console.error(error instanceof ResendError ? `Resend said: ${error.message} (${error.status})` : error);
  process.exit(1);
});
