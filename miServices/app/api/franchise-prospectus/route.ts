import { formsDisabled } from '@/lib/forms';
import { addWebsiteSignup } from '@/lib/marketing/sync';
import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      desiredTerritory,
      message,
      privacyConsent,
      marketingConsent,
    } = body;

    if (!firstName || !lastName || !email || !phone || !desiredTerritory) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      );
    }

    if (!privacyConsent) {
      return NextResponse.json(
        { error: 'Privacy consent is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { error: 'Invalid email address' },
        { status: 400 }
      );
    }

    const zapierPayload = {
      firstName,
      lastName,
      email,
      phone,
      desiredTerritory,
      message: message || 'No additional message provided',
      privacyConsent: privacyConsent ? 'Yes' : 'No',
      marketingConsent: marketingConsent ? 'Yes' : 'No',
      source: 'Franchise Prospectus Download',
      submittedAt: new Date().toISOString(),
    };

    if (marketingConsent === true) {
      await addWebsiteSignup({ email, firstName, lastName, source: 'website-franchise-prospectus', list: 'enquiries' });
    }

    const zapierWebhookUrl = process.env.ZAPIER_FRANCHISE_WEBHOOK_URL;
    
    if (formsDisabled()) {
      console.log('[forms disabled] franchise prospectus request not sent');
    } else if (zapierWebhookUrl) {
      try {
        const zapierResponse = await fetch(zapierWebhookUrl, {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(zapierPayload),
        });

        if (!zapierResponse.ok) {
          console.error('Zapier webhook failed:', await zapierResponse.text());
        }
      } catch (zapierError) {
        console.error('Error sending to Zapier:', zapierError);
      }
    } else {
      console.warn('ZAPIER_FRANCHISE_WEBHOOK_URL not configured');
      console.log('Franchise prospectus request data:', zapierPayload);
    }

    return NextResponse.json(
      {
        success: true,
        message: 'Franchise prospectus request submitted successfully',
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Franchise prospectus submission error:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
