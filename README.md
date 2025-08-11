# Beam

**Beam** is a lightweight, offline encryption tool built for **privacy, simplicity, and control**. Designed as a standalone Progressive Web App (PWA), it enables peer-to-peer message and file encryption with per-session forward secrecy — with **no servers**, **no accounts**, and **no data collection**. Once loaded, Beam works entirely offline.

## 🛡️ Privacy-First Philosophy

Unlike legal-grade or enterprise tools that prioritize auditability and compliance, Beam embraces:

- **Anonymity over accountability**
- **Simplicity over bureaucracy**
- **Self-custody over cloud control**

No logs. No identities. No dependencies.  
**You** — and only you — control access to your encrypted messages and files.

## ✨ Features

- **AES-256-GCM** encryption via the WebCrypto API
- Ephemeral ECDH session with per-message HKDF ratchet providing forward secrecy
- Encrypt and decrypt text, images, and encrypted text files
- **Image Encryption** with MIME type preservation and auto-download of decrypted files
  _Note: Only images up to 100kb are supported. Larger images will trigger an error message._
- Generate and download a **QR code** of the encrypted message or file (when output is within length limits)
- Upload and decode QR codes for decryption
- Handles large inputs with chunked base64 conversion
- Share encrypted messages via URL hash fragments (with auto-decrypt preload and reduced referer leakage)
- Sign and verify messages with ECDSA digital signatures
- Generate and export ECDSA key pairs for signing and verification
- `RatchetSession` for ephemeral ECDH exchange with per-message HKDF key ratchet
- Persistent identity key pair stored in local storage with signed prekeys for peer verification (X3DH-style)
- Public key address book to save and reuse sender keys with custom names and images
- **Reset** button to clear fields and state
- Copy-to-clipboard functionality
- Mobile-first responsive layout
- Fully offline, installable PWA experience on Android and desktop

## 🚀 How to Use

1. Open `index.html` in a browser (mobile or desktop).
2. *(Optional)* Click **Generate Key Pair** to create an ECDSA key pair for signing, then use **Export Public Key** to share it with peers.
3. Exchange session keys with your partner and click **Initialize Session** to start a ratchet.
4. For signature verification, paste the sender's public key or choose a saved contact. Use **Save Contact** to store keys with names and avatars for future sessions.
5. Select one of the actions from the dropdown:
   - **Encrypt Text**
   - **Decrypt Text**
   - **Decrypt Text File**
   - **Encrypt Image**
   - **Decrypt QR**
6. Provide the message or upload a file/QR image and click the matching button:
   - **Run** for text encryption/decryption
   - **Encrypt Image** for image encryption
   - **Decode QR** for QR code decryption
7. Review the result: copy it, download the QR code, or use **📤 Share Encrypted Link**. Large outputs automatically download as a text file.
8. Use **Reset** to clear the form. **Copy Result** copies the output to your clipboard.

## 🖼️ File and Image Encryption

- **Text File Decryption:** In addition to direct text input, you can upload an encrypted text file and have it decrypted automatically.
- **Image Encryption:** Upload an image file (PNG, JPG, etc.) to encrypt. The app embeds the file’s MIME type to ensure that when decrypted, the file downloads in its original format.
  - **File Size Limit:** Images must be **100kb or smaller**. If an image exceeds this size, an error message will be displayed in the result field.

## 🔗 URL-Based Sharing

When encrypting text or files, you can generate a shareable link that stores data
in the URL hash fragment. Anyone with this link and the session state can decrypt the message, and using the hash helps prevent leakage via HTTP Referer headers.

## 🔄 Ephemeral Sessions

Beam uses `ratchet.js` as its default `RatchetSession` implementation. Two parties exchange an ephemeral ECDH key pair and derive a fresh symmetric key for every message via HKDF, providing lightweight forward secrecy without repeating the key exchange.

## ⚠️ Security & Connectivity Notes

- All encryption is performed **client-side** — session secrets are never stored or transmitted.
- **Offline Functionality:** All required libraries (`qrcode.min.js`, `jsQR.js`, `ratchet.js`) are bundled locally, so Beam runs fully offline once the page is loaded.
- Designed for forward secrecy by default using an ephemeral ratchet session.
- Designed for **anonymity and plausible deniability**, not for audit logs or compliance.

## 🧪 Use Cases

- Private, secure one-off communications
- Offline file exchanges (QR-to-QR or encrypted links)
- Scenarios requiring total local control
- Privacy-conscious users avoiding centralized platforms

---

Made with ❤️ in 🌵 for the privacy-minded.  
**Own your encryption. Share nothing else.**
