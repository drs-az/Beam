// Simple RatchetSession implementation using WebCrypto
// Generates an ephemeral ECDH key pair and derives new symmetric keys per message

const _enc = new TextEncoder();
const _dec = new TextDecoder();

function _bufToB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function _b64ToBuf(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

async function _hkdf(keyMaterial, info) {
  const salt = new Uint8Array(32); // all zeros
  const key = await crypto.subtle.importKey('raw', keyMaterial, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({
    name: 'HKDF',
    hash: 'SHA-256',
    salt,
    info: _enc.encode(info)
  }, key, 256);
  return new Uint8Array(bits);
}

class RatchetSession {
  constructor() {
    this.keyPair = null;
    this.publicKey = null;
    this.sendChainKey = null;
    this.recvChainKey = null;
  }

  // Create a new session with fresh ECDH key pair
  static async create() {
    const s = new RatchetSession();
    s.keyPair = await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveBits']
    );
    s.publicKey = await s.exportPublicKey();
    return s;
  }

  // Export public key as base64 string
  async exportPublicKey() {
    const raw = await crypto.subtle.exportKey('raw', this.keyPair.publicKey);
    return _bufToB64(raw);
  }

  // Import peer public key from base64
  async importPeerPublicKey(b64) {
    const raw = _b64ToBuf(b64);
    return crypto.subtle.importKey(
      'raw',
      raw,
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      []
    );
  }

  // After exchanging public keys, derive shared secret and set chain keys.
  // Initiator and responder swap send/receive derivations.
  async init(peerPublicB64, initiator = true) {
    const peerKey = await this.importPeerPublicKey(peerPublicB64);
    const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: peerKey }, this.keyPair.privateKey, 256);
    const rootKey = new Uint8Array(shared);
    if (initiator) {
      this.sendChainKey = await _hkdf(rootKey, 'init_send');
      this.recvChainKey = await _hkdf(rootKey, 'init_recv');
    } else {
      this.sendChainKey = await _hkdf(rootKey, 'init_recv');
      this.recvChainKey = await _hkdf(rootKey, 'init_send');
    }
  }

  async _nextSendKey() {
    const mk = await _hkdf(this.sendChainKey, 'msg');
    this.sendChainKey = await _hkdf(this.sendChainKey, 'chain');
    return mk;
  }

  async _nextRecvKey() {
    const mk = await _hkdf(this.recvChainKey, 'msg');
    this.recvChainKey = await _hkdf(this.recvChainKey, 'chain');
    return mk;
  }

  // Encrypt a UTF-8 string, returning base64 iv and ciphertext
  async encrypt(plaintext) {
    const keyBytes = await this._nextSendKey();
    const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv }, key, _enc.encode(plaintext));
    return { iv: _bufToB64(iv), data: _bufToB64(cipher) };
  }

  // Decrypt using current receiving chain key
  async decrypt(bundle) {
    const keyBytes = await this._nextRecvKey();
    const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const iv = _b64ToBuf(bundle.iv);
    const data = _b64ToBuf(bundle.data);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv }, key, data);
    return _dec.decode(plain);
  }
}

// Expose globally
window.RatchetSession = RatchetSession;

