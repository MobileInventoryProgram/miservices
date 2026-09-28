import { NextResponse } from 'next/server';
import { getServerSession } from 'next-auth';
import { authOptions } from '@/lib/auth-options';
import { getMemberScope } from '@/lib/members-access';
import { sanityWriteClient } from '@/lib/sanity';

/**
 * GET — A compliance file, only for Head Office or the franchise it belongs
 * to. Streamed through here so the file's storage address is never shared.
 */
export async function GET(request: Request, { params }: { params: { recordId: string; key: string } }) {
  const session = await getServerSession(authOptions);
  if (!session?.user) return NextResponse.json({ error: 'Unauthorized' }, { status: 401 });

  const file = await sanityWriteClient.fetch<{ franchiseId: string; name: string; url: string; mimeType: string } | null>(
    `*[_type == "complianceRecord" && _id == $id][0]{
      "franchiseId": franchise._ref,
      "file": files[_key == $key][0] { "name": coalesce(name, asset->originalFilename, "file"), "url": asset->url, "mimeType": asset->mimeType }
    } { franchiseId, "name": file.name, "url": file.url, "mimeType": file.mimeType }`,
    { id: params.recordId, key: params.key }
  );
  if (!file?.url) return NextResponse.json({ error: 'File not found' }, { status: 404 });

  if (session.user.role !== 'admin') {
    const scope = await getMemberScope(session);
    if (!scope?.franchiseeId || scope.franchiseeId !== file.franchiseId) return NextResponse.json({ error: 'Not your franchise' }, { status: 403 });
  }

  const upstream = await fetch(file.url, { cache: 'no-store' });
  if (!upstream.ok || !upstream.body) return NextResponse.json({ error: 'File unavailable' }, { status: 502 });
  const download = new URL(request.url).searchParams.has('download');
  return new NextResponse(upstream.body, {
    headers: {
      'Content-Type': file.mimeType || 'application/octet-stream',
      'Content-Disposition': `${download ? 'attachment' : 'inline'}; filename="${file.name.replace(/"/g, '')}"`,
      'Cache-Control': 'private, no-store',
      'X-Content-Type-Options': 'nosniff',
    },
  });
}
