import fs from 'node:fs';
import path from 'node:path';

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

export function getStaffAccounts(): StaffAccount[] {
  try {
    const file = fs.readFileSync(accountsPath, 'utf8');
    const parsed = JSON.parse(file) as StaffAccount[];
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
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
  const encoded = Buffer.from(JSON.stringify(createSession(user))).toString('base64');
  return `contractor_session=${encoded}; Path=/; Max-Age=86400; HttpOnly; SameSite=Lax`;
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

  const rawValue = cookie.split('=')[1];
  if (!rawValue) {
    return null;
  }

  try {
    const decoded = Buffer.from(rawValue, 'base64').toString('utf8');
    const session = JSON.parse(decoded) as SessionUser & { expiresAt?: number };
    if (!session || typeof session.username !== 'string') {
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
  const nextAccount: StaffAccount = {
    id: account.id ?? `staff-${Date.now()}`,
    name: account.name,
    username: account.username.trim(),
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

  accounts[index] = {
    ...accounts[index],
    ...updates,
    username: updates.username?.trim() ?? accounts[index].username,
    password: updates.password ?? accounts[index].password,
    role: updates.role ?? accounts[index].role,
  };

  saveStaffAccounts(accounts);
  return accounts[index];
}

export function deleteStaffAccount(id: string) {
  const accounts = getStaffAccounts().filter((entry) => entry.id !== id);
  saveStaffAccounts(accounts);
  return accounts;
}

export function isProtectedPath(pathname: string) {
  return pathname.startsWith('/dashboard') || pathname.startsWith('/admin');
}

export function isAllowedForPath(pathname: string, role?: UserRole | null) {
  if (!isProtectedPath(pathname)) {
    return true;
  }

  if (pathname === '/dashboard/owners') {
    return role === 'owner';
  }

  return role === 'owner' || role === 'employee';
}
