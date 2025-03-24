# 🔐 SSET (PWA)

This is a secure, offline-capable encryption tool built as a Progressive Web App (PWA). It allows users to encrypt and decrypt messages using a custom 6-number key.

## ✨ Features

- AES-256-GCM encryption with PBKDF2-derived key
- 6-number custom passcode input (e.g., `3,1,4,1,5,9`)
- Offline-capable (via service worker)
- Mobile-friendly layout
- Add-to-home-screen support (install as an app)
- Toggle dark mode
- Copy output to clipboard

## 🚀 How to Use

1. Open the app: 
2. Enter your message and 6-number key
3. Choose to Encrypt or Decrypt
4. Copy the output or install it as a web app

## 📱 PWA Support

- Works offline after first load
- “Add to Home Screen” support on Android and Chrome
- Fullscreen app experience on mobile

## 🔒 Note on Security

This tool uses modern client-side cryptography, but always use caution when sharing sensitive data. No data is ever sent to a server — everything runs 100% in your browser.
