import 'server-only';
import { createHmac, timingSafeEqual } from 'crypto';

/** Webhooks older (or newer) than this are refused, so a captured request can't be replayed */
const TOLERANCE_SECONDS = 5 * 60;

/**
 * Check a Resend webhook's signature (Resend signs with Svix: HMAC-SHA256 of
 * "id.timestamp.body", keyed with the base64 part of the whsec_ secret).
 */
export function verifyResendWebhook(body: string, headers: Headers, secret: string | undefined, now = Date.now()): boolean {
  const id = headers.get('svix-id');
  const timestamp = headers.get('svix-timestamp');
  const signatures = headers.get('svix-signature');
  if (!secret || !id || !timestamp || !signatures) return false;
  const seconds = Number(timestamp);
  if (!Number.isFinite(seconds) || Math.abs(now / 1000 - seconds) > TOLERANCE_SECONDS) return false;

  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  const expected = createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest();
  return signatures.split(' ').some((part) => {
    const [version, signature] = part.split(',');
    if (version !== 'v1' || !signature) return false;
    const given = Buffer.from(signature, 'base64');
    return given.length === expected.length && timingSafeEqual(given, expected);
  });
}

/** Sign a body the way Resend does (for tests) */
export function signResendWebhook(body: string, secret: string, id: string, timestamp: number): string {
  const key = Buffer.from(secret.replace(/^whsec_/, ''), 'base64');
  return `v1,${createHmac('sha256', key).update(`${id}.${timestamp}.${body}`).digest('base64')}`;
}
