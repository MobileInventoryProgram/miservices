import { NextRequest, NextResponse } from 'next/server';
import { getFranchiseeBySlug } from '@/lib/sanity';

export async function GET(
  request: NextRequest,
  { params }: { params: { slug: string } }
) {
  try {
    const franchisee = await getFranchiseeBySlug(params.slug);

    if (!franchisee) {
      return NextResponse.json({ error: 'Franchisee not found' }, { status: 404 });
    }

    return NextResponse.json(franchisee);
  } catch (error) {
    console.error('Error fetching franchisee:', error);
    return NextResponse.json({ error: 'Failed to fetch franchisee' }, { status: 500 });
  }
}
