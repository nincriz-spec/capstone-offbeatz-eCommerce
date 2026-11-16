# OFFBEATZ: Streetwear and Custom Team Uniforms

## 1. Project name and summary

**OFFBEATZ** is an online shop for a streetwear brand that also makes custom team uniforms. The slogan is "Built Different".

**Live site:** https://offbeatz-shop.onrender.com
(The site runs on Render's free plan. If nobody has used it for a while, the first load can take about 50 seconds while the server wakes up.)

**Business context.** OFFBEATZ is a small brand started by two friends. Its customers want to see the clothes, choose a size and color, and order without messaging the shop. The owners need one place to see orders, change their status and manage products.

**Goals**
- Let customers browse and filter products, keep a shopping bag, register, and order.
- Let the shop admin manage orders, users and products from a separate dashboard.
- Let customers ask questions about the shop (shipping, sizes, uniforms) and get answers taken from the shop's own documents (AI assistant).
- Give the admin an AI assistant (an n8n agent) that answers questions about the live orders and the stock.

Built for the ROCKET Academy capstone project.

## 2. UX/UI

### User stories and acceptance criteria

| # | Story | Acceptance criteria |
|---|---|---|
| 1 | As a customer, I want to filter products, so I can find what I like quickly | The shop page filters by search text, price range, fit, gender and category. The list updates and shows "no products" when nothing matches |
| 2 | As a customer, I want to pick a color and size, so I order the right item | The product page shows the colors and sizes, the stock of the chosen variant, and "Sold out" when it is 0. The Add to bag button is disabled when sold out |
| 3 | As a customer, I want my bag to be kept, so I do not lose it when I refresh | The bag is still there after a page refresh, and shows the line totals and the total |
| 4 | As a customer, I want to register and log in, so I can order | A wrong email or password shows one clear message. After login the menu shows My account and Log out |
| 5 | As a customer, I want to order with a saved or a new address | At checkout I can choose a saved address or enter a new one. After the order I see "Your purchase is confirmed." |
| 6 | As a customer, I want to see and cancel my orders | My account shows my orders with status, items and total. I can filter by status, text and date. A pending order has a Cancel button |
| 7 | As a customer, I want to ask the shop assistant a question | The chat answers using the shop documents and says it does not know when the answer is not there |
| 8 | As an admin, I want to manage orders and products | The dashboard needs an admin login. I can filter orders, change a status (only allowed steps), see the audit trail, list users, and add or edit products |
| 9 | As an admin, I want to ask an AI assistant about orders and stock, so I save time | In the n8n chat I can ask "Which orders are pending?" or "Which items are low in stock?" and the answer uses the live shop data. The assistant can only read data, it cannot change anything |

### Wireframes and screens

The live site is the mock-up. Layout of each screen:

| Screen | Layout |
|---|---|
| Home | Header (logo, Shop, Drop, Story, Contact, My account, Bag). A big hero picture with a "Shop the drop" button. A grid of category cards. The latest 4 products. Our story. Contact. Footer |
| Shop | Filter bar on top (search, price, fit, gender, category). A grid of product cards below |
| Product | Large picture on the left. On the right: name, price, color buttons, size buttons, stock message, Add to bag |
| Bag and Checkout | The bag lists the items with quantity buttons and the total. Checkout has the address form on the left and the order summary on the right |
| My account | A side menu (Profile, My orders, Addresses) and the content on the right. Orders have status tabs, a search box and a date range |
| Admin dashboard | A top menu (Orders, Audit, Users, Products, Log out) and a table or form below. Every form that changes data has a hidden CSRF token |

### The Five Planes of UI/UX

| Plane | OFFBEATZ |
|---|---|
| **Strategy** | Why: sell streetwear and custom uniforms online, and give the owners one place to run the shop. Users: young customers and teams who want uniforms |
| **Scope** | What it must do: browse and filter, bag, accounts, checkout, order history, admin order and product management, a shop assistant for customers and an AI assistant for the admin |
| **Structure** | How it is organized: Home leads to Shop, then Product, then Bag, then Checkout. My account holds profile, orders and addresses. The admin has a separate dashboard behind a login |
| **Skeleton** | The layout of each screen: the same header and footer, clear buttons for the main actions, filters above the product grid, form errors shown under the form, short messages for success and errors |
| **Surface** | The look: a dark background with orange accents, bold uppercase headings, large campaign photos, and the OFFBEATZ logo in italic. The layout adapts to mobile, tablet and desktop |

## 3. Features

**Customer shop (React)**
- Home page, shop page with filters (search, price, fit, gender, category), product page with color and size choices and live stock
- Shopping bag that is kept when the page is refreshed
- Register and log in, with automatic token refresh and log out
- Checkout with saved or new addresses, order history with filters, cancel a pending order
- Profile and address management
- AI shop assistant (chat, with the last few messages as memory)

**Admin dashboard (server-side pages, at `/dashboard`)**
- Log in with a session (CSRF protection and a limit on login attempts)
- Orders: filter and change the status (pending, paid, shipped, delivered, cancelled). The admin marks an order as paid here
- Audit trail of every status change
- Users list with search and role filter
- Products: add, edit, show or hide, and upload a PDF for the AI assistant

**Admin AI assistant (n8n, runs separately from the dashboard)**
- The admin asks questions in a chat, such as "Which orders are pending?", "What should I ship today?" or "Which items are low in stock?"
- The answers come from the live orders and products of the shop
- It remembers the last few messages of the chat
- It is read-only: it can look at orders and products but cannot change them

### Algorithms and techniques used

| What | How it works |
|---|---|
| Password safety | Passwords are hashed with bcrypt (10 rounds). A login error never says which part was wrong |
| Login tokens | A short access token (15 minutes) and a refresh token (7 days). On logout both go on a blacklist table. The browser repeats a failed request once after a refresh |
| Order in one step | An order is one database transaction. The stock is subtracted with `stock_qty >= ?`, so two customers cannot buy the last item. Any error undoes the whole order |
| Real prices | The server reads the price and stock from the database. It never trusts a price sent by the browser |
| Filters | Incoming filters are checked against a whitelist, and all SQL uses `?` placeholders |
| Status rules | An order can only move to the allowed next status (for example, a cancelled order cannot move again) |
| AI assistant (RAG) | A PDF is cut into pieces of about 1000 characters with 200 overlap. Each piece is turned into numbers with Gemini embeddings and stored. A question is turned into numbers too, and the 5 closest pieces by cosine distance are sent to Gemini with the instruction to answer only from them |
| Admin AI assistant (n8n agent) | A workflow in n8n. A chat message goes to a Login step that gets an admin token from the shop. Then a Gemini agent with two read-only tools (`get_orders` and `get_products`) calls the shop's own API with that token and writes the answer. The shop checks the token and the admin role, like for the dashboard |

### Known limitations and bugs
- Render's free plan sleeps when idle (about 50 seconds to wake up).
- The admin AI assistant runs in n8n on a computer, it is not hosted online. It is read-only. Its first question can fail while Render wakes up. Each question logs in once, and the login limit is 10 per 15 minutes, so only about 10 questions fit in 15 minutes.
- Admin sessions are kept in memory, so the admin must log in again after a restart.
- Uploaded PDF files and `logs/app.log` are stored on the server's disk and are lost on a restart. The text pieces used by the AI stay in the database.
- TiDB Cloud has no vector index here, so the AI search compares all pieces (fine for a small shop).
- Products can be hidden but not deleted.
- There is no forgot-password feature.

### Pending features
- Wishlist, discount codes and invoice PDFs.

## 4. Use cases

| Name | Objective | Steps |
|---|---|---|
| Buy an item | A customer orders a product | 1. Open the shop and filter. 2. Open a product and choose color and size. 3. Add to bag. 4. Open the bag, then Checkout. 5. Log in if asked. 6. Choose or enter an address. 7. Place the order |
| Track and cancel an order | A customer checks an order | 1. Log in. 2. Open My account, then My orders. 3. Filter by status, text or date. 4. Cancel a pending order |
| Ask the assistant | A customer gets an answer about the shop | 1. Open the chat. 2. Type a question. 3. Read the answer. 4. Ask a short follow-up |
| Ask the admin assistant | The admin gets a quick answer about orders or stock | 1. Open the shop site so it is awake. 2. Start n8n (`npx n8n`) and open the workflow. 3. Type a question, for example "Which orders are pending?". 4. Read the answer |
| Process an order | The admin moves an order forward | 1. Open `/dashboard/login` and log in. 2. Open Orders and filter. 3. Change the status. 4. Check the change in Audit |
| Add a product | The admin adds a product | 1. Log in to the dashboard. 2. Open Products, then New. 3. Fill the form and save. 4. Check it in the shop |

## 5. Technologies used

| Part | What is used |
|---|---|
| Languages | JavaScript (Node.js 20 and React), SQL, HTML (EJS templates), CSS |
| Frontend | React 19, Vite, Wouter (routes), Jotai (shared state), axios, Formik and Yup |
| Backend | Express 5, in layers: routes, controller, services, data. `mysql2`, `bcrypt`, `jsonwebtoken`, `express-session`, `express-rate-limit`, `express-fileupload`, `ejs`, `pdf-parse`, `cors`, `dotenv` |
| Database | MariaDB locally, TiDB Cloud when deployed |
| AI | Google Gemini (`@google/genai`): the `gemini-2.5-flash` model by default and `gemini-embedding-001` for embeddings. The admin assistant also uses a Gemini chat model |
| AI agent | n8n (workflow tool, run on a computer with `npx n8n`): a chat trigger, an HTTP Request login step, an AI Agent node with a Gemini chat model, simple memory and two HTTP Request tools |
| Logging | `server/logger.js` writes to the console and to `server/logs/app.log` |
| Tests | Jest |
| Tools | GitHub, GitHub Codespaces, Render, TiDB Cloud, n8n, oxlint |

**Repository:** https://github.com/nincriz-spec/capstone-offbeatz-eCommerce

### Project structure

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

## 6. Testing

### Automatic tests (Jest)

Unit tests use Jest. The data layer is replaced with fake functions, so the rules in the services are tested without a database.

```
cd server
npm test
npm run test:coverage
```

20 tests pass in 2 files: `productService` (filters and result) and `orderService` (cart, address, quantity, real price, stock). Both files have 100% statement, branch, function and line coverage. The n8n assistant is tested by hand (tests 16 to 18).

### Manual test cases

| # | Test | Steps | Expected result | Result |
|---|---|---|---|---|
| 1 | Filter products | Shop page: type "tee" in the search | Only matching products show | Pass |
| 2 | Stock message | Open a product and pick a size | The stock of that size shows. "Sold out" disables Add to bag | Pass |
| 3 | Bag is kept | Add an item, refresh the page | The bag still has the item | Pass |
| 4 | Register with a short password | Register with 5 characters | An error says at least 8 characters | Pass |
| 5 | Wrong login | Log in to the shop with a wrong password | "Invalid email or password" | Pass |
| 6 | Place an order | Log in, add an item, Checkout, Place order | "Thank you for shopping / Your purchase is confirmed." and the bag is empty | Pass |
| 7 | Order with no address | Leave a field empty and place the order | "Please fill in every field." | Pass |
| 8 | Order history | My account, My orders | The new order shows with status pending | Pass |
| 9 | Cancel an order | Cancel a pending order | The status changes to cancelled | Pass |
| 10 | Admin login | Open `/dashboard/login` with an admin account | The dashboard opens | Pass |
| 11 | Customer cannot enter the admin | Log in to the dashboard with a customer account | "This account is not an admin" | Pass |
| 12 | Change a status | Dashboard, Orders, change a status | The status changes and the Audit page shows it | Pass |
| 13 | Dashboard pages | Click Orders, Audit, Users, Products | Each page loads with the menu | Pass |
| 14 | AI assistant | Ask about shipping or sizes | An answer from the shop documents | Pass |
| 15 | Console check | Open the browser console while using the shop | No red errors | Pass |
| 16 | Admin AI: pending orders | Start n8n and ask "Which orders are pending?" | A short answer that lists the real pending orders of the shop | Pass |
| 17 | Admin AI: low stock | Ask "Which items are low in stock?" | A short answer that lists products with stock of 5 or less | Pass |
| 18 | Admin AI: what to ship | Ask "What should I ship today?" | An answer based on the real orders | Pass |

Unhandled exceptions and console errors are treated as failed tests. The server also writes every request and every error to `server/logs/app.log`.

## 7. Deployment

- **Hosting:** Render (a web service, free plan). **Database:** TiDB Cloud.
- **Build command:** `npm install --include=dev && npm run build:render` (installs the packages, then installs the server packages and builds the React app into `dist`)
- **Start command:** `npm start` (Express serves the API, the dashboard and the built React app on one address)
- Every push to `main` deploys automatically.
- The database tables are created in TiDB Cloud with `server/schema.tidb.sql` and `server/data.tidb.sql`, one statement at a time in the SQL Editor.

### Run it on your computer

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
6. Open the address shown by Vite. The admin dashboard is at `/dashboard/login`.

An admin is a user whose role is `admin` in the `customer` table. Create or change it with SQL. No admin password is stored in this repository.

### Run the admin AI assistant (n8n)

n8n is not part of the Render deployment. It runs on the owner's computer and calls the live shop over the internet.

1. Open the shop site in a browser so Render is awake.
2. In a terminal run `npx n8n` and keep the window open. Open http://localhost:5678.
3. The workflow "Offbeatz Op Assistant" has this chain: **When chat message received**, then **Login** (an HTTP Request that logs in to the shop as admin), then **Op Assistant** (an AI Agent). The agent has a **Google Gemini Chat Model**, **Simple Memory** and two tools: **get_orders** (`GET /api/admin/orders`, sends the token in the `Authorization` header) and **get_products** (`GET /api/products`).
4. The Gemini key is saved as an n8n credential. The admin login is typed inside the Login node. Neither is in this repository.
5. Type a question in the chat and read the answer.

### Environment variables

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

### Security notes
- Secrets live only in `.env` and in Render's settings. `.env` and `sql.sh` are in `.gitignore`.
- The dashboard uses a session cookie (`httpOnly`, `sameSite`, `secure` in production), a CSRF token on every form that changes data, and a limit of 10 login tries in 15 minutes. The shop login has the same limit.
- The Gemini key and the admin login of the n8n assistant live only inside n8n on the owner's computer. An exported n8n workflow would contain the admin login, so it is never committed.
- The AI assistants only read data. The admin assistant gets its data through the same protected API routes as the dashboard.

## 8. Credits

- **Libraries:** React, Vite, Wouter, Jotai, axios, Formik, Yup, Express, mysql2, bcrypt, jsonwebtoken, express-session, express-rate-limit, express-fileupload, EJS, pdf-parse, cors, dotenv, Jest, oxlint. Each one is used under its own open-source licence.
- **AI:** Google Gemini API (answers and embeddings).
- **Automation:** n8n, used to build the admin AI assistant.
- **Services:** Render (hosting) and TiDB Cloud (database).
- **Images:** All product, campaign and category photos belong to OFFBEATZ and were taken by me.
- **Learning material:** Notes and lessons from ROCKET Academy.