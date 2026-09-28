import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { sanityWriteClient } from '@/lib/sanity';

/** PUT — One franchise's exception to a requirement: { franchiseId, requirementId, notApplicable, extraDays, note } */
export async function PUT(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const franchiseId = String(body.franchiseId || '');
    const requirementId = String(body.requirementId || '');
    const ok = await sanityWriteClient.fetch<boolean>(
      `defined(*[_type == "franchisee" && _id == $f][0]._id) && defined(*[_type == "complianceRequirement" && _id == $r][0]._id)`,
      { f: franchiseId, r: requirementId }
    );
    if (!ok) return NextResponse.json({ error: 'Franchise or requirement not found.' }, { status: 404 });

    const extraDays = Math.max(0, Math.min(365, Math.round(Number(body.extraDays) || 0)));
    const notApplicable = body.notApplicable === true;
    const id = `complianceSetting-${franchiseId}-${requirementId.replace(/^complianceRequirement-/, '')}`.replace(/[^A-Za-z0-9_-]/g, '-');
    if (!notApplicable && !extraDays) {
      await sanityWriteClient.delete(id);
      return NextResponse.json({ ok: true });
    }
    await sanityWriteClient.createOrReplace({
      _id: id,
      _type: 'complianceSetting',
      franchise: { _type: 'reference', _ref: franchiseId },
      requirement: { _type: 'reference', _ref: requirementId },
      notApplicable,
      extraDays,
      note: typeof body.note === 'string' ? body.note.trim().slice(0, 200) : '',
    });
    return NextResponse.json({ ok: true });
  } catch (error) {
    console.error('Compliance setting failed:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
