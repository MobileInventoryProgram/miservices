import { sendToZapier } from '@/lib/forms';
import { NextRequest, NextResponse } from 'next/server';

interface ContactFormData {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  company: string;
  reason: string;
  message: string;
  privacyConsent: boolean;
  marketingConsent: boolean;
}

export async function POST(request: NextRequest) {
  try {
    const body: ContactFormData = await request.json();

    if (!body.firstName || !body.firstName.trim()) {
      return NextResponse.json(
        { message: 'First name is required' },
        { status: 400 }
      );
    }

    if (!body.lastName || !body.lastName.trim()) {
      return NextResponse.json(
        { message: 'Last name is required' },
        { status: 400 }
      );
    }

    if (!body.email || !body.email.trim()) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(body.email)) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!body.phone || !body.phone.trim()) {
      return NextResponse.json(
        { message: 'Phone number is required' },
        { status: 400 }
      );
    }

    if (!body.reason) {
      return NextResponse.json(
        { message: 'Reason for contact is required' },
        { status: 400 }
      );
    }

    if (!body.message || !body.message.trim()) {
      return NextResponse.json(
        { message: 'Message is required' },
        { status: 400 }
      );
    }

    if (!body.privacyConsent) {
      return NextResponse.json(
        { message: 'Privacy policy consent is required' },
        { status: 400 }
      );
    }


    const zapierPayload = {
      firstName: body.firstName,
      lastName: body.lastName,
      email: body.email,
      phone: body.phone,
      company: body.company || '',
      reason: body.reason,
      message: body.message,
      marketingConsent: body.marketingConsent,
      source: 'Website Contact Form',
      timestamp: new Date().toISOString(),
    };

    const zapier = await sendToZapier(process.env.ZAPIER_WEBHOOK_URL, zapierPayload);

    if (!zapier.ok) {
      console.error('Zapier webhook failed:', zapier.error);
      return NextResponse.json(
        { message: 'Failed to send data to CRM. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Form submitted successfully',
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Contact form API error:', error);
    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
