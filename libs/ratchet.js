// Double Ratchet implementation using WebCrypto
// Adds per-message DH ratchets, header authentication and skipped-key queue

const _enc = new TextEncoder();
const _dec = new TextDecoder();

function _bufToB64(buf) {
  return btoa(String.fromCharCode(...new Uint8Array(buf)));
}

function _b64ToBuf(b64) {
  return Uint8Array.from(atob(b64), c => c.charCodeAt(0));
}

async function _hkdf(keyMaterial, info, salt) {
  salt = salt || crypto.getRandomValues(new Uint8Array(32));
  const key = await crypto.subtle.importKey('raw', keyMaterial, 'HKDF', false, ['deriveBits']);
  const bits = await crypto.subtle.deriveBits({
    name: 'HKDF',
    hash: 'SHA-256',
    salt,
    info: _enc.encode(info)
  }, key, 256);
  return { key: new Uint8Array(bits), salt };
}

async function _hmacSign(keyBytes, data) {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['sign']);
  return new Uint8Array(await crypto.subtle.sign('HMAC', key, data));
}

async function _hmacVerify(keyBytes, data, sig) {
  const key = await crypto.subtle.importKey('raw', keyBytes, { name: 'HMAC', hash: 'SHA-256' }, false, ['verify']);
  return crypto.subtle.verify('HMAC', key, sig, data);
}

class RatchetSession {
  constructor() {
    this.identityKeyPair = null; // persistent signing key
    this.DHs = null; // our current ECDH ratchet key pair
    this.DHr = null; // their current ECDH public key
    this.publicKey = null; // cached base64 of DHs public key
    this.signedPrekey = null; // { key: b64, sig: b64 }

    // Root and chain keys
    this.rootKey = null;
    this.CKs = null; // sending chain key
    this.CKr = null; // receiving chain key
    this.HKs = null; // header key for sending
    this.HKr = null; // header key for receiving

    // Message numbers
    this.Ns = 0; // messages sent in current sending chain
    this.Nr = 0; // messages received in current receiving chain
    this.PN = 0; // messages sent in previous sending chain

    // Skipped message keys
    this.skipKeys = new Map(); // key: dh|n -> {encKey, authKey}
  }

  // Load or generate identity key and create a fresh ECDH key pair
  static async create() {
    const s = new RatchetSession();
    await s._ensureIdentity();
    s.DHs = await crypto.subtle.generateKey(
      { name: 'ECDH', namedCurve: 'P-256' },
      true,
      ['deriveBits']
    );
    const raw = await crypto.subtle.exportKey('raw', s.DHs.publicKey);
    s.publicKey = _bufToB64(raw);
    await s._signPrekey(raw);
    return s;
  }

  async exportPublicKey() {
    const raw = await crypto.subtle.exportKey('raw', this.DHs.publicKey);
    return _bufToB64(raw);
  }

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

  async _signPrekey(rawPub) {
    const sig = await crypto.subtle.sign(
      { name: 'ECDSA', hash: 'SHA-256' },
      this.identityKeyPair.privateKey,
      rawPub
    );
    this.signedPrekey = { key: this.publicKey, sig: _bufToB64(sig) };
  }

  async exportIdentityKey() {
    const raw = await crypto.subtle.exportKey('raw', this.identityKeyPair.publicKey);
    return _bufToB64(raw);
  }

  async exportSignedPrekey() {
    if (!this.signedPrekey) {
      const raw = await crypto.subtle.exportKey('raw', this.DHs.publicKey);
      await this._signPrekey(raw);
    }
    return this.signedPrekey;
  }

  static async importIdentityKey(b64) {
    const raw = _b64ToBuf(b64);
    return crypto.subtle.importKey('raw', raw, { name: 'ECDSA', namedCurve: 'P-256' }, true, ['verify']);
  }

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

  // Initialize session after exchanging public keys
  async init(peerPublicKey, initiator = true) {
    this.DHr = typeof peerPublicKey === 'string'
      ? await this.importPeerPublicKey(peerPublicKey)
      : peerPublicKey;
    const shared = await crypto.subtle.deriveBits({ name: 'ECDH', public: this.DHr }, this.DHs.privateKey, 256);
    this.rootKey = new Uint8Array(shared);
    if (initiator) {
      this.CKs = await _hkdf(this.rootKey, 'init_CKs');
      this.HKs = (await _hkdf(this.rootKey, 'init_HKs')).key;
      this.CKr = await _hkdf(this.rootKey, 'init_CKr');
      this.HKr = (await _hkdf(this.rootKey, 'init_HKr')).key;
    } else {
      this.CKs = await _hkdf(this.rootKey, 'init_CKr');
      this.HKs = (await _hkdf(this.rootKey, 'init_HKr')).key;
      this.CKr = await _hkdf(this.rootKey, 'init_CKs');
      this.HKr = (await _hkdf(this.rootKey, 'init_HKs')).key;
    }
  }

  _mkId(dhB64, n) {
    return `${dhB64}|${n}`;
  }

  async _nextSendMessageKey() {
    const mk = await _hkdf(this.CKs.key, `msg_${this.Ns}`, this.CKs.salt);
    this.CKs = await _hkdf(this.CKs.key, `chain_${this.Ns}`);
    return {
      encKey: (await _hkdf(mk.key, `enc_${this.Ns}`, mk.salt)).key,
      authKey: (await _hkdf(mk.key, `auth_${this.Ns}`, mk.salt)).key
    };
  }

  async _nextRecvMessageKey() {
    const mk = await _hkdf(this.CKr.key, `msg_${this.Nr}`, this.CKr.salt);
    this.CKr = await _hkdf(this.CKr.key, `chain_${this.Nr}`);
    return {
      encKey: (await _hkdf(mk.key, `enc_${this.Nr}`, mk.salt)).key,
      authKey: (await _hkdf(mk.key, `auth_${this.Nr}`, mk.salt)).key
    };
  }

  async _skipMessageKeys(until) {
    while (this.Nr < until) {
      const mk = await this._nextRecvMessageKey();
      const dhB64 = await this.exportPeerKey(this.DHr);
      const id = this._mkId(dhB64, this.Nr);
      this.skipKeys.set(id, mk);
      this.Nr++;
    }
  }

  async exportPeerKey(key) {
    const raw = await crypto.subtle.exportKey('raw', key);
    return _bufToB64(raw);
  }

  async _dhRatchet(newKey) {
    this.PN = this.Ns;
    this.Ns = 0;
    // derive receiving chain
    let dh = await crypto.subtle.deriveBits({ name: 'ECDH', public: newKey }, this.DHs.privateKey, 256);
    let material = new Uint8Array([...this.rootKey, ...new Uint8Array(dh)]);
    this.rootKey = (await _hkdf(material, 'root')).key;
    this.CKr = await _hkdf(this.rootKey, 'recv_ck');
    this.HKr = (await _hkdf(this.rootKey, 'recv_header')).key;
    this.Nr = 0;
    this.DHr = newKey;
    // set up sending chain with new DHs
    this.DHs = await crypto.subtle.generateKey({ name: 'ECDH', namedCurve: 'P-256' }, true, ['deriveBits']);
    const raw = await crypto.subtle.exportKey('raw', this.DHs.publicKey);
    this.publicKey = _bufToB64(raw);
    dh = await crypto.subtle.deriveBits({ name: 'ECDH', public: this.DHr }, this.DHs.privateKey, 256);
    material = new Uint8Array([...this.rootKey, ...new Uint8Array(dh)]);
    this.rootKey = (await _hkdf(material, 'root')).key;
    this.CKs = await _hkdf(this.rootKey, 'send_ck');
    this.HKs = (await _hkdf(this.rootKey, 'send_header')).key;
  }

  async encrypt(plaintext) {
    const dhB64 = await this.exportPublicKey();
    const header = { dh: dhB64, pn: this.PN, n: this.Ns };
    const headerBytes = _enc.encode(JSON.stringify(header));
    const mk = await this._nextSendMessageKey();
    const key = await crypto.subtle.importKey('raw', mk.encKey, { name: 'AES-GCM', length: 256 }, false, ['encrypt']);
    const iv = crypto.getRandomValues(new Uint8Array(12));
    const cipher = await crypto.subtle.encrypt({ name: 'AES-GCM', iv, additionalData: mk.authKey }, key, _enc.encode(plaintext));
    const tag = await _hmacSign(this.HKs, headerBytes);
    this.Ns++;
    return { header, tag: _bufToB64(tag), iv: _bufToB64(iv), data: _bufToB64(cipher) };
  }

  async decrypt(bundle) {
    const headerBytes = _enc.encode(JSON.stringify(bundle.header));
    const dhB64 = bundle.header.dh;
    if (!this.DHr || dhB64 !== await this.exportPeerKey(this.DHr)) {
      const key = await this.importPeerPublicKey(dhB64);
      await this._dhRatchet(key);
    }
    const ok = await _hmacVerify(this.HKr, headerBytes, _b64ToBuf(bundle.tag));
    if (!ok) throw new Error('Bad header MAC');
    await this._skipMessageKeys(bundle.header.n);
    const id = this._mkId(dhB64, bundle.header.n);
    let mk;
    if (this.skipKeys.has(id)) {
      mk = this.skipKeys.get(id);
      this.skipKeys.delete(id);
    } else {
      mk = await this._nextRecvMessageKey();
      this.Nr++;
    }
    const key = await crypto.subtle.importKey('raw', mk.encKey, { name: 'AES-GCM', length: 256 }, false, ['decrypt']);
    const iv = _b64ToBuf(bundle.iv);
    const data = _b64ToBuf(bundle.data);
    const plain = await crypto.subtle.decrypt({ name: 'AES-GCM', iv, additionalData: mk.authKey }, key, data);
    return _dec.decode(plain);
  }
}

// Expose globally
window.RatchetSession = RatchetSession;
