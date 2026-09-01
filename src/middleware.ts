import { defineMiddleware } from 'astro:middleware';
import { getSessionFromCookies, isAllowedForPath, isProtectedPath } from './lib/auth';

export const onRequest = defineMiddleware((context, next) => {
  const pathname = context.url.pathname;
  const cookieHeader = context.request.headers.get('cookie') ?? '';
  const session = getSessionFromCookies(cookieHeader);

  if (pathname === '/login' && session) {
    return context.redirect('/dashboard');
  }

  if (isProtectedPath(pathname) && !session) {
    const target = new URL('/login', context.url.origin);
    target.searchParams.set('next', pathname);
    return context.redirect(target.toString());
  }

  if (isProtectedPath(pathname) && session && !isAllowedForPath(pathname, session.role)) {
    return new Response('Forbidden', { status: 403 });
  }

  return next();
});
