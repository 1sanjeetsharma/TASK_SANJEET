# TaskApp — Full-Stack Task Manager

A full-stack Task Management application built with **Node.js + Express** (backend) and **React + Vite + Tailwind CSS** (frontend), featuring JWT authentication and full CRUD for tasks.

---

## Features

- **Authentication** — Register, login, and JWT-protected routes
- **Task Management** — Create, view, edit, and delete tasks
- **Filters & Search** — Filter by status, priority, or keyword
- **Dashboard Stats** — Live counts for total, pending, in-progress, and completed tasks
- **Overdue Detection** — Tasks past their due date are flagged automatically
- **Responsive UI** — Works on desktop and mobile

---

## Tech Stack

| Layer    | Technology                                                   |
| -------- | ------------------------------------------------------------ |
| Backend  | Node.js, Express, SQLite (via better-sqlite3), JWT, bcryptjs |
| Frontend | React 18, Vite, Tailwind CSS, Axios, React Router v6         |

---

## Project Structure

```
taskapp/
├── backend/
│   ├── src/
│   │   ├── db/
│   │   │   └── database.js       # SQLite setup & schema
│   │   ├── middleware/
│   │   │   └── auth.js           # JWT verification middleware
│   │   └── routes/
│   │       ├── auth.js           # POST /auth/register, /auth/login, GET /auth/me
│   │       └── tasks.js          # Full CRUD + stats for tasks
│   ├── index.js                  # Express server entry point
│   ├── .env                      # Environment variables
│   └── package.json
│
└── frontend/
    ├── src/
    │   ├── api/
    │   │   └── index.js          # Axios client with auth interceptors
    │   ├── components/
    │   │   ├── TaskCard.jsx      # Individual task card with edit/delete
    │   │   ├── TaskModal.jsx     # Create / edit task modal
    │   │   └── ProtectedRoute.jsx
    │   ├── context/
    │   │   └── AuthContext.jsx   # Global auth state
    │   ├── pages/
    │   │   ├── Login.jsx
    │   │   └── Register.jsx
    │   ├── App.jsx               # Router + Dashboard page
    │   ├── main.jsx
    │   └── index.css             # Tailwind + custom component classes
    ├── vite.config.js
    ├── tailwind.config.js
    └── package.json
```

---

## Getting Started

### Prerequisites

- Node.js v18+
- npm v9+

---

### Backend Setup

```bash
cd backend
npm install
```

Create a `.env` file in `/backend`:

```env
PORT=5000
JWT_SECRET=your_super_secret_key_here
```

Start the server:

```bash
npm run dev     # development (nodemon)
# or
npm start       # production
```

The API will be running at `http://localhost:5000`.

---

### Frontend Setup

```bash
cd frontend
npm install
npm run dev
```

The frontend will be running at `http://localhost:5173`.

> The Vite dev server proxies `/api` requests to `http://localhost:5000` automatically (configured in `vite.config.js`).

---

## API Reference

### Auth

| Method | Endpoint             | Description           | Auth Required |
| ------ | -------------------- | --------------------- | ------------- |
| POST   | `/api/auth/register` | Register a new user   | No            |
| POST   | `/api/auth/login`    | Login and receive JWT | No            |
| GET    | `/api/auth/me`       | Get current user info | Yes           |

**Register / Login request body:**

```json
{
  "name": "Jane Doe",
  "email": "jane@example.com",
  "password": "secret123"
}
```

**Response:**

```json
{
  "token": "<jwt>",
  "user": { "id": 1, "name": "Jane Doe", "email": "jane@example.com" }
}
```

---

### Tasks

All task routes require `Authorization: Bearer <token>` header.

| Method | Endpoint                   | Description                      |
| ------ | -------------------------- | -------------------------------- |
| GET    | `/api/tasks`               | Get all tasks (supports filters) |
| GET    | `/api/tasks/:id`           | Get single task                  |
| POST   | `/api/tasks`               | Create a task                    |
| PUT    | `/api/tasks/:id`           | Update a task                    |
| DELETE | `/api/tasks/:id`           | Delete a task                    |
| GET    | `/api/tasks/stats/summary` | Get task counts by status        |

**GET `/api/tasks` — query params:**

| Param      | Values                                    |
| ---------- | ----------------------------------------- |
| `status`   | `pending` \| `in-progress` \| `completed` |
| `priority` | `low` \| `medium` \| `high`               |
| `search`   | any string (searches title & description) |

**Task object:**

```json
{
  "id": 1,
  "title": "Fix login bug",
  "description": "Users can't log in on mobile",
  "status": "in-progress",
  "priority": "high",
  "due_date": "2024-12-31",
  "created_at": "2024-06-01T10:00:00.000Z"
}
```

---

## Environment Variables

| Variable     | Description                 | Default      |
| ------------ | --------------------------- | ------------ |
| `PORT`       | Port for the Express server | `5000`       |
| `JWT_SECRET` | Secret key for signing JWTs | _(required)_ |

---

## Scripts

### Backend

| Command       | Description                      |
| ------------- | -------------------------------- |
| `npm start`   | Start production server          |
| `npm run dev` | Start with nodemon (auto-reload) |

### Frontend

| Command           | Description                      |
| ----------------- | -------------------------------- |
| `npm run dev`     | Start Vite dev server            |
| `npm run build`   | Build for production             |
| `npm run preview` | Preview production build locally |

---

## Screenshots

> Add screenshots of your Login, Register, and Dashboard pages here.

---

## License

MIT
