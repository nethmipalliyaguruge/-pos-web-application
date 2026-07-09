# POS Web Application

A simple **Point of Sale (POS)** web application built with the **MERN stack**
(MongoDB, Express, React, Node.js). It lets a store manage products, process
sales with real-time stock validation, view sales history, and see a summary
dashboard — with role-based access for managers (admin) and cashiers.

---

## Features

**Core**
- JWT authentication (login) with hashed passwords (bcrypt)
- Product management — create, edit, delete, search, list with pagination
- Point of Sale — build a cart, apply a discount, and check out
  - Server-side stock validation (can't oversell; stock decrements on sale)
  - Prevents selling inactive products; blocks empty carts and invalid discounts
- Sales history — filter by date range, paginate, and view full invoice details
- Dashboard — total sales, number of sales, product count, and low-stock list

**Bonus features**
- **Role-based access control** — admins manage the store; cashiers are limited
  to New Sale + Sales History, and only see their own sales
- **User management** — admins can create and delete staff accounts
- **Category tiles** on the POS for quick browsing, plus **live search**
- **Discount toggle** — apply a discount as a flat amount (Rs.) or a percentage (%)
- **Print-friendly invoice** — print or save any sale as a PDF
- **Show/hide password** toggle on login and add-user forms
- **Responsive layout** for mobile and tablet
- **Backend API tests** (Vitest + Supertest)

---

## Tech Stack

| Layer     | Technology                                                    |
| --------- | ------------------------------------------------------------- |
| Frontend  | React, Vite, React Router, Tailwind CSS, Axios                |
| Backend   | Node.js, Express, Mongoose                                    |
| Database  | MongoDB (Atlas)                                               |
| Auth      | JSON Web Tokens (JWT), bcryptjs                               |
| Validation| express-validator                                            |
| Testing   | Vitest, Supertest, mongodb-memory-server                      |

---

## Project Structure

```
pos-web-application/
├── backend/
│   ├── src/
│   │   ├── config/         # DB connection
│   │   ├── controllers/    # route logic
│   │   ├── middleware/      # auth, validation, error handling
│   │   ├── models/          # Mongoose schemas (User, Product, Sale)
│   │   ├── routes/          # API routes
│   │   ├── utils/           # token generator, seed script
│   │   ├── app.js           # Express app (used by server + tests)
│   │   └── server.js        # starts the server (connects DB + listens)
│   ├── tests/               # API tests
│   └── .env.example
└── frontend/
    ├── src/
    │   ├── api/             # axios instance
    │   ├── components/       # Navbar, Layout, modals, etc.
    │   ├── context/          # auth context
    │   ├── pages/            # Login, Dashboard, Products, NewSale, etc.
    │   └── utils/            # currency/date formatting, print invoice
    └── .env.example
```

---

## Prerequisites

- **Node.js** (v18 or newer)
- A **MongoDB Atlas** account (or a local MongoDB instance) and its connection string

---

## Getting Started

### 1. Clone the repository

```bash
git clone https://github.com/nethmipalliyaguruge/POS-web-application.git
cd pos-web-application
```

### 2. Backend setup

```bash
cd backend
npm install
```

Create a `.env` file (copy the example and fill in your values):

```bash
cp .env.example .env
```

| Variable         | Description                             | Example                        |
| ---------------- | --------------------------------------- | ------------------------------ |
| `MONGO_URI`      | MongoDB Atlas connection string          | `mongodb+srv://user:pass@...`  |
| `JWT_SECRET`     | Secret used to sign JWTs                  | *(a long random string)*       |
| `JWT_EXPIRES_IN` | How long a login token stays valid        | `7d`                           |
| `PORT`           | Port the API runs on                      | `5000`                         |

> **Tip:** generate a strong `JWT_SECRET` with:
> ```bash
> node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"
> ```

Seed the default users, then start the server:

```bash
npm run seed   # creates the default admin + cashier accounts
npm run dev    # starts the API on http://localhost:5000
```

### 3. Frontend setup

Open a **new terminal**:

```bash
cd frontend
npm install
```

Create a `.env` file:

```bash
cp .env.example .env
```

| Variable       | Description                | Example                        |
| -------------- | -------------------------- | ------------------------------ |
| `VITE_API_URL` | Base URL of the backend API | `http://localhost:5000/api`    |

Start the dev server:

```bash
npm run dev    # starts the app on http://localhost:5173
```

Open **http://localhost:5173** in your browser.

---

## Default Login Credentials

After running `npm run seed`, you can log in with:

| Role    | Email             | Password     |
| ------- | ----------------- | ------------ |
| Admin   | `admin@pos.com`   | `admin123`   |
| Cashier | `cashier@pos.com` | `cashier123` |

> There is no public sign-up — accounts are created by seeding or by an admin
> via the User Management page.

---

## Available Scripts

**Backend** (`cd backend`)

| Command           | What it does                                   |
| ----------------- | ---------------------------------------------- |
| `npm run dev`     | Start the API with auto-reload (nodemon)       |
| `npm start`       | Start the API (production style)               |
| `npm run seed`    | Create the default admin + cashier accounts    |
| `npm test`        | Run the API tests once                         |
| `npm run test:watch` | Run the tests in watch mode                 |

**Frontend** (`cd frontend`)

| Command         | What it does                     |
| --------------- | -------------------------------- |
| `npm run dev`   | Start the Vite dev server        |
| `npm run build` | Build for production             |
| `npm run lint`  | Run ESLint                       |

---

## Running Tests

The backend includes API tests covering the core business rules (auth
validation and the sale engine: stock checks, overselling, duplicate-line
handling, discount limits). They run against an in-memory MongoDB, so they
don't touch your real database.

```bash
cd backend
npm test
```

> The first run downloads a small in-memory MongoDB binary, so it may take a
> little longer than usual.

---

## API Endpoints

All endpoints are prefixed with `/api`. Protected routes require an
`Authorization: Bearer <token>` header.

| Method | Endpoint                   | Access        | Description                                  |
| ------ | -------------------------- | ------------- | -------------------------------------------- |
| POST   | `/auth/login`              | Public        | Log in, returns a token + user               |
| GET    | `/auth/me`                 | Logged-in     | Get the current user                         |
| GET    | `/products`                | Logged-in     | List products (search, category, pagination) |
| GET    | `/products/categories`     | Logged-in     | List distinct categories                     |
| GET    | `/products/:id`            | Logged-in     | Get one product                              |
| POST   | `/products`                | Admin         | Create a product                             |
| PUT    | `/products/:id`            | Admin         | Update a product                             |
| DELETE | `/products/:id`            | Admin         | Delete a product                             |
| POST   | `/sales`                   | Logged-in     | Create a sale (validates + decrements stock) |
| GET    | `/sales`                   | Logged-in     | List sales (cashier: own only; admin: all)   |
| GET    | `/sales/:id`               | Logged-in     | Get one sale's details                       |
| GET    | `/dashboard/summary`       | Admin         | Sales totals + low-stock list                |
| GET    | `/users`                   | Admin         | List staff accounts                          |
| POST   | `/users`                   | Admin         | Create a staff account                       |
| DELETE | `/users/:id`               | Admin         | Delete a staff account (not yourself)        |

---

## Assumptions & Limitations

This project is scoped as a single-store demo. The following were deliberate
simplicity choices; a production system would harden them:

- **No database transactions.** Stock decrement and sale creation are separate
  writes, so a crash mid-operation (or truly concurrent sales of the same
  product) could race. Fine for a single-cashier demo.
- **Invoice numbers** are generated from a document count (`INV-00001`,
  `INV-00002`, …), which is not collision-safe under heavy concurrent sales.
- **CORS is open** to all origins for local development convenience.
- **Low-stock** on the dashboard only counts **active** products (retired
  products are intentionally hidden), a small deviation from a literal
  "stock < 5" across all products.
- **Invoice printing** uses the browser's print dialog (which also supports
  "Save as PDF"). A real POS with thermal receipt printers would use an ESC/POS
  print agent (e.g. QZ Tray) or a PDF library like jsPDF — kept dependency-free
  here as an appropriate scope choice.
- **Automated tests** cover the backend API; the frontend is tested manually.

---
