import { NextResponse } from 'next/server';
import type { NextRequest } from 'next/server';

export function middleware(request: NextRequest) {
  // For now, we'll handle authentication on the client side
  // This middleware can be extended later for server-side auth with Supabase
  return NextResponse.next();
}

export const config = {
  matcher: ['/dashboard/:path*']
};