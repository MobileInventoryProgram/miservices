import { sanityClient } from '@/lib/sanity';
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

    // The sample PDF uploaded for this report type on the Sample Documents page in the CMS
    const documentUrl = await sanityClient
      .fetch<string | null>(`*[_id == "sampleDocumentsPage"][0].documents[name == $name][0].file.asset->url`, { name: String(documentType || '') })
      .catch(() => null);

    return NextResponse.json({
      success: true,
      message: 'Form submitted successfully',
      documentUrl,
    });
  } catch (error) {
    console.error('Error processing sample docs request:', error);
    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    );
  }
}
