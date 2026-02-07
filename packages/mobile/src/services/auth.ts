import { createCookieSessionStorage, redirect } from 'react-router';

const sessionSecret = process.env.SESSION_SECRET || 'dev-secret-change-in-production';

export const mobileSessionStorage = createCookieSessionStorage({
  cookie: {
    name: '__mobile_session',
    httpOnly: true,
    maxAge: 60 * 60 * 24 * 30,
    path: '/',
    sameSite: 'lax',
    secrets: [sessionSecret],
    secure: process.env.NODE_ENV === 'production',
  },
});

export async function createMobileSession(userId: string, redirectTo: string) {
  const session = await mobileSessionStorage.getSession();
  session.set('userId', userId);
  session.set('createdAt', Date.now());
  
  return redirect(redirectTo, {
    headers: {
      'Set-Cookie': await mobileSessionStorage.commitSession(session),
    },
  });
}

export async function getMobileSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  const session = await mobileSessionStorage.getSession(cookie);
  const userId = session.get('userId');
  
  if (!userId) {
    return null;
  }
  
  return { userId };
}

export async function destroyMobileSession(request: Request) {
  const cookie = request.headers.get('Cookie');
  const session = await mobileSessionStorage.getSession(cookie);
  
  return redirect('/mobile/login', {
    headers: {
      'Set-Cookie': await mobileSessionStorage.destroySession(session),
    },
  });
}
