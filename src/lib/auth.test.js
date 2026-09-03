import test from 'node:test';
import assert from 'node:assert/strict';

import { sanitizeNextPath, isAllowedForPath, isProtectedPath } from './auth.ts';

test('sanitizeNextPath preserves safe internal paths', () => {
  assert.equal(sanitizeNextPath('/dashboard/content?updated=1', '/dashboard'), '/dashboard/content?updated=1');
  assert.equal(sanitizeNextPath('/login', '/dashboard'), '/login');
});

test('sanitizeNextPath rejects unsafe paths', () => {
  assert.equal(sanitizeNextPath('//evil.com', '/dashboard'), '/dashboard');
  assert.equal(sanitizeNextPath('https://example.com/steal', '/dashboard'), '/dashboard');
});

test('protected routes enforce owner-only access for content and owners pages', () => {
  assert.equal(isProtectedPath('/dashboard/content'), true);
  assert.equal(isProtectedPath('/dashboard'), true);
  assert.equal(isAllowedForPath('/dashboard/content', 'employee'), false);
  assert.equal(isAllowedForPath('/dashboard/content', 'owner'), true);
});
