import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const { firstName, lastName, email, phone, company, territory, message, privacyConsent, marketingConsent } = body;

    if (!firstName?.trim() || !lastName?.trim() || !email?.trim() || !phone?.trim() || !territory?.trim()) {
      return NextResponse.json(
        { success: false, error: 'Please fill in all required fields' },
        { status: 400 }
      );
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)) {
      return NextResponse.json(
        { success: false, error: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!privacyConsent) {
      return NextResponse.json(
        { success: false, error: 'Privacy policy consent is required' },
        { status: 400 }
      );
    }

    const zapierPayload = {
      firstName: firstName.trim(),
      lastName: lastName.trim(),
      email: email.trim(),
      phone: phone.trim(),
      company: company?.trim() || '',
      territory: territory.trim(),
      message: message?.trim() || '',
      privacyConsent: privacyConsent,
      marketingConsent: marketingConsent || false,
      source: 'Pricing Page',
      submittedAt: new Date().toISOString(),
    };

    const zapierWebhookUrl = 'https://hooks.zapier.com/hooks/catch/20505846/23c8rny/';

    const zapierResponse = await fetch(zapierWebhookUrl, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify(zapierPayload),
    });

    if (!zapierResponse.ok) {
      console.error('Zapier webhook failed:', await zapierResponse.text());
      return NextResponse.json(
        { success: false, error: 'Failed to process request' },
        { status: 500 }
      );
    }

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error('Pricing request error:', error);
    return NextResponse.json(
      { success: false, error: 'Server error occurred' },
      { status: 500 }
    );
  }
}
