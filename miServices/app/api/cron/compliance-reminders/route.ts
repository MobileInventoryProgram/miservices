import { NextResponse } from 'next/server';
import { sendComplianceReminders } from '@/lib/compliance/reminders';

export const dynamic = 'force-dynamic';
export const maxDuration = 60;

/**
 * GET — The daily compliance reminder run (Vercel Cron, vercel.json). Vercel
 * sends `Authorization: Bearer <CRON_SECRET>`; anything else is refused.
 */
export async function GET(request: Request) {
  const secret = process.env.CRON_SECRET;
  if (!secret || request.headers.get('authorization') !== `Bearer ${secret}`) {
    return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  }
  try {
    const result = await sendComplianceReminders({ kind: 'auto' });
    const summary = {
      emailConfigured: result.emailConfigured,
      franchises: result.franchises.length,
      sent: result.franchises.filter((f) => f.sent).length,
      failed: result.franchises.filter((f) => f.error).map((f) => ({ name: f.name, error: f.error })),
    };
    console.log('Compliance reminders:', JSON.stringify(summary));
    return NextResponse.json({ ...summary, details: result.franchises.map(({ name, items, sent }) => ({ name, items: items.length, sent })) });
  } catch (error) {
    console.error('Compliance reminder run failed:', error);
    return NextResponse.json({ error: 'Reminder run failed' }, { status: 500 });
  }
}
