import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createFranchiseLogin, emailInUse, uniqueFranchiseSlug } from '@/lib/franchisees/admin';
import { readNewFranchise } from '@/lib/franchisees/input';
import { revalidateNetwork } from '@/lib/franchisee-access';
import { sanityWriteClient } from '@/lib/sanity';

/**
 * POST — Add a franchise. It starts hidden from Our Network (switched on from
 * its page once set up), with an optional login for the owner. The login's
 * temporary password is returned once and never stored in plain text.
 */
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const result = readNewFranchise(await request.json().catch(() => ({})));
    if ('error' in result) return NextResponse.json({ error: result.error }, { status: 400 });
    const { input } = result;

    if (input.createLogin && (await emailInUse(input.owner.email))) {
      return NextResponse.json({ error: `There's already a login for ${input.owner.email}. Untick "Create a login" or use a different email.` }, { status: 409 });
    }

    const slug = await uniqueFranchiseSlug(input.companyName);
    const doc = await sanityWriteClient.create({
      _type: 'franchisee',
      companyName: input.companyName,
      slug: { _type: 'slug', current: slug },
      territory: input.territory,
      postCodes: input.postCodes,
      townsCities: input.townsCities,
      owners: [{ _key: 'owner-0', ...input.owner }],
      isActive: true,
      showOnNetwork: false,
    });

    const login = input.createLogin
      ? { email: input.owner.email.toLowerCase(), ...(await createFranchiseLogin(doc, `${input.owner.firstName} ${input.owner.lastName}`, input.owner.email)) }
      : null;

    revalidateNetwork(slug);
    return NextResponse.json({ id: doc._id, login: login && { email: login.email, password: login.password } }, { status: 201 });
  } catch (error) {
    console.error('Error adding franchise:', error);
    return NextResponse.json({ error: 'Failed to add the franchise' }, { status: 500 });
  }
}
