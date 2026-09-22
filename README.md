<div align="center">
  <img src="https://raw.githubusercontent.com/taimurxai/SmartWeb/main/Web/public/favicon.ico" alt="Logo" width="80" height="80">

  # 🛡️ AgeSmart Enterprise Tracking & Verification
  
  **Next-Generation Identity Verification Ecosystem**
  
  [![Next.js](https://img.shields.io/badge/Next.js-14-black?style=for-the-badge&logo=next.js)](https://nextjs.org/)
  [![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?style=for-the-badge&logo=tailwind-css&logoColor=white)](https://tailwindcss.com/)
  [![Prisma](https://img.shields.io/badge/Prisma-3982CE?style=for-the-badge&logo=Prisma&logoColor=white)](https://prisma.io)
  [![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?style=for-the-badge&logo=postgresql&logoColor=white)](https://postgresql.org)
  [![Docker](https://img.shields.io/badge/Docker-Ready-blue?style=for-the-badge&logo=docker&logoColor=white)](https://docker.com)
</div>

---

A high-performance, dark-themed enterprise tracking, verification, and user management platform. **AgeSmart** is a dual-component ecosystem consisting of a secure Next.js web portal and the powerful **AgeSmart Verifier Pro** desktop client software.

This platform features server-side session management, strict role-based access control (RBAC), distributed rate limiting, and real-time telemetry APIs for the external desktop verification client.

## 🌟 The Ecosystem

### 1. SmartWeb Enterprise Dashboard (Web App)
Built with Next.js 14 (App Router) and Tailwind CSS, this web dashboard provides administrators and authorized users a centralized hub to monitor verification requests.
- **Robust Authentication & Sessions:** Database-backed, opaque server-validated sessions with `bcryptjs` password hashing and secure cookies. Instant revocation upon account freeze.
- **Role-Based Access Control (RBAC):** Strict server-side permission gates (`ADMIN` vs `NORMAL`).
- **Admin Control Center:** User lifecycle management (add, edit, freeze/unfreeze, reset bound device, delete), global metrics overview, and paginated audit logs.
- **Live User Verification Dashboard:** Real-time tracking code verification with live polling and comprehensive activity history.

### 2. AgeSmart Verifier Pro (Client Software)
A linked secure workspace software for biometric and document verification. It securely communicates with the Next.js backend to submit results and maintain a trusted environment.
- **Device Fingerprinting:** Zero-trust architecture bounds users to specific hardware via the `/api/software/verify` endpoint. Multiple failed device verification attempts automatically freeze the user's account.
- **Neural Network Verification Engine:** Processes ID documents and selfies securely.
- **Real-Time Telemetry & Status Sync:** Securely syncs verification status (e.g., `SUCCESS`, `FAILED`, `SUSPICIOUS`, `IN_REVIEW`) directly to the web dashboard via `/api/software/results`.
- **Auto-Update Mechanism:** Validates minimum client versions via `/api/software/version` to ensure security compliance.

---

## 🛠️ Technology Stack

- **Frontend / Portal:** Next.js 14, React 18, Tailwind CSS, Lucide Icons
- **Backend / API:** Next.js Server Components & Route Handlers
- **Database:** PostgreSQL (Production) / SQLite (Local Development) via Prisma ORM
- **Cache & Rate Limiting:** Redis (via `ioredis`) with memory fallback
- **Containerization:** Docker (Multi-stage Alpine image, non-root runner)

---

## 🚀 Deployment Guide

### Option 1: Docker Compose (Recommended)
The easiest way to run the complete production stack (Next.js + PostgreSQL + Redis):

1. **Configure Environment:**
   ```bash
   cp Web/.env.example Web/.env
   # Edit .env and set strong secrets for JWT_SECRET and WEBHOOK_SECRET
   ```
2. **Start the Stack:**
   ```bash
   cd Web
   docker compose up -d --build
   ```
3. **Verify Deployment & Seed DB:**
   Web App: `http://localhost:3000` | Health Check: `http://localhost:3000/api/health`
   ```bash
   docker compose exec app npx prisma db seed
   ```

### Option 2: Manual / Vercel Deployment
1. **Install Dependencies:**
   ```bash
   cd Web
   npm install
   ```
2. **Database Migration:**
   ```bash
   npx prisma db push
   ```
3. **Build & Start:**
   ```bash
   npm run build
   npm run start
   ```

---

## 🛡️ Security Architecture

1. **Defense-in-Depth:** Every API route verifies authentication, role, and origin server-side.
2. **Hardware Locking:** AgeSmart Verifier Pro client device hashes are strictly bound to accounts. Account freezing triggers automatically on repeated unknown-device logins.
3. **Distributed Rate Limiting:** Token-bucket rate limiting across login attempts, code submissions, and device verification.
4. **CSP & Security Headers:** Enforced Strict-Transport-Security (HSTS), X-Content-Type-Options, X-Frame-Options (DENY), and Content-Security-Policy.

---

## 🔌 API Integration Reference (For Verifier Pro Client)

| Method | Endpoint | Description | Auth Required |
|---|---|---|---|
| `GET` | `/api/health` | System health check (DB, Redis, Uptime) | Public |
| `POST` | `/api/auth/login` | User/Admin authentication | Rate Limited |
| `GET` | `/api/auth/me` | Current session information | Session Cookie |
| `POST` | `/api/track` | Submit tracking code | Session / Bearer |
| `GET` | `/api/track/:code` | Get tracking code status & stage | Session / Bearer |
| `POST` | `/api/software/verify` | External device fingerprint verification | Session / Bearer |
| `POST` | `/api/software/results` | Submit software verification results | Session / Bearer |
| `GET` | `/api/software/version` | Minimum & latest client software version | Public |
| `POST/GET`| `/api/update` | Webhook status updates | `x-api-key` / Secret |

---

<div align="center">
  <i>AgeSmart Tracking & Verification Ecosystem — Built for Enterprise Security</i>
</div>
