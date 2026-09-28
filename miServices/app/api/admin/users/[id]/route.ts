import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { hashPassword } from '@/lib/auth';
import { isLastActiveAdmin, temporaryPassword } from '@/lib/franchisees/admin';
import { sanityWriteClient } from '@/lib/sanity';

/**
 * PATCH — { action: 'reset-password' | 'switch-off' | 'switch-on' } for any
 * login. A reset returns the new temporary password, once. You can't switch
 * off your own login or the last Head Office admin.
 */
export async function PATCH(request: Request, { params }: { params: { id: string } }) {
  const { session, response } = await requireAdmin();
  if (response) return response;

  try {
    const { action } = (await request.json().catch(() => ({}))) as { action?: string };
    const member = await sanityWriteClient.fetch<{ _id: string; franchiseInactive: boolean } | null>(
      `*[_type == "member" && _id == $id][0] { _id, "franchiseInactive": defined(franchisee) && franchisee->isActive != true }`,
      { id: params.id }
    );
    if (!member) return NextResponse.json({ error: 'Login not found.' }, { status: 404 });

    if (action === 'reset-password') {
      const password = temporaryPassword();
      await sanityWriteClient.patch(member._id).set({ hashedPassword: await hashPassword(password) }).commit();
      return NextResponse.json({ password });
    }
    if (action === 'switch-off') {
      if (member._id === session.user.id) return NextResponse.json({ error: "You can't switch off your own login." }, { status: 400 });
      if (await isLastActiveAdmin(member._id)) {
        return NextResponse.json({ error: "This is the only Head Office admin login left, so it can't be switched off." }, { status: 400 });
      }
    }
    if (action === 'switch-on' && member.franchiseInactive) {
      return NextResponse.json({ error: 'Their franchise is deactivated. Reactivate the franchise to switch its logins back on.' }, { status: 400 });
    }
    if (action === 'switch-off' || action === 'switch-on') {
      await sanityWriteClient
        .patch(member._id)
        .set({ isActive: action === 'switch-on' })
        .unset(['deactivatedWithFranchise'])
        .commit();
      return NextResponse.json({ ok: true });
    }
    return NextResponse.json({ error: 'Unknown action.' }, { status: 400 });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update the login' }, { status: 500 });
  }
}
