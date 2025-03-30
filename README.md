# 🔐 HexaShift (PWA)

HexaShift is a secure, offline-capable encryption utility built as a single-page Progressive Web App (PWA). It enables private, client-side encryption and decryption of messages using a custom passphrase.

## ✨ Features

- AES-256-GCM encryption via WebCrypto API
- PBKDF2 key derivation (150k iterations, SHA-256)
- Custom passphrase input (numeric with commas or full alphanumeric)
- Passphrase strength meter using zxcvbn
- Copy-to-clipboard support
- Generate and download a QR code of the encrypted message
- Upload and decode QR codes for decryption
- Share encrypted messages via mobile-friendly URL with auto-decrypt preload
- Mobile-first UI
- Installable as a secure offline web app (PWA)
- No dark mode (simplified layout)

## 🔐 Passphrase Input

You may use either:
- Numeric sequences separated by commas (e.g. `3,1,4,1,5,9`)
- Full alphanumeric passphrases (e.g. `correct horse battery staple`)

> 📌 Commas are only required for numeric input. Alphanumeric phrases should be entered as plain text.

## 🚀 How to Use

1. Open the app (`index.html`) in a browser
2. Choose to **Encrypt** or **Decrypt**
3. Enter your message and passphrase
4. Click **Run**
5. Copy the output, scan the QR code, or click **Share** to generate a link
6. To decrypt via QR code: upload the image and enter your passphrase

## 🔗 URL Sharing

When encrypted, you can generate a shareable URL like: