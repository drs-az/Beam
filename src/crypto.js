import { webcrypto } from 'crypto';

const { subtle } = webcrypto;
const enc = new TextEncoder();
const dec = new TextDecoder();

export async function encryptText(message, passphrase) {
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ciphertext = await subtle.encrypt({ name: 'AES-GCM', iv }, key, enc.encode(message));
  const combined = new Uint8Array([...salt, ...iv, ...new Uint8Array(ciphertext)]);
  return Buffer.from(combined).toString('base64');
}

export async function decryptText(base64, passphrase) {
  const data = Buffer.from(base64, 'base64');
  const salt = data.subarray(0, 16);
  const iv = data.subarray(16, 28);
  const ciphertext = data.subarray(28);
  const keyMaterial = await subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const decrypted = await subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  return dec.decode(decrypted);
}

export async function encryptImage(buffer, mimeType, passphrase) {
  const prefix = enc.encode(`${mimeType}|`);
  const full = new Uint8Array(prefix.length + buffer.length);
  full.set(prefix);
  full.set(buffer, prefix.length);
  const salt = webcrypto.getRandomValues(new Uint8Array(16));
  const iv = webcrypto.getRandomValues(new Uint8Array(12));
  const keyMaterial = await subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
  const ciphertext = await subtle.encrypt({ name: 'AES-GCM', iv }, key, full);
  const combined = new Uint8Array([...salt, ...iv, ...new Uint8Array(ciphertext)]);
  return Buffer.from(combined).toString('base64');
}

export async function decryptImage(base64, passphrase) {
  const data = Buffer.from(base64, 'base64');
  const salt = data.subarray(0, 16);
  const iv = data.subarray(16, 28);
  const ciphertext = data.subarray(28);
  const keyMaterial = await subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, keyMaterial, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
  const decrypted = await subtle.decrypt({ name: 'AES-GCM', iv }, key, ciphertext);
  const sep = new Uint8Array(decrypted).indexOf(124);
  const mime = dec.decode(new Uint8Array(decrypted).subarray(0, sep));
  const buf = Buffer.from(new Uint8Array(decrypted).subarray(sep + 1));
  return { mimeType: mime, buffer: buf };
}

export function qrEncode(data) {
  return `QR:${Buffer.from(data).toString('base64')}`;
}

export function qrDecode(qr) {
  if (!qr.startsWith('QR:')) throw new Error('Invalid QR format');
  const base = qr.slice(3);
  return Buffer.from(base, 'base64').toString();
}
