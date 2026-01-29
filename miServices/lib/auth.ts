// Authentication utilities for miServices members area
import { scrypt, randomBytes, timingSafeEqual } from 'crypto';
import { promisify } from 'util';
import { db } from '@/server/db';
import { users, type User } from '@/db/schema';
import { eq } from 'drizzle-orm';

const scryptAsync = promisify(scrypt);

// Hash password with salt
export async function hashPassword(password: string): Promise<string> {
  const salt = randomBytes(16).toString('hex');
  const buf = (await scryptAsync(password, salt, 64)) as Buffer;
  return `${buf.toString('hex')}.${salt}`;
}

// Compare supplied password with stored hash
export async function verifyPassword(
  supplied: string,
  stored: string
): Promise<boolean> {
  const [hashed, salt] = stored.split('.');
  const hashedBuf = Buffer.from(hashed, 'hex');
  const suppliedBuf = (await scryptAsync(supplied, salt, 64)) as Buffer;
  return timingSafeEqual(hashedBuf, suppliedBuf);
}

// Get user by username
export async function getUserByUsername(
  username: string
): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.username, username))
    .limit(1);
  return user;
}

// Get user by email
export async function getUserByEmail(
  email: string
): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.email, email))
    .limit(1);
  return user;
}

// Get user by ID
export async function getUserById(id: number): Promise<User | undefined> {
  const [user] = await db
    .select()
    .from(users)
    .where(eq(users.id, id))
    .limit(1);
  return user;
}

// Create new user
export async function createUser(data: {
  username: string;
  email: string;
  password: string;
  firstName: string;
  lastName: string;
  role: 'franchise' | 'staff' | 'admin';
  territory?: string;
  phone?: string;
}): Promise<User> {
  const hashedPassword = await hashPassword(data.password);

  const [user] = await db
    .insert(users)
    .values({
      username: data.username,
      email: data.email,
      password: hashedPassword,
      firstName: data.firstName,
      lastName: data.lastName,
      role: data.role,
      territory: data.territory || null,
      phone: data.phone || null,
      isActive: 'true',
    })
    .returning();

  return user;
}

// Sanitize user object (remove password)
export function sanitizeUser(user: User): Omit<User, 'password'> {
  const { password, ...sanitized } = user;
  return sanitized;
}
