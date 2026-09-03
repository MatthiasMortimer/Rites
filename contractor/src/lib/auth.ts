import fs from 'node:fs';
import path from 'node:path';
import crypto from 'node:crypto';

export type UserRole = 'owner' | 'employee';

export interface StaffAccount {
  id: string;
  name: string;
  username: string;
  password: string;
  role: UserRole;
}

export interface SessionUser {
  id: string;
  name: string;
  username: string;
  role: UserRole;
}

const accountsPath = path.resolve(process.cwd(), 'src/data/staff-accounts.json');
const sessionSecret = process.env.SESSION_SECRET ?? (process.env.NODE_ENV === 'production'
  ? (() => { throw new Error('SESSION_SECRET must be set in production'); })()
  : 'development-only-session-secret');

export function getStaffAccounts(): StaffAccount[] {
  try {
    const file = fs.readFileSync(accountsPath, 'utf8');
    const parsed = JSON.parse(file) as StaffAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

export function sanitizeNextPath(next: string | null | undefined, fallback = '/dashboard') {
  const candidate = typeof next === 'string' ? next : fallback;
  return candidate.startsWith('/') && !candidate.startsWith('//') ? candidate : fallback;
}

export function getSessionFromRequest(request: Pick<Request, 'headers'> | { headers: { get(name: string): string | null } }) {
  const cookieHeader = request.headers.get('cookie') ?? '';
  return getSessionFromCookies(cookieHeader);
}

export function buildLoginRedirect(pathname: string, origin = 'http://localhost') {
  const target = new URL('/login', origin);
  target.searchParams.set('next', sanitizeNextPath(pathname, '/dashboard'));
  return target.toString();
}

export function saveStaffAccounts(accounts: StaffAccount[]) {
  const directory = path.dirname(accountsPath);
  fs.mkdirSync(directory, { recursive: true });
  fs.writeFileSync(accountsPath, JSON.stringify(accounts, null, 2) + '\n');
}

export function createSession(user: SessionUser) {
  return {
    ...user,
    expiresAt: Date.now() + 1000 * 60 * 60 * 24,
  };
}

export function createSessionCookie(user: SessionUser) {
  const encoded = Buffer.from(JSON.stringify(createSession(user))).toString('base64url');
  const signature = crypto.createHmac('sha256', sessionSecret).update(encoded).digest('base64url');
  const secure = process.env.NODE_ENV === 'production' ? '; Secure' : '';
  return `contractor_session=${encoded}.${signature}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax${secure}`;
}

export function clearSessionCookie() {
  return 'contractor_session=; Path=/; Max-Age=0; HttpOnly; SameSite=Lax';
}

export function getSessionFromCookies(cookieHeader = ''): SessionUser | null {
  const cookie = cookieHeader
    .split(';')
    .map((entry) => entry.trim())
    .find((entry) => entry.startsWith('contractor_session='));

  if (!cookie) {
    return null;
  }

  const rawValue = cookie.slice('contractor_session='.length);
  const [encoded, signature] = rawValue.split('.');
  if (!encoded || !signature) {
    return null;
  }

  const expectedSignature = crypto.createHmac('sha256', sessionSecret).update(encoded).digest('base64url');
  if (signature.length !== expectedSignature.length || !crypto.timingSafeEqual(Buffer.from(signature), Buffer.from(expectedSignature))) {
    return null;
  }

  try {
    const decoded = Buffer.from(encoded, 'base64url').toString('utf8');
    const session = JSON.parse(decoded) as SessionUser & { expiresAt?: number };
    if (!session || typeof session.id !== 'string' || typeof session.name !== 'string' || typeof session.username !== 'string' || (session.role !== 'owner' && session.role !== 'employee')) {
      return null;
    }
    if (session.expiresAt && session.expiresAt < Date.now()) {
      return null;
    }
    return { id: session.id, name: session.name, username: session.username, role: session.role };
  } catch {
    return null;
  }
}

export function verifyCredentials(username: string, password: string) {
  const normalizedUsername = username.trim().toLowerCase();
  const account = getStaffAccounts().find((entry) => entry.username.toLowerCase() === normalizedUsername);

  if (!account) {
    return null;
  }

  if (account.password !== password) {
    return null;
  }

  return account;
}

export function createStaffAccount(account: Omit<StaffAccount, 'id'> & { id?: string }) {
  const accounts = getStaffAccounts();
  const username = account.username.trim();
  if (!username || accounts.some((entry) => entry.username.toLowerCase() === username.toLowerCase())) {
    return null;
  }

  const nextAccount: StaffAccount = {
    id: account.id ?? `staff-${Date.now()}`,
    name: account.name,
    username,
    password: account.password,
    role: account.role,
  };

  accounts.push(nextAccount);
  saveStaffAccounts(accounts);
  return nextAccount;
}

export function updateStaffAccount(id: string, updates: Partial<StaffAccount>) {
  const accounts = getStaffAccounts();
  const index = accounts.findIndex((entry) => entry.id === id);
  if (index === -1) {
    return null;
  }

  const username = updates.username?.trim();
  if (username && accounts.some((entry, entryIndex) => entryIndex !== index && entry.username.toLowerCase() === username.toLowerCase())) {
    return null;
  }

  accounts[index] = {
    ...accounts[index],
    ...updates,
    username: username || accounts[index].username,
    password: updates.password || accounts[index].password,
    role: updates.role ?? accounts[index].role,
  };

  saveStaffAccounts(accounts);
  return accounts[index];
}

export function deleteStaffAccount(id: string) {
  const accounts = getStaffAccounts();
  const account = accounts.find((entry) => entry.id === id);
  if (!account || (account.role === 'owner' && accounts.filter((entry) => entry.role === 'owner').length === 1)) {
    return accounts;
  }

  const remainingAccounts = accounts.filter((entry) => entry.id !== id);
  saveStaffAccounts(remainingAccounts);
  return remainingAccounts;
}

export function isProtectedPath(pathname: string) {
  return pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
}

export function isAllowedForPath(pathname: string, role?: UserRole | null) {
  if (!isProtectedPath(pathname)) {
    return true;
  }

  if (pathname === '/dashboard/content' || pathname === '/dashboard/owners') {
    return role === 'owner';
  }

  return role === 'owner' || role === 'employee';
}
