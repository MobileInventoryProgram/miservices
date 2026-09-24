import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getContactForScope } from '@/lib/crm/contacts';
import { parseContactInput } from '@/lib/crm/validate';
import { getMemberScope } from '@/lib/members-access';
import { sanityWriteClient } from '@/lib/sanity';

async function findContact(id: string) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return { status: 401 as const };
  const scope = await getMemberScope(session);
  if (!scope) return { status: 404 as const };
  const contact = await getContactForScope(scope, id);
  return contact ? { contact } : { status: 404 as const };
}

/**
 * PUT — Update a contact the member can see (their franchise's, or any for admins).
 */
export async function PUT(request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const found = await findContact(id);
    if (!found.contact) {
      return NextResponse.json(
        { error: found.status === 401 ? 'Unauthorised' : 'Contact not found' },
        { status: found.status }
      );
    }

    const { data, error } = parseContactInput(await request.json());
    if (!data) {
      return NextResponse.json({ error }, { status: 400 });
    }

    await sanityWriteClient
      .patch(id)
      .set({ ...data, updatedAt: new Date().toISOString() })
      .commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error updating contact:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}

/**
 * DELETE — Archive a contact. It disappears from Contacts but stays linked
 * to any quotes already sent.
 */
export async function DELETE(_request: Request, { params }: { params: Promise<{ id: string }> }) {
  try {
    const { id } = await params;
    const found = await findContact(id);
    if (!found.contact) {
      return NextResponse.json(
        { error: found.status === 401 ? 'Unauthorised' : 'Contact not found' },
        { status: found.status }
      );
    }

    await sanityWriteClient
      .patch(id)
      .set({ archived: true, updatedAt: new Date().toISOString() })
      .commit();

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Error archiving contact:', error);
    return NextResponse.json({ error: 'Something went wrong' }, { status: 500 });
  }
}
