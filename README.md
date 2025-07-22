# 🔐 HexaShift (PWA)

**HexaShift** is a lightweight, offline encryption tool built for **privacy, simplicity, and control**. Designed as a standalone Progressive Web App (PWA), it enables peer-to-peer message and file encryption using high-entropy passphrases — with **no servers**, **no accounts**, and **no data collection**. Once loaded, HexaShift works entirely offline.

## 🛡️ Privacy-First Philosophy

Unlike legal-grade or enterprise tools that prioritize auditability and compliance, HexaShift embraces:

- **Anonymity over accountability**
- **Simplicity over bureaucracy**
- **Self-custody over cloud control**

No logs. No identities. No dependencies.  
**You** — and only you — control access to your encrypted messages and files.

## ✨ Features

- **AES-256-GCM** encryption via the WebCrypto API
- **PBKDF2** key derivation (150k iterations, SHA-256)
- Optional **Argon2** key derivation for stronger but slower hashing
- Optional **HMAC** authentication to detect tampering
- Custom passphrase input with a strength meter powered by **zxcvbn**
- Encrypt and decrypt text, images, and encrypted text files
- **Image Encryption** with MIME type preservation and auto-download of decrypted files
  _Images larger than 100kb are automatically chunked for encryption._
- Generate and download a **QR code** of the encrypted message or file (when output is within length limits)
- Upload and decode QR codes for decryption
- Share encrypted messages via URL (with auto-decrypt preload)
- **Reset** button to clear fields and state
- Copy-to-clipboard functionality
- Mobile-first responsive layout
- Fully offline, installable PWA experience on Android and desktop
- Light/Dark theme toggle and passphrase generator

## 🔐 Passphrase Guidelines

You may use either:
- Numeric sequences with commas (e.g. `4,2,5,8,3,3`)
- Full alphanumeric passphrases (e.g. `correct horse battery staple`)

You can also click **Generate Passphrase** in the app to create a random four-word phrase.

> 💡 Commas are only required for numeric sequences.

## 🚀 How to Use

1. Open `index.html` in a browser (mobile or desktop).
2. Select one of the actions from the dropdown:
   - **Encrypt Text**
   - **Decrypt Text**
   - **Decrypt Text File**
   - **Encrypt Image**
   - **Decrypt QR**
3. For encryption, enter your message or upload an image. Large images are automatically split into 100kb chunks. For decryption, paste the encrypted string, upload an encrypted text file, or scan/upload a QR code image.
4. Enter your passphrase.
5. Click the corresponding action button:
   - **Run** for text encryption/decryption
   - **Encrypt Image** for image encryption
   - **Decode QR** for QR code decryption
6. Review the result: copy the output, download the QR code, or share via the generated link.
7. Use the **Reset** button to clear the form and start over.

## 🖼️ File and Image Encryption

- **Text File Decryption:** In addition to direct text input, you can upload an encrypted text file and have it decrypted automatically.
- **Image Encryption:** Upload an image file (PNG, JPG, etc.) to encrypt. The app embeds the file’s MIME type to ensure that when decrypted, the file downloads in its original format.
  - **File Size Handling:** Images larger than 100kb are encrypted in chunks so they can be decrypted and reassembled later.

## 🔗 URL-Based Sharing

When encrypting text or files, you can generate a shareable link. Anyone with this link and the correct passphrase can decrypt the message.

## ⚠️ Security & Connectivity Notes

- All encryption is performed **client-side** — your passphrase is never stored or transmitted.
- **Offline Functionality:** All dependencies (zxcvbn, qrcode, jsQR, argon2) are bundled in the `libs/` folder. A service worker caches app files after the first visit, so HexaShift works offline.
- Choose a strong, unique passphrase to maximize security.
- The app **does not support forward secrecy** or digital signatures.
- When enabled, HMAC verifies integrity of the ciphertext before decryption.
- Argon2 hashing may take a few seconds on slower devices.
- Designed for **anonymity and plausible deniability**, not for audit logs or compliance.

## 🧪 Use Cases

- Private, secure one-off communications
- Offline file exchanges (QR-to-QR or encrypted links)
- Scenarios requiring total local control
- Privacy-conscious users avoiding centralized platforms

## 🧪 Running Tests

HexaShift includes a small Jest test suite. Install dependencies with `npm install` and run tests using:

```bash
npm test
```

---

Made with ❤️ in 🌵 for the privacy-minded.  
**Own your encryption. Share nothing else.**
