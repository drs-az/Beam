const crypto = require('crypto').webcrypto;

const CHUNK_SIZE = 100 * 1024;

async function encryptChunks(buffer, key) {
  const chunks = [];
  for (let offset = 0; offset < buffer.length; offset += CHUNK_SIZE) {
    const part = buffer.slice(offset, offset + CHUNK_SIZE);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const ct = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, part);
    chunks.push({ iv, ct });
  }
  return chunks;
}

async function decryptChunks(chunks, key) {
  const buffers = [];
  for (const { iv, ct } of chunks) {
    const pt = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, ct);
    buffers.push(new Uint8Array(pt));
  }
  const total = buffers.reduce((sum, b) => sum + b.length, 0);
  const combined = new Uint8Array(total);
  let offset = 0;
  for (const buf of buffers) {
    combined.set(buf, offset);
    offset += buf.length;
  }
  return combined;
}

test('chunked encryption roundtrip', async () => {
  const enc = new TextEncoder();
  const passphrase = 'chunk-pass';
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const material = await crypto.subtle.importKey('raw', enc.encode(passphrase), 'PBKDF2', false, ['deriveKey']);
  const key = await crypto.subtle.deriveKey({ name: 'PBKDF2', salt, iterations: 150000, hash: 'SHA-256' }, material, { name: 'AES-GCM', length: 256 }, false, ['encrypt', 'decrypt']);
  const input = crypto.getRandomValues(new Uint8Array(CHUNK_SIZE + 50));
  const chunks = await encryptChunks(input, key);
  const output = await decryptChunks(chunks, key);
  expect(output).toEqual(input);
});
