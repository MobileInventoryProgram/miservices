import { NextResponse } from 'next/server';
import { getFranchisees } from '@/lib/sanity';

export async function GET() {
  try {
    const franchisees = await getFranchisees();
    return NextResponse.json(franchisees);
  } catch (error) {
    console.error('Error fetching franchisees:', error);
    return NextResponse.json({ error: 'Failed to fetch franchisees' }, { status: 500 });
  }
}
