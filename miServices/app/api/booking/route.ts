import { NextRequest, NextResponse } from 'next/server';
import { writeFile } from 'fs/promises';
import path from 'path';

interface PropertySize {
  bedrooms: number;
  bathrooms: number;
  livingRooms: number;
  kitchens: number;
}

export async function POST(request: NextRequest) {
  try {
    const formData = await request.formData();

    const firstName = formData.get('firstName') as string;
    const lastName = formData.get('lastName') as string;
    const phone = formData.get('phone') as string;
    const email = formData.get('email') as string;
    const company = formData.get('company') as string || '';
    const address = formData.get('address') as string;
    const postcode = formData.get('postcode') as string;
    const jobType = formData.get('jobType') as string;
    const propertySizeStr = formData.get('propertySize') as string;
    const bookingDate = formData.get('bookingDate') as string;
    const keysLocation = formData.get('keysLocation') as string || '';
    const additionalInfo = formData.get('additionalInfo') as string || '';
    const file = formData.get('file') as File | null;

    if (!firstName || !firstName.trim()) {
      return NextResponse.json(
        { message: 'First name is required' },
        { status: 400 }
      );
    }

    if (!lastName || !lastName.trim()) {
      return NextResponse.json(
        { message: 'Last name is required' },
        { status: 400 }
      );
    }

    if (!phone || !phone.trim()) {
      return NextResponse.json(
        { message: 'Contact number is required' },
        { status: 400 }
      );
    }

    if (!email || !email.trim()) {
      return NextResponse.json(
        { message: 'Email is required' },
        { status: 400 }
      );
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return NextResponse.json(
        { message: 'Invalid email address' },
        { status: 400 }
      );
    }

    if (!address || !address.trim()) {
      return NextResponse.json(
        { message: 'Property address is required' },
        { status: 400 }
      );
    }

    if (!postcode || !postcode.trim()) {
      return NextResponse.json(
        { message: 'Postcode is required' },
        { status: 400 }
      );
    }

    if (!jobType) {
      return NextResponse.json(
        { message: 'Job type is required' },
        { status: 400 }
      );
    }

    if (!bookingDate) {
      return NextResponse.json(
        { message: 'Booking date is required' },
        { status: 400 }
      );
    }

    const propertySize: PropertySize = JSON.parse(propertySizeStr);

    if (propertySize.bedrooms === 0 && propertySize.bathrooms === 0 && propertySize.livingRooms === 0 && propertySize.kitchens === 0) {
      return NextResponse.json(
        { message: 'Please specify at least one room in the property size' },
        { status: 400 }
      );
    }

    let fileUrl = '';
    if (file && file.size > 0) {
      const bytes = await file.arrayBuffer();
      const buffer = Buffer.from(bytes);

      const originalName = file.name || 'upload';
      const extension = originalName.split('.').pop()?.toLowerCase() || '';
      
      const allowedExtensions = ['pdf', 'jpg', 'jpeg', 'png'];
      if (!allowedExtensions.includes(extension)) {
        return NextResponse.json(
          { message: 'Invalid file type. Only PDF, JPG, and PNG files are allowed.' },
          { status: 400 }
        );
      }

      const sanitizedFileName = `${Date.now()}-${Math.random().toString(36).substring(7)}.${extension}`;
      const uploadsDir = path.join(process.cwd(), 'public', 'uploads');
      const filePath = path.join(uploadsDir, sanitizedFileName);

      const resolvedPath = path.resolve(filePath);
      const resolvedUploadsDir = path.resolve(uploadsDir);
      if (!resolvedPath.startsWith(resolvedUploadsDir)) {
        return NextResponse.json(
          { message: 'Invalid file path' },
          { status: 400 }
        );
      }

      try {
        await writeFile(resolvedPath, buffer);
        fileUrl = `/uploads/${sanitizedFileName}`;
      } catch (error) {
        console.error('File upload error:', error);
        return NextResponse.json(
          { message: 'File upload failed' },
          { status: 500 }
        );
      }
    }

    const jobTypeLabels: Record<string, string> = {
      'inventory': 'Inventory',
      'inventory-check-in': 'Inventory with Check-In',
      'check-out': 'Check-Out',
      'mid-term': 'Mid-Term',
      'block-management': 'Block Management',
    };

    const propertySizeDescription = `${propertySize.bedrooms} bed, ${propertySize.bathrooms} bath, ${propertySize.livingRooms} living room(s), ${propertySize.kitchens} kitchen(s)`;

    const categoryUuidMap: Record<string, string> = {
      'inventory': 'a4823241-6b9a-4aa5-9769-1bf6d961cccb',
      'inventory-check-in': '4de63a0e-a19c-4002-a1e5-1c0d6516a5eb',
      'check-out': '90e6040f-c445-4a9d-84d7-1c00ac445cbb',
      'mid-term': 'f18a762a-1d51-4996-82a4-1c00a8be978b',
      'block-management': '9922ec75-1dbe-455d-abc8-1c0d6181cdab',
    };

    const jobDescriptionLines = [
      `Client: ${firstName} ${lastName}`,
      company ? `Company: ${company}` : '',
      `Phone: ${phone}`,
      `Email: ${email}`,
      `Job Type: ${jobTypeLabels[jobType] || jobType}`,
      `Property: ${propertySizeDescription}`,
      `Keys: ${keysLocation || 'Not specified'}`,
      `Notes: ${additionalInfo || 'None'}`,
      fileUrl ? `Incoming Inventory: ${fileUrl}` : '',
      `Source: Website Booking Form`,
    ].filter(Boolean).join('\n');

    const formattedDate = new Date(bookingDate).toISOString().replace('T', ' ').replace(/\.\d{3}Z$/, '');

    const servicem8Payload = {
      status: 'Quote',
      date: formattedDate,
      job_address: `${address}, ${postcode}`,
      job_description: jobDescriptionLines,
      category_uuid: categoryUuidMap[jobType] || '',
      customfield_key_location: keysLocation,
    };

    const servicem8ApiKey = process.env.SERVICEM8_API_KEY;
    if (!servicem8ApiKey) {
      console.error('SERVICEM8_API_KEY is not configured');
      return NextResponse.json(
        { message: 'Booking service is not configured. Please try again later.' },
        { status: 500 }
      );
    }

    const servicem8Response = await fetch('https://api.servicem8.com/api_1.0/job.json', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'X-API-Key': servicem8ApiKey,
      },
      body: JSON.stringify(servicem8Payload),
    });

    if (!servicem8Response.ok) {
      console.error('ServiceM8 API failed:', await servicem8Response.text());
      return NextResponse.json(
        { message: 'Failed to process booking. Please try again later.' },
        { status: 500 }
      );
    }

    return NextResponse.json(
      {
        message: 'Booking submitted successfully',
        success: true,
      },
      { status: 200 }
    );
  } catch (error) {
    console.error('Booking API error:', error);
    return NextResponse.json(
      { message: 'Internal server error. Please try again later.' },
      { status: 500 }
    );
  }
}
