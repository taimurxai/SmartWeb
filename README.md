# SmartWeb Dashboard

![Next.js](https://img.shields.io/badge/Next.js-14-black) ![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-38B2AC?logo=tailwind-css&logoColor=white) ![Prisma](https://img.shields.io/badge/Prisma-3982CE?logo=Prisma&logoColor=white) ![PostgreSQL](https://img.shields.io/badge/PostgreSQL-316192?logo=postgresql&logoColor=white)

A powerful, dark-themed tracking dashboard and user management system built with Next.js. It features a complete custom authentication system, role-based access control (RBAC), and direct API integration capabilities.

## ✨ Features

- **Secure Authentication:** Robust, database-backed session management using `bcryptjs` for password hashing and secure HttpOnly cookies.
- **Role-Based Access Control (RBAC):** Distinct interfaces and strict permission boundaries for `Admin` and `User` roles.
- **Admin Dashboard:** Manage users, view global tracking stats, and monitor system-wide activity logs in real-time.
- **User Dashboard:** Submit tracking codes, view live status updates, and check personal activity history.
- **Software API Integration:** Built-in REST APIs designed for direct and secure communication with external applications.
- **Modern UI/UX:** Deep Navy & Violet dark theme built with Tailwind CSS, featuring responsive design, glassmorphism, and smooth micro-interactions.

## 🛠️ Technology Stack

- **Frontend:** Next.js (App Router), React, Tailwind CSS
- **Backend:** Next.js API Routes (Serverless)
- **Database:** PostgreSQL
- **ORM:** Prisma
- **Security:** CSRF Protection, Strict Cookie Policies, Rate Limiting, and XSS Mitigations.

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
Copy the `.env.example` file to `.env` and configure your database URL.
```bash
cp .env.example .env
```
Ensure your database connection string is properly set in the `.env` file before proceeding.

### 4. Database Setup
Push the schema to your database and generate the Prisma client.
```bash
npx prisma db push
npx prisma db seed
```
*(The seed script will create default accounts for local testing).*

### 5. Run the development server
```bash
npm run dev
```
Open [http://localhost:3000](http://localhost:3000) with your browser to explore the dashboard.

## 🔌 API Integration

The dashboard exposes RESTful endpoints for external software integration. All protected endpoints require valid session authorization and enforce strict rate limits to ensure system stability.

---
*Developed for a secure and seamless user experience.*
