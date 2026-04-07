# Project Management System

Full-stack PMS with role-based access, task tracking, time logging, file uploads, and reporting.

## Stack

| Layer | Tech |
|-------|------|
| Frontend | React 18 + TypeScript + Tailwind CSS + React Query |
| Backend | Node.js + Express + TypeScript |
| ORM | Prisma |
| Database | PostgreSQL |
| Auth | JWT + bcrypt |

---

## Prerequisites

- Node.js 18+
- PostgreSQL 14+ running locally

---

## Setup

### 1. Database

Create a PostgreSQL database:
```sql
CREATE DATABASE pms_db;
```

### 2. Backend

```bash
cd backend
npm install
```

Edit `.env` if needed (default expects `postgres:postgres@localhost:5432/pms_db`):
```
DATABASE_URL="postgresql://postgres:postgres@localhost:5432/pms_db?schema=public"
JWT_SECRET="change-this-in-production"
PORT=5000
```

Run migrations and seed:
```bash
npm run db:migrate
npm run db:seed
```

Start the dev server:
```bash
npm run dev
```

Backend runs on http://localhost:5000

### 3. Frontend

```bash
cd frontend
npm install
npm run dev
```

Frontend runs on http://localhost:5173

---

## Demo Credentials

| Role | Email | Password |
|------|-------|----------|
| Admin | admin@pms.com | admin123 |
| Manager | manager@pms.com | manager123 |
| User | john@pms.com | user123 |
| User | sarah@pms.com | user123 |

---

## Features

- **Auth** — JWT login, role-based guards (Admin / Manager / User)
- **Users** — CRUD, avatar upload, role assignment (Admin only)
- **Projects** — Create/edit projects, manage team members, file uploads
- **Tasks** — Full task lifecycle (New → Closed), Kanban board, filters
- **Time Logs** — Log hours per task with category (Development / Testing / Meeting / Support)
- **Comments** — Per-task comments with activity tracking
- **Attachments** — Upload files to tasks and projects, download
- **Notifications** — In-app notifications for assignments, status changes, comments
- **Reports** — Time by user/project, task status distribution, project progress charts
- **Dashboard** — Role-specific widgets for users, managers, and admins

---

## API Base URL

`http://localhost:5000/api`

All endpoints require `Authorization: Bearer <token>` except `POST /api/auth/login`.
