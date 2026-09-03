import type { APIRoute } from 'astro';
import { clearSessionCookie } from '../../lib/auth';

export const POST: APIRoute = ({ redirect }) => {
  return new Response(null, {
    status: 302,
    headers: {
      Location: '/login',
      'Set-Cookie': clearSessionCookie(),
    },
  });
};
