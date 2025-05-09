import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD_COOKIE_NAME = 'sohoz88_admin_auth';

export async function middleware(request: NextRequest) {
  const { pathname } = request.nextUrl;

  if (pathname.startsWith('/admin') && !pathname.startsWith('/admin/login')) {
    const isAuthenticated = request.cookies.get(ADMIN_PASSWORD_COOKIE_NAME)?.value === 'true';

    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', request.url);
      loginUrl.searchParams.set('redirect', pathname); // Pass current path for redirect after login
      return NextResponse.redirect(loginUrl);
    }
  }
  return NextResponse.next();
}

export const config = {
  matcher: ['/admin/:path*', '/admin'], // Protects /admin and all its sub-paths
};
