import type { APIRoute } from 'astro';
import { createSessionCookie, getSessionFromCookies, sanitizeNextPath, verifyCredentials } from '../../lib/auth';

export const POST: APIRoute = async ({ request, redirect }) => {
  try {
    const body = await request.json();
    const username = String(body.username ?? '');
    const password = String(body.password ?? '');
    const requestedNext = String(body.next ?? '/dashboard');
    const next = sanitizeNextPath(requestedNext, '/dashboard');

    const account = verifyCredentials(username, password);
    if (!account) {
      return new Response(JSON.stringify({ message: 'Invalid credentials' }), {
        status: 401,
        headers: { 'Content-Type': 'application/json' },
      });
    }

    const cookieValue = createSessionCookie({
      id: account.id,
      name: account.name,
      username: account.username,
      role: account.role,
    });

    return new Response(JSON.stringify({ redirect: next }), {
      status: 200,
      headers: {
        'Content-Type': 'application/json',
        'Set-Cookie': cookieValue,
      },
    });
  } catch {
    return new Response(JSON.stringify({ message: 'Invalid request body' }), {
      status: 400,
      headers: { 'Content-Type': 'application/json' },
    });
  }
};

export const GET: APIRoute = async ({ request, redirect }) => {
  const session = getSessionFromCookies(request.headers.get('cookie') ?? '');
  if (session) {
    return redirect('/dashboard');
  }

  return redirect('/login');
};
