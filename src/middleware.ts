
import { NextRequest, NextResponse } from 'next/server';

const ADMIN_PASSWORD_COOKIE_NAME = 'sohoz88_admin_auth';

export async function middleware(request: NextRequest) {
  const { pathname, search, origin } = request.nextUrl;

  // If the request is for the login page itself, allow it to proceed without auth check.
  if (pathname === '/admin/login') {
    return NextResponse.next();
  }

  // For any other path starting with /admin, check authentication.
  if (pathname.startsWith('/admin')) {
    const isAuthenticated = request.cookies.get(ADMIN_PASSWORD_COOKIE_NAME)?.value === 'true';

    if (!isAuthenticated) {
      const loginUrl = new URL('/admin/login', origin); // Use origin for base URL
      
      // Preserve the original path (and query string) for redirecting back after successful login
      let redirectTo = pathname;
      if (search) { // search includes the leading '?'
        redirectTo += search;
      }
      loginUrl.searchParams.set('redirect', redirectTo);
      return NextResponse.redirect(loginUrl);
    }
  }

  // For any other path not handled above (e.g. public site pages), allow to proceed.
  return NextResponse.next();
}

export const config = {
  // This matcher ensures the middleware runs for /admin and all its sub-paths.
  // The logic within the middleware function then decides on auth checks.
  matcher: ['/admin/:path*', '/admin'],
};

