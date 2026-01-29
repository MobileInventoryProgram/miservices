import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { db } from '@/server/db';
import { users } from '@/db/schema';
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

async function sendEmail(to: string, subject: string, html: string) {
  const RESEND_API_KEY = process.env.RESEND_API_KEY;
  
  if (!RESEND_API_KEY) {
    throw new Error('Resend API key not configured');
  }

  const response = await fetch('https://api.resend.com/emails', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${RESEND_API_KEY}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      from: 'miServices <noreply@miservices.co.uk>',
      to: [to],
      subject: subject,
      html: html,
    }),
  });

  if (!response.ok) {
    const error = await response.text();
    throw new Error(`Failed to send email: ${error}`);
  }

  return response.json();
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { userId, resetPassword } = body;

    if (!userId) {
      return NextResponse.json({ error: 'User ID is required' }, { status: 400 });
    }

    const existingUser = await db.select().from(users).where(eq(users.id, userId));
    if (existingUser.length === 0) {
      return NextResponse.json({ error: 'User not found' }, { status: 404 });
    }

    const user = existingUser[0];
    let temporaryPassword: string | null = null;

    if (resetPassword) {
      temporaryPassword = generatePassword();
      const hashedPassword = await hashPassword(temporaryPassword);
      await db.update(users)
        .set({ password: hashedPassword, updatedAt: new Date() })
        .where(eq(users.id, userId));
    }

    const loginUrl = `${process.env.NEXTAUTH_URL || 'https://miservices.co.uk'}/members/login`;
    const roleLabel = user.role === 'franchise' ? 'Franchise Owner' : user.role === 'superadmin' ? 'Superadministrator' : 'Administrator';

    const emailHtml = `
      <!DOCTYPE html>
      <html>
      <head>
        <style>
          body { font-family: Arial, sans-serif; line-height: 1.6; color: #333; }
          .container { max-width: 600px; margin: 0 auto; padding: 20px; }
          .header { background-color: #3f59a9; color: white; padding: 20px; text-align: center; }
          .content { background-color: #f9f9f9; padding: 30px; border-radius: 5px; margin-top: 20px; }
          .credentials { background-color: white; padding: 15px; border-left: 4px solid #157ec3; margin: 20px 0; }
          .button { display: inline-block; background-color: #157ec3; color: white; padding: 12px 30px; text-decoration: none; border-radius: 5px; margin: 20px 0; }
          .footer { text-align: center; margin-top: 20px; font-size: 12px; color: #666; }
        </style>
      </head>
      <body>
        <div class="container">
          <div class="header">
            <h1>miServices Members Area</h1>
          </div>
          <div class="content">
            <h2>Welcome${resetPassword ? ' Back' : ''}, ${user.firstName}!</h2>
            <p>${resetPassword ? 'Your password has been reset.' : 'Your account has been created.'} You can now access the miServices Members Area.</p>
            
            <div class="credentials">
              <p><strong>Role:</strong> ${roleLabel}</p>
              <p><strong>Email:</strong> ${user.email}</p>
              ${temporaryPassword ? `<p><strong>Temporary Password:</strong> ${temporaryPassword}</p>` : ''}
            </div>

            ${temporaryPassword ? '<p><strong>Important:</strong> Please change your password after logging in for the first time.</p>' : ''}

            <a href="${loginUrl}" class="button">Login to Members Area</a>

            <p>If you have any questions or need assistance, please contact our head office.</p>
          </div>
          <div class="footer">
            <p>&copy; ${new Date().getFullYear()} miServices. All rights reserved.</p>
          </div>
        </div>
      </body>
      </html>
    `;

    await sendEmail(
      user.email,
      resetPassword ? 'Your miServices Password Has Been Reset' : 'Welcome to miServices Members Area',
      emailHtml
    );

    return NextResponse.json({
      message: resetPassword ? 'Password reset email sent successfully' : 'Credentials email sent successfully',
      temporaryPassword: temporaryPassword || undefined
    });
  } catch (error) {
    console.error('Error sending credentials:', error);
    const errorMessage = error instanceof Error ? error.message : 'Unknown error';
    return NextResponse.json({ error: `Failed to send credentials: ${errorMessage}` }, { status: 500 });
  }
}
