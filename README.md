# Daily Task Reminder

Full-stack task management app with reminders, browser notifications, SMS and email alerts.

## Tech Stack
- Frontend: Plain HTML + CSS + Vanilla JavaScript
- Backend: Node.js + Express.js
- Database: MongoDB (Mongoose)
- Auth: JWT + bcrypt
- Notifications: Browser Notifications API + Nodemailer
- Scheduling: node-cron

## Project Structure

```
daily-task-reminder/
├── backend/          Node.js + Express API
└── frontend/         Plain HTML/CSS/JS (no build step)
    ├── index.html    → redirects to login
    ├── login.html
    ├── signup.html
    ├── dashboard.html
    ├── add-task.html
    ├── calendar.html
    ├── profile.html
    ├── style.css
    └── app.js        shared utilities (API, auth, theme, notifications)
```

## Setup

### 1. Backend
```bash
cd daily-task-reminder/backend
npm install
cp .env.example .env
# Edit .env with your MongoDB URI and JWT secret
npm run dev
```

### 2. Frontend
No build step needed. Open the `frontend/` folder with any static file server:

```bash
# Option A — VS Code Live Server (open frontend/index.html and click Go Live)

# Option B — Python
cd daily-task-reminder/frontend
python3 -m http.server 3000

# Option C — npx
cd daily-task-reminder/frontend
npx serve .
```

Then visit `http://localhost:3000`.

## Environment Variables (backend/.env)

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB connection string |
| `JWT_SECRET` | Secret key for JWT signing |
| `JWT_EXPIRES_IN` | Token expiry (default: 7d) |
| `CLIENT_URL` | Frontend origin for CORS (default: http://localhost:3000) |
| `EMAIL_HOST` | SMTP host (optional) |
| `EMAIL_PORT` | SMTP port (optional) |
| `EMAIL_USER` | SMTP username (optional) |
| `EMAIL_PASS` | SMTP password / app password (optional) |
| `EMAIL_FROM` | Sender email address (optional) |

## API Routes

### Auth — `/api/auth`
| Method | Route | Description |
|---|---|---|
| POST | `/signup` | Register new user |
| POST | `/login` | Login |
| GET | `/me` | Get current user (auth required) |
| PUT | `/profile` | Update profile (auth required) |

### Tasks — `/api/tasks` (all auth required)
| Method | Route | Description |
|---|---|---|
| GET | `/` | Get all tasks (supports ?status, ?priority, ?search, ?sort) |
| GET | `/stats` | Get task statistics |
| POST | `/` | Create task |
| PUT | `/:id` | Update task |
| DELETE | `/:id` | Delete task |
| PATCH | `/:id/complete` | Mark task as completed |

## Features
- JWT authentication with secure bcrypt password hashing
- Dashboard with stats, progress bars, and today's tasks
- Task CRUD with title, description, due date, priority, status
- Filter by status, search by title, sort by date/priority
- Browser notifications 15 min before due time + on overdue
- node-cron job marks overdue tasks and sends email reminders every minute
- Optional email notifications via Nodemailer (toggle in Profile)
- Calendar view showing tasks per day (custom built, no library)
- Dark mode toggle (persisted in localStorage)
- Responsive sidebar layout for mobile and desktop
