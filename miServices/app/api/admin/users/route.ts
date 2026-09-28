import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { createLogin, emailInUse } from '@/lib/franchisees/admin';
import { isEmail } from '@/lib/franchisees/input';
import { sanityWriteClient } from '@/lib/sanity';

/**
 * POST — Add a Members Area login: { name, email, role: 'franchisee' | 'admin', franchiseeId? }.
 * Franchise users need a franchise; Head Office admins see everything.
 * Returns the temporary password, once.
 */
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const body = (await request.json().catch(() => ({}))) as Record<string, unknown>;
    const name = typeof body.name === 'string' ? body.name.trim().slice(0, 120) : '';
    const email = typeof body.email === 'string' ? body.email.trim().slice(0, 120) : '';
    const role = body.role === 'admin' ? 'admin' : 'franchisee';
    if (!name) return NextResponse.json({ error: 'Please give their name.' }, { status: 400 });
    if (!isEmail(email)) return NextResponse.json({ error: 'Please give a valid email address.' }, { status: 400 });
    if (await emailInUse(email)) return NextResponse.json({ error: `There's already a login for ${email}.` }, { status: 409 });

    let franchise: { _id: string; territory?: string; isActive?: boolean } | null = null;
    if (role === 'franchisee') {
      if (typeof body.franchiseeId !== 'string' || !body.franchiseeId) {
        return NextResponse.json({ error: 'Please choose which franchise they belong to.' }, { status: 400 });
      }
      franchise = await sanityWriteClient.fetch(`*[_type == "franchisee" && _id == $id][0] { _id, territory, isActive }`, { id: body.franchiseeId });
      if (!franchise) return NextResponse.json({ error: 'Franchise not found.' }, { status: 404 });
      if (franchise.isActive === false) return NextResponse.json({ error: 'That franchise is deactivated. Reactivate it first.' }, { status: 400 });
    }

    const { memberId, password } = await createLogin({ name, email, role, franchise });
    return NextResponse.json({ memberId, email: email.toLowerCase(), password }, { status: 201 });
  } catch (error) {
    console.error('Error adding user:', error);
    return NextResponse.json({ error: 'Failed to add the user' }, { status: 500 });
  }
}
