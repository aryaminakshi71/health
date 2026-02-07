import { createCookieSessionStorage, redirect } from 'react-router';
import { v4 as uuid } from 'uuid';

const SESSION_SECRET = process.env.SESSION_SECRET || 'development-secret-change-in-production';
const SESSION_MAX_AGE = 60 * 60 * 24 * 7;

export const sessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__session',
    httpOnly: true,
    maxAge: SESSION_MAX_AGE,
    path: '/',
    sameSite: 'lax',
    secrets: [SESSION_SECRET],
    secure: process.env.NODE_ENV === 'production',
  },
});

export async function getSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  return sessionStorage.getSession(cookie);
}

export async function createUserSession(userId: string, redirectTo: string) {
  const session = await sessionStorage.getSession();
  const token = uuid();
  
  session.set('userId', userId);
  session.set('token', token);
  session.set('createdAt', Date.now());

  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  });
}

export async function getUserFromSession(request: Request): Promise<{ userId: string; token: string } | null> {
  const session = await getSession(request);
  const userId = session.get('userId');
  const token = session.get('token');

  if (!userId || !token) {
    return null;
  }

  const createdAt = session.get('createdAt');
  const age = Date.now() - createdAt;

  if (age > SESSION_MAX_AGE * 1000) {
    return null;
  }

  return { userId, token };
}

export async function updateSessionExpiry(request: Request) {
  const session = await getSession(request);
  
  if (session.has('userId')) {
    session.set('createdAt', Date.now());
  }

  return {
    headers: {
      'Set-Cookie': await sessionStorage.commitSession(session),
    },
  };
}

export async function destroySession(request: Request) {
  const session = await getSession(request);

  return redirect('/login', {
    headers: {
      'Set-Cookie': await sessionStorage.destroySession(session),
    },
  });
}

export async function requireUserSession(request: Request, redirectTo = '/login') {
  const sessionUser = await getUserFromSession(request);

  if (!sessionUser) {
    const searchParams = new URLSearchParams([['redirectTo', new URL(request.url).pathname]]);
    throw redirect(`${redirectTo}?${searchParams}`);
  }

  return sessionUser;
}
