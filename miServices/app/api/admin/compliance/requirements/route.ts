import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { readRequirementInput, requirementFields } from '@/lib/compliance/input';
import { newKey } from '@/lib/documents/standard';
import { ukToday } from '@/lib/dates';
import { sanityWriteClient } from '@/lib/sanity';

/** POST — Add a requirement for every franchise, tracked from today */
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;
  try {
    const result = readRequirementInput(await request.json().catch(() => ({})));
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
    const last = await sanityWriteClient.fetch<number | null>(`math::max(*[_type == "complianceRequirement"].order)`);
    const doc = await sanityWriteClient.create({
      _id: `complianceRequirement-${newKey()}`,
      _type: 'complianceRequirement',
      ...requirementFields(result.input),
      startsOn: ukToday(),
      order: (last || 0) + 1,
      isActive: true,
    });
    return NextResponse.json({ id: doc._id }, { status: 201 });
  } catch (error) {
    console.error('Add requirement failed:', error);
    return NextResponse.json({ error: 'Failed to save' }, { status: 500 });
  }
}
