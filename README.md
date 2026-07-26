# Trackr — Dark Theme Tracking Dashboard

Next.js (App Router) + Tailwind CSS + Prisma. Deep Navy + Violet dark theme. Login, User Dashboard, এবং Admin Dashboard — সবই একটি real backend (SQLite/PostgreSQL, session-based auth, RBAC) দিয়ে চালিত।

## চালানোর নিয়ম

```bash
npm install
cp .env.example .env
```

`.env`-এ আপনার নিজের Firebase প্রজেক্টের config বসান (Project Settings), এবং Firebase Console → **Authentication → Sign-in method**-এ **Email/Password** provider enable করুন — এটা ছাড়া লগইন কাজ করবে না।

```bash
npx prisma migrate dev
npx prisma db seed
npm run dev
```

তারপর ব্রাউজারে `http://localhost:3000` খুলুন।

## ডেমো লগইন

| Role  | Email            | Password  |
|-------|------------------|-----------|
| Admin | admin@demo.com   | admin123  |
| User  | user1@demo.com   | user123   |

লগইন করলে role অনুযায়ী auto-redirect হবে (Admin → `/admin`, User → `/dashboard`)। এই একাউন্টগুলো `prisma/seed.mjs` দিয়ে তৈরি হয় — Firebase Authentication-এ আসল একাউন্ট হিসেবে (email+password) তৈরি হয়, আর Prisma-তে শুধু role/status/`firebaseUid` লিঙ্ক সংরক্ষিত থাকে; কোনো পাসওয়ার্ড এই অ্যাপের নিজস্ব DB-তে কখনো সংরক্ষিত হয় না।

## পেজগুলো

- **`/`** — Login page.
- **`/dashboard`** — User dashboard. Navbar + কোড ইনপুট + লাইভ status tracking card (In Review → Success/Failed), personal date-wise activity history।
- **`/admin`** — Admin dashboard. Sidebar (Overview / User List / System Log) + global stats cards + user management (Add / Edit / Freeze / Delete) + search/sort/pagination + audit log।

### ডেমো ট্র্যাকিং কোড

| কোড                 | স্ট্যাটাস    |
|---------------------|-------------|
| 1234567890123456    | না-ব্যবহৃত থাকলে In Review থেকে শুরু হয়ে লাইভ আপডেট হবে |
| 9876543210987654    | Success (fixed) |
| 1111222233334444    | Failed (fixed)  |

যেকোনো নতুন ১৫/১৬ ডিজিটের কোড দিলে সার্ভার-সাইডে (elapsed-time ভিত্তিক, deterministic) In Review থেকে শুরু করে কয়েক সেকেন্ডে Success/Failed-এ resolve হবে — ক্লায়েন্ট শুধু প্রতি ২.৫ সেকেন্ডে পোল করে সার্ভারের real state দেখায়, নিজে কোনো ফলাফল বানায় না।

## আর্কিটেকচার

- **DB**: Prisma + SQLite (`prisma/schema.prisma`, local dev). Production-এ Postgres-এ যেতে হলে schema-র `datasource provider` কে `"postgresql"` করে, `DATABASE_URL` একটা real Postgres instance-এ পয়েন্ট করে, `prisma/migrations` ডিলিট করে `npx prisma migrate dev` আবার চালান।
- **Auth**: পাসওয়ার্ড যাচাই হয় **Firebase Authentication**-এ (`lib/firebaseAuth.js`, Identity Toolkit REST API দিয়ে সার্ভার-সাইডে) — এই অ্যাপ কখনো কোনো পাসওয়ার্ড নিজে সংরক্ষণ করে না। সফল হলে এই অ্যাপের নিজস্ব opaque, DB-backed session token ইস্যু হয় — `httpOnly` + `SameSite=Lax` cookie, DB-তে validate হয় প্রতি request-এ। Freeze করা হলে বা session delete হলে পরবর্তী request-এই সাথে সাথে block হয় (JWT-ভিত্তিক হলে এটা সম্ভব হতো না রিভোকেশন ছাড়া)। Prisma-র `User.firebaseUid` কলাম Firebase একাউন্টকে এই অ্যাপের role/status-এর সাথে লিঙ্ক করে।
- **RBAC**: `lib/rbac.js`-এর `withAuth`/`withAdmin` wrapper প্রতিটা API route-এ session + role রিভ্যালিডেট করে। ক্লায়েন্ট-সাইড redirect শুধু UX-এর জন্য, নিরাপত্তার আসল boundary সবসময় সার্ভারে। Firebase Console-এ সরাসরি তৈরি করা কোনো একাউন্টে লগইন করা যাবে না, যতক্ষণ না Admin প্যানেল দিয়ে তার জন্য matching Prisma রেকর্ড তৈরি করা হয়।
- **Security**: Firebase Authentication দিয়ে ক্রেডেনশিয়াল ভেরিফিকেশন (bcrypt-এর বদলে), Origin-header ভিত্তিক CSRF check, login rate limiting (IP+email sliding window), CSP/HSTS/X-Frame-Options ইত্যাদি security headers (`next.config.mjs`), zod input validation প্রতিটা route-এ।
- **Data integrity**: কোনো count আলাদা করে increment/store হয় না — সবকিছু raw event টেবিল (`LoginEvent`, `TrackingSubmission`, `AuditLog`) থেকে live query করে বের করা হয়, তাই "attempts" সবসময় ঠিক success+failed+inReview-এর সমান, drift হওয়ার সুযোগ নেই। Global (admin) আর individual (per-user) totals সম্পূর্ণ আলাদা query দিয়ে হিসাব হয়।

## স্ট্রাকচার

```
app/
  layout.jsx            # AuthProvider wrapper
  page.jsx               # Login
  dashboard/page.jsx     # User dashboard
  admin/page.jsx          # Admin dashboard
  api/                    # Route handlers (auth, track, admin/*, dashboard/*)
components/
  Navbar.jsx, StatusBadge.jsx, UserActivityDashboard.jsx
  Pager.jsx, SearchInput.jsx, DataState.jsx
lib/
  db.js, auth.js, rbac.js, validation.js, rateLimit.js, audit.js, tracking.js, device.js
  api.js, auth-context.jsx, historyUtils.js, statusMeta.js, hooks.js
  services/               # trackingStats.js, history.js, records.js
prisma/
  schema.prisma, seed.mjs, migrations/
```
