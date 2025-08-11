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
    this.identityKeyPair = null; // persistent signing key
    this.keyPair = null; // ECDH ratchet key pair
    this.publicKey = null;
    this.signedPrekey = null; // { key: b64, sig: b64 }
    this.sendChainKey = null;
    this.recvChainKey = null;
  }

  // Load or generate identity key and create a fresh ECDH key pair
  static async create() {
    const s = new RatchetSession();
    await s._ensureIdentity();
    s.keyPair = await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveBits']
    );
    const raw = await crypto.subtle.exportKey('raw', s.keyPair.publicKey);
    s.publicKey = _bufToB64(raw);
    await s._signPrekey(raw);
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

  // Load identity key pair from storage or create a new one
  async _ensureIdentity() {
    const stored = localStorage.getItem('identityKeyPair');
    if (stored) {
      const jwk = JSON.parse(stored);
      this.identityKeyPair = {
        privateKey: await crypto.subtle.importKey('jwk', jwk.private, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['sign']),
        publicKey: await crypto.subtle.importKey('jwk', jwk.public, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify'])
      };
    } else {
      this.identityKeyPair = await crypto.subtle.generateKey(
        { name: 'ECDSA', namedCurve: 'P-256' },
        true,
        ['sign', 'verify']
      );
      const priv = await crypto.subtle.exportKey('jwk', this.identityKeyPair.privateKey);
      const pub = await crypto.subtle.exportKey('jwk', this.identityKeyPair.publicKey);
      localStorage.setItem('identityKeyPair', JSON.stringify({ private: priv, public: pub }));
    }
  }

  // Sign the current public key with the identity key
  async _signPrekey(rawPub) {
    const sig = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      this.identityKeyPair.privateKey,
      rawPub
    );
    this.signedPrekey = { key: this.publicKey, sig: _bufToB64(sig) };
  }

  // Export identity public key
  async exportIdentityKey() {
    const raw = await crypto.subtle.exportKey('raw', this.identityKeyPair.publicKey);
    return _bufToB64(raw);
  }

  // Export signed prekey (public key + signature)
  async exportSignedPrekey() {
    if (!this.signedPrekey) {
      const raw = await crypto.subtle.exportKey('raw', this.keyPair.publicKey);
      await this._signPrekey(raw);
    }
    return this.signedPrekey;
  }

  // Import a peer's identity key from base64
  static async importIdentityKey(b64) {
    const raw = _b64ToBuf(b64);
    return crypto.subtle.importKey('raw', raw, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);
  }

  // Verify a signed prekey and return the peer's ECDH key
  static async importSignedPrekey(bundle, identityKey) {
    const keyRaw = _b64ToBuf(bundle.key);
    const sig = _b64ToBuf(bundle.sig);
    const ok = await crypto.subtle.verify(
      { name: 'ECDSA', hash: 'SHA-256' },
      identityKey,
      sig,
      keyRaw
    );
    if (!ok) throw new Error('Invalid signed prekey');
    return crypto.subtle.importKey(
      'raw',
      keyRaw,
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      []
    );
  }

  // After exchanging public keys, derive shared secret and set chain keys.
  // Initiator and responder swap send/receive derivations.
  async init(peerPublicKey, initiator = true) {
    const peerKey = typeof peerPublicKey === 'string'
      ? await this.importPeerPublicKey(peerPublicKey)
      : peerPublicKey;
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

