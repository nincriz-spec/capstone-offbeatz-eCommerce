# OFFBEATZ: Streetwear and Custom Team Uniforms

An online shop for the clothing brand OFFBEATZ. Customers can browse products, filter them, keep a shopping bag, register, log in, place orders and cancel them. There is an AI shop assistant that answers questions from the shop's own PDF documents. Shop admins manage orders, users, products and PDFs from a separate dashboard.

**Live site:** https://offbeatz-shop.onrender.com
(The site runs on Render's free plan. If nobody has used it for a while, the first load can take about 50 seconds while the server wakes up.)

Built for the ROCKET Academy capstone project.

## Features

**Customer shop (React)**
- Home page, shop page with filters (search, price, fit, gender, category), product page with color and size choices and live stock
- Shopping bag that is kept when the page is refreshed
- Register and log in, with automatic token refresh and log out
- Checkout with saved or new addresses, order history with filters, cancel a pending order
- Profile and address management
- AI shop assistant (chat)

**Admin dashboard (server-side pages, at `/dashboard`)**
- Log in with a session (CSRF protection and a limit on login attempts)
- Orders: filter and update the status (pending, paid, shipped, delivered, cancelled)
- Audit trail of every status change
- Users list with search and role filter
- Products list, and upload of a PDF for the AI assistant

## Tech stack

| Part | What is used |
|---|---|
| Frontend | React 19, Vite, Wouter (routes), Jotai (shared state), axios, Formik and Yup |
| Backend | Node.js 20 and Express, in layers: routes, controller, services, data |
| Database | MariaDB locally, TiDB Cloud when deployed (`mysql2`, always with `?` placeholders) |
| Security | bcrypt password hashing, JWT access and refresh tokens, token blacklist on logout, session and CSRF for the dashboard, rate limiting, EJS escaping |
| AI | Google Gemini, with answers based on text chunks from uploaded PDFs (RAG) |
| Logging | `server/logger.js` writes to the console and to `server/logs/app.log` |
| Tests | Jest |
| Hosting | Render (app) and TiDB Cloud (database) |

## Project structure

```
src/                 React app (pages, shared stores, hooks)
server/
  index.js           starts Express and mounts the routers
  routes/            addresses and guards
  controller/        read the request, call one service, send the answer
  services/          the rules (validation, prices, stock, tokens)
  data/              the only place with SQL
  middleware/        authenticate and isAdmin
  views/             EJS pages of the admin dashboard
  test/              Jest tests
  schema.sql         database tables (MariaDB)
  data.sql           sample data (MariaDB)
  schema.tidb.sql    database tables (TiDB Cloud)
  data.tidb.sql      sample data (TiDB Cloud)
```

## Run it on your computer

You need Node.js 20 and a MariaDB or MySQL database. (The `.devcontainer` folder sets up Node and MariaDB for Codespaces.)

1. Install the packages:
   ```
   npm install
   cd server
   npm install
   ```
2. Create the database: run `server/schema.sql` and then `server/data.sql`.
3. Create a file named `.env` inside the `server` folder (see the variables below). **Never commit this file.** It is listed in `.gitignore`.
4. Start the backend (port 3000), in one terminal:
   ```
   cd server
   node index.js
   ```
5. Start the frontend (port 5173), in a second terminal, from the main folder:
   ```
   npm run dev
   ```
   Vite sends `/api` and `/dashboard` requests to the backend.
6. Open the address shown by Vite. The admin dashboard is at `/dashboard/login`.

An admin is a user whose role is `admin` in the `customer` table. Create or change it with SQL. No admin password is stored in this repository.

## Environment variables

These are only the **names**. Their values are secret and are never in this repository.

| Name | What it is for |
|---|---|
| `DB_HOST`, `DB_PORT`, `DB_USER`, `DB_PASSWORD`, `DB_NAME` | database connection |
| `DB_SSL` | `true` for the hosted database (secure connection) |
| `DB_TYPE` | `tidb` when using TiDB Cloud. Not set means MariaDB |
| `JWT_SECRET` | signs the login tokens |
| `SESSION_SECRET` | signs the admin dashboard session |
| `GEMINI_API_KEY` | key for the AI assistant |
| `GEMINI_MODEL` | optional, default is `gemini-2.5-flash` |
| `PORT` | optional, default is 3000 |
| `NODE_ENV` | `production` when deployed |

`node server/generateSecret.js` prints a random value you can use for the two secrets.

## Tests

Unit tests use Jest. The data layer is replaced with fake functions, so the rules in the services are tested without a database.

```
cd server
npm test
npm run test:coverage
```

Tested so far: `productService` (filters and result) and `orderService` (cart, address, quantity, real price, stock). Both have 100% coverage.

## Deployment (Render and TiDB Cloud)

- Build command: `npm install --include=dev && npm run build:render` (installs the packages, then installs the server packages and builds the React app into `dist`)
- Start command: `npm start` (Express serves the API, the dashboard and the built React app on one address)
- The environment variables above are set in Render. The database tables are created in TiDB Cloud with `server/schema.tidb.sql` and `server/data.tidb.sql`, one statement at a time in the SQL Editor.
- Every push to `main` deploys automatically.

## Security notes

- Passwords are hashed with bcrypt. Login errors never say which part was wrong.
- The server reads the real price and stock from the database. It never trusts a price from the browser.
- All SQL uses `?` placeholders, and incoming filters are checked against a whitelist.
- Placing an order is one database transaction. The stock is subtracted with a condition (`stock_qty >= ?`), so two customers cannot buy the last item.
- Secrets live only in `.env` and in Render's settings.

## Known limits

- Render's free plan sleeps when idle (about 50 seconds to wake up).
- Admin sessions are kept in memory, so the admin must log in again after a restart.
- Uploaded PDF files and `logs/app.log` are stored on the server's disk and are lost on a restart. The text chunks used by the AI stay in the database.
- TiDB Cloud has no vector index here, so the AI search compares all chunks (fine for a small shop).
- There is no forgot-password feature, and payment is not connected (checkout only records the order).