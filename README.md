# School OS

School OS is a full-stack AI-powered education platform for teachers, students, and admins.

It includes:
- Lesson management (subjects -> topics -> lessons)
- AI Tutor (chat, summary, question generation)
- Quiz engine with timer, leaderboard, instant feedback
- Student dashboard with learning analytics and charts
- Teacher/Admin panel for content and analytics management
- JWT authentication + protected routes + rate limiting
- Dark mode with localStorage persistence
- Search, bookmarks, streaks, XP and gamification

## Tech Stack

- Frontend: Next.js 16, React 19, TailwindCSS 4, Framer Motion, Chart.js
- Backend: Node.js, Express.js, TypeScript
- Database: MongoDB + Mongoose
- AI: OpenAI API
- Auth: JWT + bcrypt
- DevOps: Docker + Docker Compose + Vercel-ready frontend

## Project Structure

```text
Lesson2/
├── backend/
│   ├── src/
│   │   ├── config/
│   │   ├── controllers/
│   │   ├── data/
│   │   ├── middleware/
│   │   ├── models/
│   │   ├── routes/
│   │   ├── services/
│   │   ├── types/
│   │   ├── utils/
│   │   └── index.ts
│   ├── .env.example
│   ├── Dockerfile
│   └── package.json
├── frontend/
│   ├── src/
│   │   ├── app/
│   │   │   ├── auth/
│   │   │   ├── lessons/
│   │   │   ├── quiz/
│   │   │   ├── student/
│   │   │   ├── teacher/
│   │   │   └── leaderboard/
│   │   ├── components/
│   │   └── lib/
│   ├── .env.local.example
│   ├── Dockerfile
│   └── package.json
├── shared/
├── docker-compose.yml
└── README.md
```

## Environment Setup

### 1) Backend env

Copy and edit backend env:

```bash
cd backend
cp .env.example .env
```

Required variables:

```env
MONGODB_URI=mongodb://localhost:27017/school-os
JWT_SECRET=your_super_secret_jwt_key
OPENAI_API_KEY=your_openai_api_key
CLIENT_URL=http://localhost:3000
```

### 2) Frontend env

```bash
cd frontend
cp .env.local.example .env.local
```

Set:

```env
NEXT_PUBLIC_API_URL=http://localhost:5000/api
```

## Installation

From root:

```bash
npm install
cd backend && npm install
cd ../frontend && npm install
```

## Run Locally

### Option A: run both apps from root

```bash
npm run dev
```

- Frontend: http://localhost:3000
- Backend API: http://localhost:5000/api

### Option B: run separately

Backend:

```bash
cd backend
npm run dev
```

Frontend:

```bash
cd frontend
npm run dev
```

## Seed Demo Data

Populate DB with demo users, subjects, lesson and quiz:

```bash
cd backend
npm run seed
```

Demo accounts:
- Admin: `admin@schoolos.com` / `admin123`
- Teacher: `teacher@schoolos.com` / `teacher123`
- Student: `student@schoolos.com` / `student123`

## Build

Backend:

```bash
cd backend
npm run build
```

Frontend:

```bash
cd frontend
npm run build
```

Root build:

```bash
npm run build
```

## Docker Run

Start full stack with MongoDB:

```bash
docker compose up --build
```

Services:
- MongoDB: `localhost:27017`
- Backend: `localhost:5000`
- Frontend: `localhost:3000`

Stop:

```bash
docker compose down
```

## API Highlights

- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/subjects`
- `GET /api/lessons`
- `GET /api/lessons/:slug`
- `POST /api/quiz/:id/submit`
- `POST /api/ai/chat`
- `GET /api/analytics/student`
- `GET /api/analytics/teacher`

## Deployment

### Frontend on Vercel

1. Import `frontend` folder into Vercel.
2. Set env var:
   - `NEXT_PUBLIC_API_URL=https://your-backend-domain/api`
3. Deploy.

### Backend

Deploy backend to your preferred Node host (Render/Railway/Fly/VM).
Set backend env vars from `.env.example`.

## Notes

- AI features require a valid OpenAI API key.
- Backend includes JWT auth, role-based access, rate limiting and secure password hashing.
- Dark mode state is saved in localStorage.
