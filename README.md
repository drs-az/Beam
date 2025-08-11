# Beam

**Beam** is a lightweight, offline encryption tool built for **privacy, simplicity, and control**. Designed as a standalone Progressive Web App (PWA), it enables peer-to-peer message and file encryption using high-entropy passphrases — with **no servers**, **no accounts**, and **no data collection**. Once loaded, HexaShift works entirely offline.

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
- Custom passphrase input with a strength meter powered by **zxcvbn** (score ≥3 enforced)
- Encrypt and decrypt text, images, and encrypted text files
- **Image Encryption** with MIME type preservation and auto-download of decrypted files
  _Note: Only images up to 100kb are supported. Larger images will trigger an error message._
- Generate and download a **QR code** of the encrypted message or file (when output is within length limits)
- Upload and decode QR codes for decryption
- Handles large inputs with chunked base64 conversion
- Share encrypted messages via URL hash fragments (with auto-decrypt preload and reduced referer leakage)
- Sign and verify messages with ECDSA digital signatures
- **Reset** button to clear fields and state
- Copy-to-clipboard functionality
- Mobile-first responsive layout
- Fully offline, installable PWA experience on Android and desktop

## 🔐 Passphrase Guidelines

You may use either:
- Numeric sequences with commas (e.g. `4,2,5,8,3,3`)
- Full alphanumeric passphrases (e.g. `correct horse battery staple`)

> 💡 Commas are only required for numeric sequences. The app enforces a minimum
> zxcvbn strength score of **3** before enabling any actions.

## 🚀 How to Use

1. Open `index.html` in a browser (mobile or desktop).
2. Select one of the actions from the dropdown:
   - **Encrypt Text**
   - **Decrypt Text**
   - **Decrypt Text File**
   - **Encrypt Image**
   - **Decrypt QR**
3. For encryption, enter your message or upload an image (ensure the image is **100kb or smaller**); for decryption, paste the encrypted string, upload an encrypted text file, or scan/upload a QR code image.
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
  - **File Size Limit:** Images must be **100kb or smaller**. If an image exceeds this size, an error message will be displayed in the result field.

## 🔗 URL-Based Sharing

When encrypting text or files, you can generate a shareable link that stores data
in the URL hash fragment. Anyone with this link and the correct passphrase can decrypt the message, and using the hash helps prevent leakage via HTTP Referer headers.

## ⚠️ Security & Connectivity Notes

- All encryption is performed **client-side** — your passphrase is never stored or transmitted.
- **Offline Functionality:** Although the encryption operations run entirely offline once the app is loaded, an internet connection is required for the initial loading of external JavaScript libraries. A future release will host these libraries locally, eliminating this dependency.
- Choose a strong, unique passphrase to maximize security.
- The app provides optional digital signatures for authenticity but **does not support forward secrecy**.
- Designed for **anonymity and plausible deniability**, not for audit logs or compliance.

## 🧪 Use Cases

- Private, secure one-off communications
- Offline file exchanges (QR-to-QR or encrypted links)
- Scenarios requiring total local control
- Privacy-conscious users avoiding centralized platforms

---

Made with ❤️ in 🌵 for the privacy-minded.  
**Own your encryption. Share nothing else.**
