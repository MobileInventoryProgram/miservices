import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { hashPassword } from '@/lib/auth';
import { temporaryPassword } from '@/lib/franchisees/admin';
import { sanityWriteClient } from '@/lib/sanity';

/**
 * PATCH — { action: 'reset-password' | 'switch-off' | 'switch-on' } for one of
 * this franchise's logins. A reset returns the new temporary password, once.
 */
export async function PATCH(request: Request, { params }: { params: { id: string; memberId: string } }) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    const { action } = (await request.json().catch(() => ({}))) as { action?: string };
    const member = await sanityWriteClient.fetch<{ _id: string } | null>(
      `*[_type == "member" && _id == $memberId && franchisee._ref == $id][0] { _id }`,
      { memberId: params.memberId, id: params.id }
    );
    if (!member) return NextResponse.json({ error: 'Login not found for this franchise.' }, { status: 404 });

    if (action === 'reset-password') {
      const password = temporaryPassword();
      await sanityWriteClient.patch(member._id).set({ hashedPassword: await hashPassword(password) }).commit();
      return NextResponse.json({ password });
    }
    if (action === 'switch-off' || action === 'switch-on') {
      if (action === 'switch-off' && member._id === session.user.id) {
        return NextResponse.json({ error: "You can't switch off your own login." }, { status: 400 });
      }
      await sanityWriteClient
        .patch(member._id)
        .set({ isActive: action === 'switch-on' })
        .unset(['deactivatedWithFranchise'])
        .commit();
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    console.error('Error updating login:', error);
    return NextResponse.json({ error: 'Failed to update the login' }, { status: 500 });
  }
}
