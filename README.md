# SmartWeb Dashboard

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?logo=Prisma&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)

A powerful, dark-themed tracking dashboard and user management system built with Next.js. It features a complete custom authentication system, role-based access control (RBAC), and direct API integration capabilities for external desktop software.

## ✨ Features

- **Custom Authentication:** Secure, session-based authentication using `bcryptjs` for password hashing and `jsonwebtoken` for API tokens. (No third-party dependencies like Firebase or Supabase).
- **Role-Based Access Control (RBAC):** Distinct interfaces and permissions for `Admin` and `User` roles.
- **Admin Dashboard:** Manage users (Add/Edit/Freeze/Delete), view global tracking stats, and monitor system-wide activity logs.
- **User Dashboard:** Submit tracking codes, view live status updates (In Review → Success/Failed), and check personal activity history.
- **Software API Integration:** Built-in REST APIs (`/api/software/verify` and `/api/software/results`) for direct communication with the Smart Desktop Application.
- **Modern UI/UX:** Deep Navy & Violet dark theme built with Tailwind CSS, featuring responsive design and real-time state feedback.

## 🛠️ Technology Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes
- **Database:** PostgreSQL (Vercel Postgres)
- **ORM:** Prisma
- **Security:** `bcryptjs` (Hashing), `jose`/`jsonwebtoken` (Session & API Tokens)

## 🚀 Quick Start (Local Development)

### 1. Clone the repository
```bash
git clone https://github.com/taimurxai/SmartWeb.git
cd SmartWeb
```

### 2. Install dependencies
```bash
npm install
```

### 3. Environment Setup
Copy the `.env.example` file to `.env` and configure your PostgreSQL database URL.
```bash
cp .env.example .env
```
Update the `.env` file:
```env
DATABASE_URL="postgresql://user:password@localhost:5432/smartweb?schema=public"
JWT_SECRET="your_super_secret_jwt_key_here"
```

### 4. Database Migration & Seeding
Push the schema to your database and generate the Prisma client.
```bash
npx prisma db push
npx prisma db seed
```
*(The seed script will create default Admin and User accounts).*

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to see the result.

## 🔑 Demo Accounts

If you ran the seed script, you can log in with the following credentials:

| Role  | Email            | Password  |
|-------|------------------|-----------|
| Admin | admin@demo.com   | admin123  |
| User  | user1@demo.com   | user123   |

## 🔌 API Endpoints for Software

The dashboard exposes specific endpoints for the Smart Desktop App:

- `POST /api/auth/login` : Authenticate software user and receive a Bearer token.
- `GET /api/software/verify` : Verify if the user's account is active/frozen before launching tasks.
- `POST /api/software/results` : Submit verification results directly to the dashboard database.

---
*Built with ❤️ for AgeSmart Verifier.*
