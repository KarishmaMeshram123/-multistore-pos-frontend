# NEXUS POS — Frontend

Multi-Tenant SaaS POS System Frontend built with **React + Vite**.

## Tech Stack

- React 18 + Vite
- React Router v6
- Axios (API calls)
- Recharts (Charts & Analytics)
- Lucide React (Icons)
- CSS Modules (Scoped styling)

## Setup & Run

### Prerequisites
- Node.js 18+
- Backend running on `http://localhost:8081`

### Install & Start

```bash
npm install
npm run dev
```

App runs at `http://localhost:5173`

The Vite dev server proxies all `/api/**` requests to `http://localhost:8081`.

## Pages & Routes

| Route | Page | Access |
|-------|------|--------|
| `/login` | Login | Public |
| `/register` | Register User | Public |
| `/setup` | Create Tenant/Store | Public |
| `/dashboard` | Overview & Stats | All roles |
| `/products` | Product Management | All roles |
| `/inventory` | Inventory Management | ADMIN, MANAGER |
| `/billing` | Create New Bill (POS) | All roles |
| `/orders` | View All Orders | ADMIN, MANAGER |
| `/reports` | Sales Analytics | ADMIN only |

## Usage Flow

1. **Create Store** → `/setup` — Create a new tenant, note the Tenant ID
2. **Register Admin** → `/register` — Use the Tenant ID to create the first admin user
3. **Login** → `/login` — Sign in with your credentials
4. **Add Products** → `/products` — Add products to your store
5. **Set Inventory** → `/inventory` — Set stock levels for each product
6. **Create Bills** → `/billing` — Select products and place orders
7. **View Reports** → `/reports` — Analyze sales performance

## Folder Structure

```
src/
├── context/        # AuthContext (global user state)
├── services/       # api.js (Axios + all API calls)
├── components/     # DashboardLayout (sidebar nav)
├── pages/          # All page components
└── index.css       # Global CSS variables & reset
```

## Build for Production

```bash
npm run build
```

Output in `dist/` — serve with any static file server or configure reverse proxy.
