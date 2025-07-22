import { test } from 'node:test';
import assert from 'node:assert/strict';
import { encryptText, decryptText, encryptImage, decryptImage, qrEncode, qrDecode } from '../src/crypto.js';

const PASS = 's3cr3t';

// Helper buffer for image tests
const IMG_BUF = Buffer.from('sampledata');

test('encrypt and decrypt text', async () => {
  const cipher = await encryptText('hello world', PASS);
  const plain = await decryptText(cipher, PASS);
  assert.equal(plain, 'hello world');
});

test('encrypt and decrypt image', async () => {
  const cipher = await encryptImage(IMG_BUF, 'image/png', PASS);
  const result = await decryptImage(cipher, PASS);
  assert.equal(result.mimeType, 'image/png');
  assert.deepEqual(result.buffer, IMG_BUF);
});

test('QR encode and decode', () => {
  const qr = qrEncode('some text');
  const text = qrDecode(qr);
  assert.equal(text, 'some text');
});
