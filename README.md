# BloggerLK — Full-Stack Developer Blog Platform

A full-stack blogging platform built for developers to write, share, and discover tech articles. Built with the MERN stack, Clerk authentication, and deployed on Render (backend) + Vercel (frontend).

---

## Live Demo

| Service | URL |
|---|---|
| Frontend | _Add your Vercel URL here_ |
| Backend API | _Add your Render URL here_ |

---

## Features

- **Read & Browse** — Browse blog posts by category, paginated feed
- **Full-text Search** — Search articles by title, content, or description, scoped to a category
- **Write & Publish** — Create rich blog posts with cover images (Cloudinary or URL)
- **Edit & Delete** — Full CRUD on your own posts with confirmation dialogs
- **Authentication** — Clerk-powered sign-in (Google, email, etc.) with proper RS256 JWT verification
- **Dashboard** — Personal dashboard with tabbed view of your posts and a write form
- **Settings** — Full profile management via Clerk's built-in UserProfile component
- **Contact Form** — Rate-limited contact form with server-side validation
- **Responsive** — Works on desktop and mobile

---

## Tech Stack

### Frontend
| Tool | Purpose |
|---|---|
| React 19 | UI framework |
| Vite 7 | Build tool |
| React Router v7 | Client-side routing |
| Clerk React | Authentication UI & session management |
| Axios | HTTP client |

### Backend
| Tool | Purpose |
|---|---|
| Node.js + Express 5 | REST API server |
| MongoDB + Mongoose | Database & ODM |
| Clerk Express | JWT verification (RS256 via JWKS) |
| Cloudinary | Image uploads (with local fallback) |
| Helmet | HTTP security headers |
| express-rate-limit | API rate limiting |
| Multer | Multipart file handling |

---

## Project Structure

```
blog-project/
├── backend/
│   ├── config/
│   │   ├── db.js              # MongoDB connection
│   │   └── cloudinary.js      # Cloudinary setup
│   ├── controller/
│   │   ├── BlogPost.controller.js
│   │   ├── contact.controller.js
│   │   └── user.controller.js
│   ├── middleware/
│   │   └── clerkAuth.middleware.js  # Token verification
│   ├── models/
│   │   ├── BlogPost.model.js
│   │   ├── User.model.js
│   │   └── contact.model.js
│   ├── router/
│   │   ├── BlogPost.router.js
│   │   ├── user.router.js
│   │   └── contact.router.js
│   ├── .env.example
│   ├── index.js               # App entry point
│   └── package.json
│
└── frontend/
    ├── public/
    ├── src/
    │   ├── components/
    │   │   ├── header/        # Hero + category tabs + search bar
    │   │   ├── post/          # Blog card
    │   │   ├── posts/         # Paginated grid of cards
    │   │   ├── sidebar/       # Category list + social links
    │   │   ├── singlePost/    # Full blog post view
    │   │   ├── syncUser/      # Syncs Clerk user to MongoDB on login
    │   │   └── topbar/        # Navigation bar
    │   ├── config/
    │   │   └── api.js         # Central API base URL
    │   ├── pages/
    │   │   ├── about/
    │   │   ├── contact/
    │   │   ├── createBlog/
    │   │   ├── dashboard/
    │   │   ├── edit/
    │   │   ├── homepage/
    │   │   ├── searchResults/
    │   │   ├── settings/
    │   │   ├── single/
    │   │   └── viewBlog/
    │   ├── App.jsx
    │   └── main.jsx
    ├── .env.example
    └── package.json
```

---

## Local Development Setup

### Prerequisites
- Node.js >= 18
- A [MongoDB Atlas](https://mongodb.com/atlas) cluster
- A [Clerk](https://clerk.com) account
- A [Cloudinary](https://cloudinary.com) account (optional — images fall back to local storage)

### 1. Clone the repository

```bash
git clone https://github.com/leonardkwolesha/blog-project.git
cd blog-project
```

### 2. Set up the backend

```bash
cd backend
cp .env.example .env
npm install
```

Fill in `backend/.env`:

```env
PORT=2030
MONGODB_URI=mongodb+srv://<user>:<password>@cluster.mongodb.net/blog-regenesys
CLERK_PUBLISHABLE_KEY=pk_test_...
CLERK_SECRET_KEY=sk_test_...
CLOUDINARY_CLOUD_NAME=your_cloud_name
CLOUDINARY_API_KEY=your_api_key
CLOUDINARY_API_SECRET=your_api_secret
FRONTEND_URL=http://localhost:5173
```

Start the backend:

```bash
npm run dev        # development (nodemon)
npm start          # production
```

### 3. Set up the frontend

```bash
cd ../frontend
cp .env.example .env
npm install
```

Fill in `frontend/.env`:

```env
VITE_CLERK_PUBLISHABLE_KEY=pk_test_...
VITE_API_BASE_URL=http://localhost:2030
```

Start the frontend:

```bash
npm run dev
```

The app will be available at `http://localhost:5173`.

---

## API Reference

### Blog Posts

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/api/blogs` | No | List all posts (paginated, filterable by category) |
| `GET` | `/api/blogs/search` | No | Search posts by keyword and/or category |
| `GET` | `/api/blogs/:id` | No | Get single post |
| `POST` | `/api/blogs/create` | Yes | Create new post |
| `PUT` | `/api/blogs/:id` | Yes | Update post |
| `DELETE` | `/api/blogs/:id` | Yes | Soft-delete post |

#### Query parameters for `GET /api/blogs`
| Param | Type | Description |
|---|---|---|
| `page` | number | Page number (default: 1) |
| `limit` | number | Items per page (default: 10) |
| `category` | string | Filter by category |
| `search` | string | Full-text search |
| `sortBy` | string | Field to sort by (default: `createdAt`) |
| `order` | string | `asc` or `desc` (default: `desc`) |

#### Query parameters for `GET /api/blogs/search`
| Param | Type | Description |
|---|---|---|
| `q` | string | Search term |
| `cat` | string | Filter results to a category |
| `limit` | number | Max results (default: 10) |

### Users

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/users/sync` | Yes | Sync Clerk user to MongoDB |
| `GET` | `/api/users/me` | Yes | Get current user |

### Contact

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/api/contact/sent` | No | Submit contact form (rate-limited: 10/hr) |

### Health

| Method | Endpoint | Description |
|---|---|---|
| `GET` | `/health` | Server health check |

---

## Deployment

### Backend → Render

1. Go to [render.com](https://render.com) → **New Web Service**
2. Connect the `blog-project` GitHub repository
3. Configure:
   - **Root Directory**: `backend`
   - **Build Command**: `npm install`
   - **Start Command**: `node index.js`
4. Add all environment variables from `backend/.env.example` in the Render dashboard
5. Set `FRONTEND_URL` to your Vercel deployment URL

### Frontend → Vercel

1. Go to [vercel.com](https://vercel.com) → **New Project**
2. Import the `blog-project` GitHub repository
3. Configure:
   - **Root Directory**: `frontend`
   - **Framework Preset**: Vite (auto-detected)
4. Add environment variables:
   - `VITE_CLERK_PUBLISHABLE_KEY`
   - `VITE_API_BASE_URL` — your Render backend URL (e.g. `https://your-app.onrender.com`)

### Clerk Configuration

After deploying, add your production domains to the Clerk dashboard:
- Go to **Clerk Dashboard → Domains**
- Add your Vercel frontend URL as an allowed origin
- Update your Clerk app's `FRONTEND_API` if needed

---

## Security

- All JWT tokens are verified using Clerk's RS256 JWKS — no `jwt.decode()` bypasses
- Security headers applied via `helmet`
- Rate limiting: 200 req / 15 min on all API routes, 10 req / hr on contact form
- MongoDB search queries escaped to prevent regex DoS attacks
- Input validated server-side on all mutation endpoints
- Environment secrets kept out of version control via `.gitignore`

---

## Contributing

Pull requests are welcome. For major changes, please open an issue first.

---

## Author

**Leonard Kwolesha**
- GitHub: [@leonardkwolesha](https://github.com/leonardkwolesha)
- Email: leonardsengoma07@gmail.com

---

## License

MIT
