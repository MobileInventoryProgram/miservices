// Registration API route for creating new users
import { NextRequest, NextResponse } from 'next/server';
import { createUser, getUserByUsername, getUserByEmail } from '@/lib/auth';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    const { username, email, password, name, firstName, lastName, role, franchiseTerritory } = body;

    // Parse name into firstName/lastName if not provided separately
    let first = firstName;
    let last = lastName;
    if (!first && !last && name) {
      const nameParts = name.trim().split(' ');
      first = nameParts[0] || '';
      last = nameParts.slice(1).join(' ') || '';
    }

    // Validation
    if (!username || !email || !password || !first || !role) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    // Validate role
    if (!['franchise', 'staff', 'admin'].includes(role)) {
      return NextResponse.json(
        { error: 'Invalid role' },
        { status: 400 }
      );
    }

    // Check if username already exists
    const existingUsername = await getUserByUsername(username);
    if (existingUsername) {
      return NextResponse.json(
        { error: 'Username already exists' },
        { status: 400 }
      );
    }

    // Check if email already exists
    const existingEmail = await getUserByEmail(email);
    if (existingEmail) {
      return NextResponse.json(
        { error: 'Email already exists' },
        { status: 400 }
      );
    }

    // Create user
    const user = await createUser({
      username,
      email,
      password,
      firstName: first,
      lastName: last || '',
      role,
      territory: franchiseTerritory || undefined,
    });

    // Return success (without password)
    const { password: _, ...userWithoutPassword } = user;

    return NextResponse.json(
      { message: 'User created successfully', user: userWithoutPassword },
      { status: 201 }
    );
  } catch (error) {
    console.error('Registration error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
