# Weekly Report Generator & Team Dashboard

A full-stack app for managing weekly team reporting workflows. Employees can create and track personal weekly reports, managers can review submissions, and administrators can manage users and settings.

## Deployed links

- Frontend: https://weekly-report-and-team-dashboard.vercel.app
- Backend API: https://weekly-report-and-team-dashboard-6b.vercel.app
- API docs: https://weekly-report-and-team-dashboard-6b.vercel.app/docs

## Overview

This repository contains:

- A FastAPI backend that exposes REST APIs and handles authentication, user management, and report workflows.
- A Next.js frontend that provides the dashboard, personal report pages, review flow, and admin tools.
- Supabase integration for authentication and data persistence.

## Tech stack

### Frontend
- Next.js 16
- React 19
- TypeScript
- Tailwind CSS
- Supabase SSR client

### Backend
- Python 3
- FastAPI
- Pydantic
- Supabase Python client
- JWT-based authentication with bcrypt and python-jose

## Project structure

```text
.
├── backend/
│   ├── app/
│   │   ├── api/
│   │   ├── core/
│   │   ├── db/
│   │   ├── schemas/
│   │   ├── services/
│   │   └── __init__.py
│   ├── main.py
│   └── requirements.txt
├── frontend/
│   ├── app/
│   ├── components/
│   ├── contexts/
│   ├── data/
│   ├── hooks/
│   ├── lib/
│   ├── public/
│   ├── types/
│   ├── package.json
│   ├── next.config.ts
│   └── README.md
├── README.md
└── .gitignore
```

## Features

- User sign-in and authentication flow
- Weekly report creation and editing
- Report history and status tracking
- Manager review and approval workflow
- Admin user management
- Shared dashboard and settings experience

## Prerequisites

Before running the project, install:

- Python 3.10 or newer
- Node.js 18 or newer
- npm
- A Supabase project with URL and anon/service keys

## Environment setup

### Backend

Create a `.env` file inside the `backend` directory with values similar to:

```env
SUPABASE_URL=https://your-project.supabase.co
SUPABASE_KEY=your-supabase-anon-or-service-key
SECRET_KEY=your-jwt-secret
FRONTEND_URL=http://localhost:3000
```

The app reads these values from `backend/app/core/config.py` using Pydantic settings.

### Frontend

Create a `.env.local` file inside the `frontend` directory:

```env
NEXT_SUPABASE_URL=https://your-project.supabase.co
NEXT_SUPABASE_ANON_KEY=your-supabase-anon-key
NEXT_API_URL=http://localhost:8000/api/v1
```

## Running the app

### 1) Backend

From the project root:

```bash
cd backend
python -m venv .venv
source .venv/bin/activate   # Windows: .venv\Scripts\activate
pip install -r requirements.txt
uvicorn main:app --reload --host 0.0.0.0 --port 8000
```

The API will be available at:

- http://localhost:8000
- Swagger docs: http://localhost:8000/docs

### 2) Frontend

Open a second terminal:

```bash
cd frontend
npm install
npm run dev
```

The application will be available at:

- http://localhost:3000

## Common commands

### Backend

```bash
cd backend
pip install -r requirements.txt
uvicorn main:app --port 8000 --reload
```

### Frontend

```bash
cd frontend
npm install
npm run dev
npm run build
npm run lint
```

## Notes

- The backend CORS configuration allows localhost development and the deployed Vercel frontend.
- This project uses Supabase for both authentication and application data storage.
- The frontend uses the backend API through the helper in `frontend/lib/api.ts`.

## Development workflow

Typical local workflow:

1. Start the backend API.
2. Start the frontend app.
3. Sign in from the frontend using the configured Supabase auth flow.
4. Create, review, and manage weekly reports through the dashboard and admin screens.



