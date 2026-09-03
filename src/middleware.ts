import { defineMiddleware } from 'astro:middleware';
import { buildLoginRedirect, getSessionFromRequest, isAllowedForPath, isProtectedPath } from './lib/auth';

export const onRequest = defineMiddleware((context, next) => {
  const pathname = context.url.pathname;
  const session = getSessionFromRequest(context.request);
  context.locals.session = session;

  if (pathname === '/login' && session) {
    return context.redirect('/dashboard');
  }

  if (isProtectedPath(pathname) && !session) {
    return context.redirect(buildLoginRedirect(pathname, context.url.origin));
  }

  if (isProtectedPath(pathname) && session && !isAllowedForPath(pathname, session.role)) {
    return new Response('Forbidden', { status: 403 });
  }

  return next();
});
