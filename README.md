# bloggerLK

A full-stack blog platform built with the MERN stack. Users can register, write and publish posts, upload cover images, and manage their content from a personal dashboard.

## Tech Stack

| Layer | Technology |
|---|---|
| Frontend | React 19, Vite, React Router v6 |
| Backend | Node.js, Express.js |
| Database | MongoDB Atlas (Mongoose) |
| Auth | Custom JWT (HS256, 7-day tokens) |
| Images | Cloudinary |
| Email | Nodemailer + Gmail SMTP |
| Security | Helmet, express-rate-limit, bcrypt |

## Features

- Register and log in with email and password
- Create, edit, publish, and delete blog posts
- Cover image upload via Cloudinary
- Personal dashboard — view and manage only your own posts
- Forgot password / reset password flow via email
- Contact form
- Full-text search across posts
- Responsive design

## Project Structure

```
├── backend/
│   ├── config/          # DB, Cloudinary, email setup
│   ├── controller/      # Route handlers (auth, blogs, users, contact)
│   ├── middleware/       # JWT verification
│   ├── models/          # Mongoose schemas (User, BlogPost)
│   ├── router/          # Express routers
│   ├── .env.example     # Environment variable template
│   └── index.js         # Entry point
│
└── frontend/
    └── src/
        ├── components/  # Topbar, Footer, AuthModal
        ├── context/     # AuthContext (JWT + localStorage)
        ├── pages/       # Homepage, Dashboard, Single, Settings, Auth pages…
        └── config/      # API base URL
```

## Getting Started

### Prerequisites

- Node.js 18+
- MongoDB Atlas account
- Cloudinary account
- Gmail account with [App Password](https://myaccount.google.com/apppasswords) enabled

### Backend

```bash
cd backend
npm install
cp .env.example .env   # fill in your values
npm run dev
```

**Required environment variables** (see `backend/.env.example`):

```
MONGODB_URI=
JWT_SECRET=
CLOUDINARY_CLOUD_NAME=
CLOUDINARY_API_KEY=
CLOUDINARY_API_SECRET=
EMAIL_USER=          # your Gmail address
EMAIL_PASS=          # Gmail App Password (not your regular password)
FRONTEND_URL=        # comma-separated list of allowed origins
PORT=2030
```

### Frontend

```bash
cd frontend
npm install
cp .env.example .env   # set VITE_API_BASE_URL
npm run dev
```

**Required environment variable:**

```
VITE_API_BASE_URL=http://localhost:2030
```

## API Endpoints

| Method | Path | Auth | Description |
|---|---|---|---|
| POST | `/api/auth/register` | — | Register new user |
| POST | `/api/auth/login` | — | Login, returns JWT |
| POST | `/api/auth/forgot-password` | — | Send password reset email |
| POST | `/api/auth/reset-password` | — | Reset password with token |
| GET | `/api/blogs` | — | List published posts |
| POST | `/api/blogs` | JWT | Create post |
| PUT | `/api/blogs/:id` | JWT | Update post |
| DELETE | `/api/blogs/:id` | JWT | Delete post |
| GET | `/api/users/profile` | JWT | Get current user |
| PUT | `/api/users/profile` | JWT | Update profile |
| POST | `/api/contact/sent` | — | Submit contact form |
| GET | `/health` | — | Health check |

## Deployment

The project is deployed at:

- **Frontend:** [blog-project-seven-alpha.vercel.app](https://blog-project-seven-alpha.vercel.app)
- **Backend:** set `FRONTEND_URL` to your Vercel URL so CORS allows it

## License

MIT
