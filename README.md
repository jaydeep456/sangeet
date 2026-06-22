# SANGEET – Tune of Trends 👑

> A premium luxury ethnic clothing brand MERN stack application.

![Brand](https://img.shields.io/badge/Brand-SANGEET-gold?style=flat-square)
![Stack](https://img.shields.io/badge/Stack-MERN-emerald?style=flat-square)
![License](https://img.shields.io/badge/License-MIT-blue?style=flat-square)

---

## 🏛️ Project Structure

```
sangeet/
├── backend/          # Express + MongoDB REST API
└── frontend/         # React + Vite frontend
```

---

## ✨ Features

- **Full CRUD** – Create, Read, Update, Delete products
- **Cloudinary** – Image upload and management
- **Search & Filter** – Search by name, filter by size
- **Responsive** – Mobile, Tablet, Laptop, Desktop
- **Toast Notifications** – Branded success/error toasts
- **Loading States** – Royal branded spinner
- **Empty State** – Helpful empty collection state
- **Form Validation** – Client-side with clear errors
- **Delete Confirmation** – Custom modal before delete

---

## 🚀 Getting Started

### Prerequisites
- Node.js v18+
- npm v9+
- MongoDB Atlas account
- Cloudinary account

### Backend Setup

```bash
cd backend
npm install

# Create .env file from example
cp .env.example .env
# Fill in your MongoDB URI and Cloudinary credentials in .env

npm run dev       # development (nodemon)
npm start         # production
```

### Frontend Setup

```bash
cd frontend
npm install

# For production, create a .env.local file:
# VITE_API_URL=https://your-render-backend.onrender.com/api

npm run dev       # development server on http://localhost:3000
npm run build     # production build
npm run preview   # preview production build
```

---

## 🔐 Environment Variables

### Backend `.env`
| Variable | Description |
|----------|-------------|
| `PORT` | Server port (default: 5000) |
| `MONGO_URI` | MongoDB Atlas connection string |
| `CLOUDINARY_CLOUD_NAME` | Cloudinary cloud name |
| `CLOUDINARY_API_KEY` | Cloudinary API key |
| `CLOUDINARY_API_SECRET` | Cloudinary API secret |
| `FRONTEND_URL` | Frontend URL for CORS (optional) |

### Frontend `.env.local` (Production only)
| Variable | Description |
|----------|-------------|
| `VITE_API_URL` | Backend API URL (e.g. Render URL) |

---

## 📡 API Endpoints

| Method | Endpoint | Description |
|--------|----------|-------------|
| `GET` | `/api/products` | Get all products (supports `?search=&size=` query params) |
| `GET` | `/api/products/:id` | Get single product |
| `POST` | `/api/products` | Create product (multipart/form-data) |
| `PUT` | `/api/products/:id` | Update product (multipart/form-data) |
| `DELETE` | `/api/products/:id` | Delete product |
| `GET` | `/` | Health check |

---

## 🎨 Brand Theme

| Token | Color | Use |
|-------|-------|-----|
| Gold | `#D4AF37` | Typography, accents, CTAs |
| Emerald | `#1B4332` | Navbar, headers, buttons |
| Cream | `#FDF6E3` | Background, cards |
| Marble | `#FAF7F2` | Page background |

---

## ☁️ Deployment

### Backend → Render
1. Push `backend/` to GitHub
2. Create a new **Web Service** on [Render](https://render.com)
3. Set the root directory to `backend`
4. Build command: `npm install`
5. Start command: `npm start`
6. Add all environment variables

### Frontend → Vercel
1. Push `frontend/` to GitHub
2. Import project on [Vercel](https://vercel.com)
3. Set root directory to `frontend`
4. Add environment variable: `VITE_API_URL=<your-render-backend-url>/api`
5. Deploy!

---

## 📱 Responsive Breakpoints

| Device | Grid | Breakpoint |
|--------|------|-----------|
| Desktop | 4 columns | ≥1200px |
| Tablet-L | 3 columns | 992–1199px |
| Tablet | 2 columns | 576–991px |
| Mobile | 1 column | <576px |

---

## 🧑‍💻 Tech Stack

**Frontend:** React 18, Vite, Bootstrap 5, React Router 6, Axios, React Hot Toast  
**Backend:** Node.js, Express 4, Mongoose, Multer, Cloudinary  
**Database:** MongoDB Atlas  
**Storage:** Cloudinary  
**Deployment:** Vercel (frontend) + Render (backend)

---

*© 2025 SANGEET – Tune of Trends. Crafted with ❤️ for ethnic fashion lovers.*
