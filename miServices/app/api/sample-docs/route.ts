import { NextRequest, NextResponse } from 'next/server';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();

    const {
      firstName,
      lastName,
      email,
      phone,
      company,
      privacyConsent,
      marketingConsent,
      documentType,
    } = body;

    if (!firstName || !lastName || !email || !phone || !privacyConsent) {
      return NextResponse.json(
        { error: 'Missing required fields' },
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

    const zapierWebhookUrl = process.env.ZAPIER_SAMPLE_DOCS_WEBHOOK_URL || 
      'https://hooks.zapier.com/hooks/catch/xxxxxx/xxxxxx/';

    const zapierPayload = {
      first_name: firstName,
      last_name: lastName,
      email: email,
      phone: phone,
      company: company || '',
      document_type: documentType,
      privacy_consent: privacyConsent,
      marketing_consent: marketingConsent || false,
      timestamp: new Date().toISOString(),
      source: 'Sample Docs Page',
    };

    try {
      await fetch(zapierWebhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(zapierPayload),
      });
    } catch (zapierError) {
      console.error('Zapier webhook error:', zapierError);
    }

    const documentUrls: Record<string, string> = {
      'Inventory': '/sample-docs/miServices_Inventory_Report_Sample.pdf',
      'Check-Out': '/sample-docs/miServices_CheckOut_Report_Sample.pdf',
      'Property Visit': '/sample-docs/miServices_Property_Visit_Sample.pdf',
    };

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      documentUrl: documentUrls[documentType] || '/sample-docs/sample.pdf',
    });
  } catch (error) {
    console.error('Error processing sample docs request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
