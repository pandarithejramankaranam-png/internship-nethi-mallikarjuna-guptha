# IronForge B2B - Gym Setup Contract Management System

[![Build Status](https://img.shields.io/badge/build-passing-brightgreen)](#)
[![License](https://img.shields.io/badge/license-MIT-blue)](#)

IronForge B2B is a professional web application designed to orchestrate, schedule, audit, and analyze commercial gym setup agreements. It links project construction and equipment delivery milestones directly with financial transaction records.

---

## 🌟 Core Features

- **Role-Based Access Control (RBAC)**: Secure access rules for **Admin** (full rights), **Manager** (create/edit contracts, payments), and **Staff** (view-only contracts, task edits).
- **Contracts Ledger**: Track B2B agreements, specifications, delivery and installation targets, and values.
- **Payment Milestones Tracker**: Log cash receipts and balances relative to logistical targets (e.g. 40% Advance, 40% Delivery, 20% Sign-off).
- **Notifications Hub**: In-app notices alerting on approaching delivery dates, setups, or overdue invoices.
- **Interactive Calendar**: Full-page calendar plotting deliveries, installations, and visits.
- **Document Exporting**: Direct client-side and backend exporting of data sheets to CSV, Excel, and PDF formats.
- **System Audit Logs**: Secure trails tracking actions (user updates, logins, contract deletions) for administrative accountability.

---

## 🛠️ Technology Stack

- **Frontend**: React.js (Vite), React Router v6, Tailwind CSS, Lucide icons, Recharts (data visualizations), React-Toastify (success/error popups)
- **Backend**: Node.js, Express.js
- **Database**: PostgreSQL (Supabase)
- **Security**: CORS, Helmet headers, Express-Rate-Limit, BCrypt password hashing, JWT authorization

---

## 🚀 Local Installation & Setup

### 1. Database Provisioning
Ensure you have a PostgreSQL database running, then execute the seeding script:
```bash
psql -h localhost -U postgres -d gym_contracts -f server/schema.sql
```

### 2. Service Environment variables
Create a `.env` file inside the `server/` directory:
```env
PORT=5000
DATABASE_URL=postgresql://postgres:password@localhost:5432/gym_contracts
JWT_SECRET=super_random_secure_secret_key
NODE_ENV=development
```

### 3. Backend Execution
```bash
cd server
npm install
npm run dev
```

### 4. Frontend Execution
```bash
# Return to root directory
npm install
npm run dev
```
Open `http://localhost:5173` in your browser.

---

## 📊 Core API Endpoints

### Authentication
- `POST /api/auth/login` - User Login
- `GET /api/auth/me` - Fetch Profile

### Contracts
- `GET /api/contracts` - Query contracts database (supports filters & search)
- `POST /api/contracts` - Initialize contract agreement
- `PUT /api/contracts/:id` - Update agreement parameters
- `DELETE /api/contracts/:id` - Delete record

### Payments & Events
- `PUT /api/contracts/:id/payments/:idx/record` - Verify payment receipt
- `GET /api/events` - Get calendar schedules
- `POST /api/events` - Add calendar task
