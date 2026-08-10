# CipherStream P2P 🚀
> Production-grade, zero-cloud peer-to-peer file sharing platform enabling secure, unlimited-size file transfers directly between browsers.

![License](https://img.shields.io/badge/license-MIT-blue)
![WebRTC](https://img.shields.io/badge/protocol-WebRTC_DataChannel-orange)
![Security](https://img.shields.io/badge/E2EE-AES--256--GCM_%2B_ECDH-green)

---

## 🌟 Features

- **Zero Cloud Storage & Retention**: Files stream directly from sender memory to receiver disk via WebRTC. Data never touches any server disk.
- **Unlimited File Sizes**: Bypasses traditional cloud file limits by slicing files into binary stream chunks.
- **End-to-End Encryption (E2EE)**: Ephemeral ECDH (P-256) key exchange coupled with AES-256-GCM authenticated encryption.
- **High Performance**: Sub-50ms signaling latency, automatic backpressure control (`bufferedAmount`), and dynamic low-battery throttling.
- **Instant Pairings**: Generate a 6-digit numeric code or scan a QR code to initiate direct P2P transfers instantly.

---

## 🏗️ Monorepo Tech Stack

- **Framework**: [Next.js 16](https://nextjs.org/) (App Router), [React 19](https://react.dev/), [NestJS 11](https://nestjs.com/)
- **Styling**: [Tailwind CSS 4](https://tailwindcss.com/)
- **Monorepo Tools**: [Turborepo](https://turbo.build/), [pnpm workspaces](https://pnpm.io/)
- **Real-Time Data**: WebRTC DataChannels + NestJS WebSockets + Redis Cloud
- **Security Primitives**: Web Crypto API (`SubtleCrypto`)

---

## 📁 Repository Structure

```
cipherstream-p2p/
├── apps/
│   ├── web/           # Next.js 16 Web Frontend & Glassmorphism Dashboard
│   └── signaling/     # NestJS 11 WebSocket Signaling Gateway
├── packages/
│   ├── types/         # Shared TypeScript interfaces & protocol schemas
│   ├── config/        # Shared ESLint, TypeScript, & Tailwind configs
│   └── crypto/        # Web Crypto E2EE key exchange & SHA-256 routines
├── turbo.json         # Turborepo task pipeline
└── pnpm-workspace.yaml
```

---

## 🛠️ Quick Start

```bash
# 1. Install dependencies across workspace
pnpm install

# 2. Run dev environment concurrently
pnpm dev

# 3. Build production bundles
pnpm build
```

---

## 🔒 Security Architecture

CipherStream P2P guarantees privacy using W3C Web Crypto API:
1. Sender & Receiver generate ephemeral **ECDH P-256** keypairs client-side.
2. Public keys are relayed via NestJS WebSocket signaling.
3. Both peers compute a shared secret to derive a **256-bit AES-GCM** key via HKDF.
4. Each 64KB file chunk is encrypted using a unique **96-bit Initialization Vector (IV)**.

---

## 📜 License

Distributed under the MIT License. See `LICENSE` for details.
