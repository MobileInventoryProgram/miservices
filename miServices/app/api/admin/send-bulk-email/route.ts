import { NextRequest, NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';

interface Recipient {
  email: string;
  firstName: string;
  lastName: string;
}

export async function POST(request: NextRequest) {
  try {
    const session = await getServerSession(authOptions);
    
    if (!session || (session.user.role !== 'admin' && session.user.role !== 'superadmin')) {
      return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const body = await request.json();
    const { recipients, subject, body: emailBody } = body;

    if (!recipients || !Array.isArray(recipients) || recipients.length === 0) {
      return NextResponse.json({ error: 'No recipients provided' }, { status: 400 });
    }

    if (!subject || !emailBody) {
      return NextResponse.json({ error: 'Subject and body are required' }, { status: 400 });
    }

    // In a real implementation, you would integrate with an email service like Resend
    // For now, we'll simulate sending emails
    console.log('Sending bulk email to', recipients.length, 'recipients');
    console.log('Subject:', subject);
    
    // Simulate sending emails with personalization
    const emailPromises = recipients.map(async (recipient: Recipient) => {
      let personalizedBody = emailBody;
      
      // Replace personalization tags
      personalizedBody = personalizedBody.replace(/\{\{firstName\}\}/g, recipient.firstName);
      personalizedBody = personalizedBody.replace(/\{\{lastName\}\}/g, recipient.lastName);
      personalizedBody = personalizedBody.replace(/\{\{fullName\}\}/g, `${recipient.firstName} ${recipient.lastName}`);

      console.log(`Email to ${recipient.email}:`);
      console.log('---');
      console.log(`Subject: ${subject}`);
      console.log(`Body:\n${personalizedBody}`);
      console.log('---\n');

      // In production, this would be:
      // await resend.emails.send({
      //   from: 'miServices <noreply@miservices.co.uk>',
      //   to: recipient.email,
      //   subject: subject,
      //   html: `<html><body style="font-family: Arial, sans-serif;">
      //     <img src="https://yourdomain.com/logo.png" alt="miServices" width="200"/>
      //     <div style="margin-top: 20px;">${personalizedBody.replace(/\n/g, '<br>')}</div>
      //     <div style="margin-top: 40px; padding-top: 20px; border-top: 1px solid #ccc; color: #666;">
      //       <p>miServices - Professional Property Inspection Services</p>
      //     </div>
      //   </body></html>`,
      // });
      
      return { success: true, email: recipient.email };
    });

    await Promise.all(emailPromises);

    return NextResponse.json({ 
      message: 'Emails sent successfully',
      count: recipients.length,
      note: 'Email service not configured. Check server logs for email content.'
    }, { status: 200 });
  } catch (error) {
    console.error('Error sending bulk email:', error);
    return NextResponse.json({ error: 'Failed to send emails' }, { status: 500 });
  }
}
