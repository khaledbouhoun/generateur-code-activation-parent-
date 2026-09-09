# Parent Activation Code Generator (Générateur de Code d'Activation Parent)

A lightweight, modern, and standalone administration web utility built with **pure HTML5, CSS3, and vanilla JavaScript** to generate parent activation codes for a Flutter application and Delphi backend API.

---

## 🔒 Purpose & Core Workflow

This utility produces activation codes using the exact repeating-key XOR encryption algorithm shared between the Flutter mobile application and Delphi backend.

```text
Parent Real ID (e.g. 123456)
        ↓
Local Web Generator
        ↓
XOR encryption using shared secret key
        ↓
Uppercase HEX string (e.g. 687D66666A65)
        ↓
Activation Code sent to parent
        ↓
Parent enters code in Flutter app
        ↓
Flutter encrypts it again & sends to Delphi API
```

---

## ✨ Features

- **100% Client-Side & Private**: Runs entirely in the browser using Web standard APIs. No parent IDs or activation codes are ever sent over a network.
- **Cryptographic Parity**: Uses `new TextEncoder().encode()` to guarantee exact UTF-8 byte matching with Dart's `utf8.encode()`.
- **Quran School Administration Theme**: Sophisticated deep navy background, emerald/teal accents, subtle Islamic geometric watermark, and custom SVG branding (Shield, Open Quran book silhouette, and Security key).
- **Dark / Light Modes**: Default dark mode with an instant theme toggle, persisted in `localStorage`.
- **Formatted Display & Raw Copy**: Displays readable 4-character chunked codes (e.g. `687D 6666 6A65`), but copies the raw unspaced hex (`687D66666A65`) to the clipboard with toast feedback.
- **Input Validation**: Automatically trims whitespace, provides helpful validation messages, and supports numeric & alphanumeric IDs.
- **Keyboard Shortcuts**:
  - `Enter`: Generate activation code
  - `Escape`: Clear and reset form
- **Zero External Dependencies**: No frameworks, no external CDNs, no npm packages. Works fully offline.

---

## 🚀 How to Run Locally

Simply double-click or open `index.html` in any web browser (Chrome, Edge, Firefox, Safari).

---

## 🔑 Configuration: Secret Key

Before using in production, replace the placeholder key in [`script.js`](script.js):

```javascript
// Replace this with the SAME secretKey used by the Flutter app and Delphi API.
const SECRET_KEY = "YOUR_SECRET_KEY";
```

> **Security Note:** Do not commit your real production secret key to a public repository. Keep your repository private or use a local copy for production keys.

---

## 🌐 How to Host on GitHub Pages

Because this project is built entirely with static files (`index.html`, `style.css`, `script.js`), it can be hosted on GitHub Pages in seconds:

1. Push this repository to GitHub.
2. Go to your repository on GitHub: `https://github.com/khaledbouhoun/generateur-code-activation-parent-`
3. Click on **Settings** (Paramètres).
4. In the left sidebar, click on **Pages**.
5. Under **Build and deployment** > **Source**, select:
   - Branch: `main`
   - Folder: `/ (root)`
6. Click **Save**.
7. In about 1–2 minutes, your generator will be live at:
   `https://khaledbouhoun.github.io/generateur-code-activation-parent-/`

---

## 📁 Project Structure

```text
├── index.html        # Semantic HTML5 markup, SVG iconography & layout
├── style.css         # Modern CSS variables, responsive design, dark/light themes
├── script.js         # XOR encryption logic, validation, clipboard, theme persistence
└── README.md         # Documentation and GitHub Pages hosting instructions
```

---

## 🧪 Algorithm Compatibility

Tested and verified against Dart 3.12.2 and Node.js:

| Plaintext | Secret Key | Generated Activation Code |
| :--- | :--- | :--- |
| `123456` | `YOUR_SECRET_KEY` | `687D66666A65` |
| `Parent-99` | `AdminKey2026` | `11051F0C003F48400B` |
| `مرحبا` | `SECRET` | `8AC09BE39DF98BED9BF5` |
