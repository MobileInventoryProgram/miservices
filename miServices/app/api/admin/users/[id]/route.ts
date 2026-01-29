import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/server/db';
import { users } from '@/db/schema';
import { eq } from 'drizzle-orm';

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      companyName,
      postCodes,
      territory,
      townsCities,
      contractLink,
      jobDescription,
      jobDescriptionLink,
      profilePicture,
      tags,
      isActive
    } = body;

    const existingUser = await db.select().from(users).where(eq(users.id, userId));
    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (email && email !== existingUser[0].email) {
      const emailCheck = await db.select().from(users).where(eq(users.email, email));
      if (emailCheck.length > 0) {
        return NextResponse.json(
          { error: 'Email already in use by another user' },
          { status: 400 }
        );
      }
    }

    const [updatedUser] = await db.update(users)
      .set({
        firstName: firstName || existingUser[0].firstName,
        lastName: lastName || existingUser[0].lastName,
        email: email || existingUser[0].email,
        phone: phone !== undefined ? phone : existingUser[0].phone,
        companyName: companyName !== undefined ? companyName : existingUser[0].companyName,
        postCodes: postCodes !== undefined ? postCodes : existingUser[0].postCodes,
        territory: territory !== undefined ? territory : existingUser[0].territory,
        townsCities: townsCities !== undefined ? townsCities : existingUser[0].townsCities,
        contractLink: contractLink !== undefined ? contractLink : existingUser[0].contractLink,
        jobDescription: jobDescription !== undefined ? jobDescription : existingUser[0].jobDescription,
        jobDescriptionLink: jobDescriptionLink !== undefined ? jobDescriptionLink : existingUser[0].jobDescriptionLink,
        profilePicture: profilePicture !== undefined ? profilePicture : existingUser[0].profilePicture,
        tags: tags !== undefined ? tags : existingUser[0].tags,
        isActive: isActive !== undefined ? isActive : existingUser[0].isActive,
        updatedAt: new Date(),
      })
      .where(eq(users.id, userId))
      .returning();

    const { password, ...userWithoutPassword } = updatedUser;

    return NextResponse.json({
      user: userWithoutPassword,
      message: 'User updated successfully'
    });
  } catch (error) {
    console.error('Error updating user:', error);
    return NextResponse.json({ error: 'Failed to update user' }, { status: 500 });
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const userId = parseInt(params.id);
    if (isNaN(userId)) {
      return NextResponse.json({ error: 'Invalid user ID' }, { status: 400 });
    }

    const existingUser = await db.select().from(users).where(eq(users.id, userId));
    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    if (String(existingUser[0].id) === session.user.id) {
      return NextResponse.json(
        { error: 'Cannot delete your own account' },
        { status: 400 }
      );
    }

    await db.delete(users).where(eq(users.id, userId));

    return NextResponse.json({ message: 'User deleted successfully' });
  } catch (error) {
    console.error('Error deleting user:', error);
    return NextResponse.json({ error: 'Failed to delete user' }, { status: 500 });
  }
}
