const crypto = require('crypto').webcrypto;

test('encrypt and decrypt text with AES-GCM', async () => {
  const enc = new TextEncoder();
  const passphrase = 'test-passphrase';
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const material = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const data = enc.encode('hello world');
  const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, data);
  const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
  expect(new TextDecoder().decode(pt)).toBe('hello world');
});
