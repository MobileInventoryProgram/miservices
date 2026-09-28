import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createFranchiseLogin, emailInUse } from '@/lib/franchisees/admin';
import { isEmail } from '@/lib/franchisees/input';
import { sanityWriteClient } from '@/lib/sanity';

/** POST — Add a login for this franchise. Returns its temporary password, once. */
export async function POST(request: Request, { params }: { params: { id: string } }) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 120) : '';
    if (!name) return NextResponse.json({ error: 'Please give their name.' }, { status: 400 });
    if (!isEmail(email)) return NextResponse.json({ error: 'Please give a valid email address.' }, { status: 400 });

    const franchise = await sanityWriteClient.fetch<{ _id: string; territory?: string } | null>(
      `*[_type == "franchisee" && _id == $id][0] { _id, territory }`,
      { id: params.id }
    );
    if (!franchise) return NextResponse.json({ error: 'Franchise not found.' }, { status: 404 });
    if (await emailInUse(email)) return NextResponse.json({ error: `There's already a login for ${email}.` }, { status: 409 });

    const { memberId, password } = await createFranchiseLogin(franchise, name, email);
    return NextResponse.json({ memberId, email: email.toLowerCase(), password }, { status: 201 });
  } catch (error) {
    console.error('Error adding login:', error);
    return NextResponse.json({ error: 'Failed to add the login' }, { status: 500 });
  }
}
