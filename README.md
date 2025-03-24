# 🔐 SSET (PWA)

This is a secure, offline-capable, single-file encryption tool built as a Progressive Web App (PWA). It allows users to encrypt and decrypt messages using a custom 6-number key, with enhanced modern cryptography.

## ✨ Features

- AES-256-GCM encryption
- Argon2id key derivation (stronger than PBKDF2)
- 6-number custom passcode input (e.g., `3,1,4,1,5,9`)
- Passphrase strength meter (via zxcvbn)
- Optional QR code for sharing keys securely offline
- Offline-capable via Service Worker
- PWA support: “Add to Home Screen” on Android and desktop
- Dark mode toggle
- Copy output to clipboard

## 🚀 How to Use

1. Open the app: [https://drs-az.github.io/SSET/](https://drs-az.github.io/SSET/)
2. Enter your message and 6-number key
3. Choose to **Encrypt** or **Decrypt**
4. View result, copy it, or scan/share the key via QR code
5. Tap “Add to Home Screen” to install it as an app

## 📱 PWA Support

- Fully offline after first load
- Installable on Android and desktop
- Fullscreen experience with local storage only

## 🔐 Security Notes

- Uses modern cryptographic algorithms (AES-256-GCM, Argon2id)
- No data leaves your browser — all encryption happens client-side
- QR code is local-only and never uploaded or transmitted
- Does not implement forward secrecy (like Signal), but great for secure local/offline use

## 📦 File Structure

Everything is embedded in a single `index.html` file — no dependencies or backend required.
