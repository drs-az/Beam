# 🔐 SSET (PWA)

SSET is a secure, offline-capable encryption tool built as a single-page Progressive Web App (PWA). It enables simple, private message encryption and decryption using a custom passphrase.

## ✨ Features

- AES-256-GCM encryption
- PBKDF2 key derivation (150k iterations, SHA-256)
- Custom passphrase input (numeric with commas or full alphanumeric)
- Passphrase strength meter using zxcvbn
- Offline-capable via Service Worker
- Copy-to-clipboard support
- Dark mode toggle
- Optional QR code for key sharing
- Mobile-first design + installable as a web app (PWA)

## 🔐 Passphrase Input

You may use either:
- Numeric sequences separated by commas (e.g. `3,1,4,1,5,9`)
- Full alphanumeric passphrases (e.g. `correct horse battery staple`)

> 📌 Commas are only required for numeric input. Alphanumeric phrases should be entered as plain text.

## 🚀 How to Use

1. Open the app (`index.html`) in a browser
2. Choose to **Encrypt** or **Decrypt**
3. Enter your message
4. Enter your passphrase
5. Click **Run**
6. Copy the result or scan the key QR code (optional)

## 📱 PWA Support

- Fully offline after first load
- Installable on Android and desktop
- Fullscreen experience with local-only processing

## ⚠️ Security Notes

- Encryption is handled completely in-browser
- No data is transmitted or stored
- Use a strong, unique passphrase for best protection
- This tool does not implement forward secrecy
