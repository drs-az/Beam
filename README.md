# 🔐 HexaShift (PWA)

**HexaShift** is a lightweight, offline encryption tool built for **privacy, simplicity, and control**. Designed as a standalone PWA, it enables peer-to-peer message and file encryption using high-entropy passphrases — with **no servers**, **no accounts**, and **no data collection**.

## 🛡️ Privacy-First Philosophy

Unlike legal-grade or enterprise tools that prioritize auditability and compliance, HexaShift embraces:

- **Anonymity over accountability**
- **Simplicity over bureaucracy**
- **Self-custody over cloud control**

No logs. No identities. No dependencies.  
**You** — and only you — control access to your encrypted messages and files.

## ✨ Features

- AES-256-GCM encryption via WebCrypto API
- PBKDF2 key derivation (150k iterations, SHA-256)
- Custom passphrase input (numeric with commas or full alphanumeric)
- Passphrase strength meter via zxcvbn
- Encrypt and decrypt text **or images**
- Automatically detect and **download decrypted image files**
- Generate and download a QR code of the encrypted message or file
- Upload and decode QR codes for decryption
- Share encrypted messages via URL (with auto-decrypt preload)
- Reset button to clear fields and reset state
- Copy-to-clipboard support
- Mobile-first responsive layout
- Fully offline PWA — installable on Android and desktop

## 🔐 Passphrase Guidelines

You may use either:
- Numeric sequences with commas (e.g. `4,2,5,8,3,3`)
- Full alphanumeric passphrases (e.g. `correct horse battery staple`)

> 💡 Commas are only required for numeric sequences.

## 🚀 How to Use

1. Open `index.html` in a browser (mobile or desktop)
2. Select **Encrypt** or **Decrypt**
3. Enter your message or upload an image
4. Enter your passphrase
5. Click **Run** (or **Encrypt Image** if using a file)
6. Copy the result, download the QR code, or share via link
7. To decrypt, paste the encrypted string or scan/upload a QR image, and enter the correct passphrase

## 🖼️ File Encryption

- Upload an image (PNG, JPG, etc.)
- HexaShift encrypts the file and includes its MIME type
- When decrypted, the file automatically downloads in its original format
- Perfect for secure offline image sharing

## 🔗 URL-Based Sharing

When encrypting text or files, you can generate a shareable link. Anyone with this link and the correct passphrase can decrypt the message.

## ⚠️ Security Notes

- All encryption is performed **client-side** — no internet required
- **Your passphrase is never stored or transmitted**
- Choose a strong, unique passphrase to maximize security
- This app **does not support forward secrecy** or digital signatures
- Designed for **anonymity and plausible deniability**, not compliance or audit logs

## 🧪 Use Cases

- Private, secure one-off communications
- Offline file exchanges (QR-to-QR or encrypted links)
- Situations requiring total local control
- Privacy-conscious users avoiding centralized platforms

---

Made with ❤️ in 🌵 for the privacy-minded.  
**Own your encryption. Share nothing else.**