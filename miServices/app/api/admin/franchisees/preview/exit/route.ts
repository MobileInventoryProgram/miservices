import { NextResponse } from 'next/server';
import { draftMode } from 'next/headers';

/** GET — Leave franchise page preview */
export async function GET(request: Request) {
  draftMode().disable();
  return NextResponse.redirect(new URL('/members/franchisees', request.url));
}
