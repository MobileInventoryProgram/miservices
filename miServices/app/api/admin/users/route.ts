import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/server/db';
import { users, User } from '@/db/schema';
import { eq } from 'drizzle-orm';
import { scrypt, randomBytes } from 'crypto';
import { promisify } from 'util';

const scryptAsync = promisify(scrypt);

async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

function generatePassword(): string {
  const length = 12;
  const charset = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789';
  let password = '';
  for (let i = 0; i < length; i++) {
    password += charset.charAt(Math.floor(Math.random() * charset.length));
  }
  return password;
}

export async function GET(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const allUsers = await db.select().from(users).orderBy(users.createdAt);

    const usersWithoutPasswords = allUsers.map((user: User) => {
      const { password, ...userWithoutPassword } = user;
      return userWithoutPassword;
    });

    return NextResponse.json(usersWithoutPasswords);
  } catch (error) {
    console.error('Error fetching users:', error);
    return NextResponse.json({ error: 'Failed to fetch users' }, { status: 500 });
  }
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const {
      firstName,
      lastName,
      email,
      phone,
      role,
      franchiseId,
      companyName,
      postCodes,
      territory,
      townsCities,
      contractLink,
      jobDescription,
      jobDescriptionLink,
      profilePicture,
      tags
    } = body;

    if (!firstName || !lastName || !email || !role) {
      return NextResponse.json(
        { error: 'First name, last name, email, and role are required' },
        { status: 400 }
      );
    }

    if (!['franchise', 'admin', 'superadmin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role. Must be franchise, admin, or superadmin' },
        { status: 400 }
      );
    }

    const existingUser = await db.select().from(users).where(eq(users.email, email));
    if (existingUser.length > 0) {
      return NextResponse.json(
        { error: 'User with this email already exists' },
        { status: 400 }
      );
    }

    const generatedPassword = generatePassword();
    const hashedPassword = await hashPassword(generatedPassword);
    const username = email.split('@')[0];
    
    // Generate unique slug for franchisees
    let slug = null;
    if (role === 'franchise') {
      const slugBase = companyName 
        ? companyName.toLowerCase().replace(/[^a-z0-9]+/g, '-').replace(/^-+|-+$/g, '')
        : `${firstName}-${lastName}`.toLowerCase().replace(/[^a-z0-9]+/g, '-');
      
      // Ensure slug uniqueness by checking existing slugs
      let uniqueSlug = slugBase;
      let counter = 1;
      while (true) {
        const existing = await db.select().from(users).where(eq(users.slug, uniqueSlug)).limit(1);
        if (existing.length === 0) {
          slug = uniqueSlug;
          break;
        }
        uniqueSlug = `${slugBase}-${counter}`;
        counter++;
      }
    }

    const [newUser] = await db.insert(users).values({
      username,
      email,
      password: hashedPassword,
      firstName,
      lastName,
      phone: phone || null,
      role,
      companyName: companyName || null,
      postCodes: postCodes || null,
      territory: territory || null,
      townsCities: townsCities || null,
      contractLink: contractLink || null,
      jobDescription: jobDescription || null,
      jobDescriptionLink: jobDescriptionLink || null,
      profilePicture: profilePicture || null,
      tags: tags || [],
      isActive: 'true',
      slug,
    }).returning();

    const { password, ...userWithoutPassword } = newUser;

    return NextResponse.json({
      user: userWithoutPassword,
      temporaryPassword: generatedPassword,
      message: 'User created successfully'
    }, { status: 201 });
  } catch (error) {
    console.error('Error creating user:', error);
    return NextResponse.json({ error: 'Failed to create user' }, { status: 500 });
  }
}
