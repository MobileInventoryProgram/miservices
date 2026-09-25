import { NextResponse } from 'next/server';
import { requireAdmin } from '@/lib/admin-auth';
import { sanityWriteClient } from '@/lib/sanity';

const TYPES = ['image/jpeg', 'image/png', 'image/webp', 'image/gif'];
const MAX_BYTES = 10 * 1024 * 1024;

/** POST — Upload an image for a document (multipart "file") */
export async function POST(request: Request) {
  const { response } = await requireAdmin();
  if (response) return response;

  try {
    const form = await request.formData();
    const file = form.get('file');
    if (!(file instanceof File)) return NextResponse.json({ error: 'Choose an image to upload.' }, { status: 400 });
    if (!TYPES.includes(file.type)) return NextResponse.json({ error: 'Images must be JPG, PNG, WebP or GIF.' }, { status: 400 });
    if (file.size > MAX_BYTES) return NextResponse.json({ error: 'Images must be 10MB or smaller.' }, { status: 400 });

    const asset = await sanityWriteClient.assets.upload('image', Buffer.from(await file.arrayBuffer()), {
      filename: file.name.replace(/[^\w.-]+/g, '-').slice(0, 100),
      contentType: file.type,
    });
    return NextResponse.json({ assetRef: asset._id });
  } catch (error) {
    console.error('Error uploading document image:', error);
    return NextResponse.json({ error: 'Failed to upload the image' }, { status: 500 });
  }
}
