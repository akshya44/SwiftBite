# 🔥 SwiftBite — Fast Food Delivery App

A full-stack food delivery web application built with React, Node.js, Express, and MongoDB. Customers can browse restaurants, add items to cart, and place orders. Restaurant owners can manage their menus and update order statuses.

---

## 🚀 Tech Stack

| Layer | Technology |
|---|---|
| **Frontend** | React 18, Vite, React Router v6, Axios, Tailwind CSS |
| **Backend** | Node.js, Express 5, JWT Auth, bcryptjs, express-validator |
| **Database** | MongoDB, Mongoose |
| **Styling** | Tailwind CSS + Custom CSS Variables |
| **Deployment** | Render (configured via `render.yaml`) |

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
│   ├── middleware/          # auth.js, validate.js
│   ├── models/              # User, Restaurant, MenuItem, Order
│   ├── routes/              # auth.js, restaurants.js, orders.js
│   ├── index.js
│   └── .env
├── package.json             # Root monorepo scripts
├── render.yaml              # Render deployment config
├── Procfile                 # Process config
└── README.md
```

---

## ⚡ Local Setup

### Prerequisites
- Node.js v18+
- MongoDB (local or [MongoDB Atlas](https://cloud.mongodb.com))
- npm v9+

### 1. Clone the repository
```bash
git clone https://github.com/your-username/swiftbite.git
cd swiftbite
```

### 2. Set up environment variables

**Server** (`/server/.env`):
```env
PORT=5000
MONGO_URI=mongodb://localhost:27017/swiftbite
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

> The Vite dev server proxies `/api/*` requests to `:5000`, so no CORS issues during development.

---

## 🔑 Environment Variables

### Server (`/server/.env.example`)
| Variable | Description | Example |
|---|---|---|
| `PORT` | Server port | `5000` |
| `MONGO_URI` | MongoDB connection string | `mongodb://localhost:27017/swiftbite` |
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

## 🚀 Deployment (Render)

### Option A — Using render.yaml (Automatic)
1. Push your code to GitHub
2. Go to [Render Dashboard](https://dashboard.render.com)
3. Click **New** → **Blueprint** → connect your repo
4. Render will auto-detect `render.yaml` and set up the service
5. Fill in secret env vars: `MONGO_URI`, `CLIENT_URL`

### Option B — Manual Steps
1. **Build command:** `npm install && cd server && npm install && cd ../client && npm install && npm run build`
2. **Start command:** `node server/index.js`
3. Set environment variables: `MONGO_URI`, `JWT_SECRET`, `NODE_ENV=production`, `CLIENT_URL`

### MongoDB Atlas (Cloud Database)
1. Create a free cluster at [MongoDB Atlas](https://cloud.mongodb.com)
2. Whitelist all IPs (`0.0.0.0/0`) for Render
3. Copy the connection string to `MONGO_URI`

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
