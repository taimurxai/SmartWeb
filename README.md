# Trackr — Dark Theme Tracking Dashboard

Next.js (App Router) + Tailwind CSS. Deep Navy + Violet dark theme. Login, User Dashboard, এবং Admin Dashboard — সব mock data দিয়ে ফুল ইন্টারঅ্যাকটিভ।

## চালানোর নিয়ম

```bash
npm install
npm run dev
```

তারপর ব্রাউজারে `http://localhost:3000` খুলুন।

## ডেমো লগইন

| Role  | Email            | Password  |
|-------|------------------|-----------|
| Admin | admin@demo.com   | admin123  |
| User  | user1@demo.com   | user123   |

লগইন করলে role অনুযায়ী auto-redirect হবে (Admin → `/admin`, User → `/dashboard`)।

## পেজগুলো

- **`/`** — Login page. স্ক্রিনের মাঝখানে minimal card.
- **`/dashboard`** — User dashboard. Navbar + কোড ইনপুট + লাইভ status tracking card (In Review → Success/Failed)।
- **`/admin`** — Admin dashboard. Sidebar (Overview / User List / System Log) + stats cards + user management টেবিল (Add / Edit / Delete)।

### ডেমো ট্র্যাকিং কোড

| কোড                 | স্ট্যাটাস    |
|---------------------|-------------|
| 1234567890123456    | In Review (লাইভ আপডেট হবে) |
| 9876543210987654    | Success     |
| 1111222233334444    | Failed      |

যেকোনো নতুন ১৫/১৬ ডিজিটের কোড দিলে "In Review 1" থেকে শুরু হয়ে ধাপে ধাপে আপডেট হবে।

## Backend যুক্ত করতে হলে

সব mock লজিক আছে `lib/store.jsx`-এ। `login`, `trackCode`, `addUser`, `deleteUser`, `updateUser` — এই ফাংশনগুলোকে আপনার আসল API call দিয়ে replace করলেই হবে। User dashboard-এর `startLiveSimulation` অংশটি একটি real websocket বা polling দিয়ে বদলানো যাবে।

বর্তমানে ডেটা ব্রাউজারের `localStorage`-এ persist হয়।

## স্ট্রাকচার

```
app/
  layout.jsx        # StoreProvider wrapper
  page.jsx          # Login
  dashboard/page.jsx# User dashboard
  admin/page.jsx    # Admin dashboard
components/
  Navbar.jsx
  StatusBadge.jsx
lib/
  store.jsx         # mock auth + data + tracking
```
