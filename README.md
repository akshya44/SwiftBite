# 🔥 SwiftBite — Fast Food Delivery App

A full-stack food delivery web application built with React, Node.js, Express, and SQLite. Customers can browse restaurants, add items to cart, and place orders. Restaurant owners can manage their menus and update order statuses.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios, Tailwind CSS |
| **Backend** | Node.js, Express 5, JWT Auth, bcryptjs, express-validator |
| **Database** | SQLite, better-sqlite3 |
| **Styling** | Tailwind CSS + Custom CSS Variables |
| **Deployment** | Vercel (configured via `vercel.json`) |

---

## 📁 Project Structure

```
SwiftBite/
├── client/                  # React frontend (Vite)
│   ├── src/
│   │   ├── api/             # Axios instance
│   │   ├── components/      # Navbar, Spinner, Toast
│   │   ├── context/         # AuthContext, CartContext
│   │   └── pages/           # Home, Login, Register, Restaurants, Cart, Orders, Profile
│   ├── .env
│   └── vite.config.js
├── server/                  # Node.js + Express backend
│   ├── database/            # db.js (SQLite setup and queries)
│   ├── middleware/          # auth.js, validate.js
│   ├── routes/              # auth.js, restaurants.js, orders.js
│   ├── index.js
│   └── .env
├── package.json             # Root monorepo scripts
├── vercel.json              # Vercel deployment config
└── README.md
```

---

## ⚡ Local Setup

### Prerequisites
- Node.js v18+
- npm v9+

### 1. Clone the repository
```bash
git clone https://github.com/akshya44/SwiftBite.git
cd SwiftBite
```

### 2. Set up environment variables

**Server** (`/server/.env`):
```env
PORT=5000
JWT_SECRET=your_super_secret_jwt_key
NODE_ENV=development
CLIENT_URL=http://localhost:5173
```

**Client** (`/client/.env`):
```env
VITE_API_URL=http://localhost:5000
```

### 3. Install dependencies
```bash
# Install all at once
npm run install:all

# Or separately:
cd server && npm install
cd ../client && npm install
```

### 4. Start development servers
```bash
# From root — runs both server + client concurrently
npm run dev

# Or individually:
npm run server    # Express on :5000
npm run client    # Vite on :5173
```

> The backend automatically creates a local SQLite database file (`database.sqlite`) and seeds it with demo data upon startup!

---

## 🔑 Environment Variables

### Server (`/server/.env.example`)
| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `JWT_SECRET` | JWT signing secret | `change_this_in_production` |
| `NODE_ENV` | Environment | `development` / `production` |
| `CLIENT_URL` | Frontend URL for CORS | `http://localhost:5173` |

### Client (`/client/.env.example`)
| Variable | Description | Example |
|---|---|---|
| `VITE_API_URL` | Backend API base URL | `http://localhost:5000` |

---

## 🌐 API Endpoints

### Auth
| Method | Route | Access |
|---|---|---|
| POST | `/api/auth/register` | Public |
| POST | `/api/auth/login` | Public |

### Restaurants
| Method | Route | Access |
|---|---|---|
| GET | `/api/restaurants` | Public |
| GET | `/api/restaurants/:id` | Public |
| POST | `/api/restaurants` | Restaurant Owner / Admin |
| PUT | `/api/restaurants/:id` | Owner / Admin |
| DELETE | `/api/restaurants/:id` | Owner / Admin |
| GET | `/api/restaurants/:id/menu` | Public |
| POST | `/api/restaurants/:id/menu` | Owner / Admin |
| PUT | `/api/restaurants/:id/menu/:itemId` | Owner / Admin |
| DELETE | `/api/restaurants/:id/menu/:itemId` | Owner / Admin |

### Orders
| Method | Route | Access |
|---|---|---|
| POST | `/api/orders` | Customer (authenticated) |
| GET | `/api/orders/my` | Customer (authenticated) |
| GET | `/api/orders/restaurant` | Restaurant Owner |
| GET | `/api/orders/:id` | Owner / Customer |
| PUT | `/api/orders/:id/status` | Restaurant Owner / Admin |

---

## 🚀 Deployment (Vercel)

The app is pre-configured to be deployed natively on Vercel via the `vercel.json` file.

1. Push your code to GitHub.
2. Go to [Vercel Dashboard](https://vercel.com/dashboard) and click **Add New Project**.
3. Import your GitHub repository.
4. Add your **Environment Variables** (like `JWT_SECRET`).
5. Click **Deploy**!

> **Warning:** To operate smoothly in Vercel's serverless environment, the backend writes the SQLite database to `/tmp/database.sqlite` (Demo Mode). This means the database is reset periodically as serverless functions sleep. This is ideal for portfolios or demonstrations. 

---

## 👤 User Roles

| Role | Can Do |
|---|---|
| `customer` | Browse restaurants, add to cart, place orders, view own orders |
| `restaurant` | All customer actions + create/manage restaurant, manage menu, update order status |
| `admin` | All access |

---

## 📝 License

MIT — free to use, share, and modify.
