import { type NextRequest, NextResponse } from 'next/server'
import { updateSession } from '@/lib/supabase/middleware'

const EXPERIMENTAL_ROUTE_PREFIXES = [
  '/debug',
  '/demo',
  '/working',
  '/minimal',
  '/modern',
  '/artwork-demo',
  '/archive',
  '/exhibition-archive',
];

function isExperimentalRoute(pathname: string) {
  return EXPERIMENTAL_ROUTE_PREFIXES.some((prefix) =>
    pathname === prefix || pathname.startsWith(`${prefix}/`)
  );
}

export async function middleware(request: NextRequest) {
  // Skip middleware for Next.js internal routes and static files
  const pathname = request.nextUrl.pathname
  
  // Skip for auth callback route - it needs to process OAuth responses
  if (pathname.startsWith('/auth/callback')) {
    return NextResponse.next()
  }
  
  // Skip for API routes, static files, and Next.js internals
  if (
    pathname.startsWith('/_next') ||
    pathname.startsWith('/api') ||
    pathname.startsWith('/images') ||
    pathname.startsWith('/data') ||
    pathname.startsWith('/icons') ||
    pathname.startsWith('/manifest') ||
    pathname.includes('.') // static files
  ) {
    return NextResponse.next()
  }

  // For client-side navigation (fetch requests), just pass through
  if (request.headers.get('x-requested-with') === 'XMLHttpRequest' ||
      request.headers.get('accept')?.includes('application/json')) {
    return NextResponse.next()
  }

  const allowExperimentalRoutes = process.env.ENABLE_EXPERIMENTAL_ROUTES === 'true'
  if (process.env.NODE_ENV === 'production' && !allowExperimentalRoutes && isExperimentalRoute(pathname)) {
    return NextResponse.rewrite(new URL('/404', request.url))
  }

  return await updateSession(request)
}

export const config = {
  matcher: [
    /*
     * Match all request paths except for the ones starting with:
     * - _next/static (static files)
     * - _next/image (image optimization files)
     * - favicon.ico (favicon file)
     * - public folder
     */
    '/((?!_next/static|_next/image|favicon.ico|.*\\.(?:svg|png|jpg|jpeg|gif|webp)$).*)',
  ],
}
