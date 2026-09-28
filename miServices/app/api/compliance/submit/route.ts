import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { findItem, submitRecord, uploadEvidence } from '@/lib/compliance/records';
import { isDate, ukToday } from '@/lib/dates';
import { getMemberScope } from '@/lib/members-access';

export const maxDuration = 60;

/**
 * POST (multipart) — A franchise submits a checklist item for Head Office to
 * review: requirementId, period, note, expiresOn, and files for uploads.
 * Always files it against the member's own franchise.
 */
export async function POST(request: Request) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
  if (session.user.role === 'admin') return NextResponse.json({ error: 'Head Office completes items from the Compliance section.' }, { status: 403 });
  const scope = await getMemberScope(session);
  if (!scope?.franchiseeId) return NextResponse.json({ error: 'No franchise is linked to your account.' }, { status: 403 });

  try {
    const form = await request.formData();
    const requirementId = String(form.get('requirementId') || '');
    const period = String(form.get('period') || '') || null;
    const note = String(form.get('note') || '').trim().slice(0, 1000);
    const expiresOn = String(form.get('expiresOn') || '') || null;
    const confirmed = form.get('confirmed') === 'true';
    const files = form.getAll('files').filter((f): f is File => typeof f === 'object' && 'arrayBuffer' in f && (f as File).size > 0);

    const found = await findItem(scope.franchiseeId, requirementId, period);
    if ('error' in found) return NextResponse.json({ error: found.error }, { status: 400 });
    const { item } = found;
    const requirement = item.requirement;

    if (requirement.evidence === 'admin') return NextResponse.json({ error: 'Head Office ticks this one off.' }, { status: 400 });
    if (item.state === 'done' && !item.key.endsWith(':rolling')) return NextResponse.json({ error: 'This is already approved.' }, { status: 400 });
    if (item.state === 'notApplicable') return NextResponse.json({ error: 'This does not apply to your franchise.' }, { status: 400 });
    if (item.state === 'submitted' && files.length === 0 && requirement.evidence === 'upload') {
      return NextResponse.json({ error: 'This is already waiting for review.' }, { status: 400 });
    }
    if (requirement.evidence === 'confirm' && !confirmed) return NextResponse.json({ error: 'Please tick to confirm.' }, { status: 400 });

    const resubmitting = item.state === 'returned' || item.state === 'submitted';
    if (requirement.evidence === 'upload' && files.length === 0 && !(resubmitting && item.record?.files.length)) {
      return NextResponse.json({ error: 'Please choose a file to upload.' }, { status: 400 });
    }
    if (requirement.askExpiry) {
      if (!expiresOn || !isDate(expiresOn)) return NextResponse.json({ error: 'Please give the expiry date.' }, { status: 400 });
      if (expiresOn < ukToday()) return NextResponse.json({ error: 'That expiry date has already passed.' }, { status: 400 });
    }

    const uploaded = files.length ? await uploadEvidence(files) : [];
    if ('error' in uploaded) return NextResponse.json({ error: uploaded.error }, { status: 400 });

    await submitRecord({
      franchiseId: scope.franchiseeId,
      requirementId,
      period: found.period,
      by: session.user.name || session.user.email,
      note,
      expiresOn: requirement.askExpiry ? expiresOn : null,
      files: uploaded,
      keepExisting: resubmitting && uploaded.length === 0,
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Compliance submit failed:', error);
    return NextResponse.json({ error: 'Failed to submit' }, { status: 500 });
  }
}
