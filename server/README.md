# Internship Application Tracker - Backend REST API

A production-minded, secure, and fully tested Node.js + Express + MySQL REST API built for tracking internship applications, interviews, deadlines, and offer statistics. Designed following enterprise-grade backend architecture while remaining clean, maintainable, and pedagogical for Computer Science Engineering students.

---

## Table of Contents
1. [Project Overview](#project-overview)
2. [Key Features](#key-features)
3. [Technology Stack](#technology-stack)
4. [Backend Architecture](#backend-architecture)
5. [Prerequisites](#prerequisites)
6. [Folder Structure](#folder-structure)
7. [Installation & Setup](#installation--setup)
8. [MySQL Database & Least-Privilege User Setup](#mysql-database--least-privilege-user-setup)
9. [Environment Configuration](#environment-configuration)
10. [Running the Server](#running-the-server)
11. [Running Automated Tests](#running-automated-tests)
12. [Code Quality & Linting](#code-quality--linting)
13. [API Documentation](#api-documentation)
14. [Testing with Postman](#testing-with-postman)
15. [Architectural & Security Decisions](#architectural--security-decisions)
16. [Production Deployment Guidance](#production-deployment-guidance)
17. [Frontend Integration Contract](#frontend-integration-contract)

---

## Project Overview

The **Internship Application Tracker Backend** is the core API server for students and job seekers managing their internship pipeline. It provides:
- Secure user authentication using JSON Web Tokens (JWT) stored in HTTP-only, SameSite cookies.
- Complete CRUD operations for internship applications with strict user-level data isolation.
- Fast multi-criteria search, status filtering, date range queries, allowlisted sorting, and pagination.
- High-performance analytics computed directly via SQL aggregation (application counts, stage distributions, and conversion rates).
- Upcoming and overdue deadlines and follow-up alerts.
- Sanitized CSV export protected against Spreadsheet Formula Injection attacks (CWE-1236).

---

## Key Features

- **Strict Data Isolation:** Every query enforces user ownership at the database level (`user_id = ?`). Users can never access, modify, or delete another user's records.
- **SQL Injection Prevention:** 100% parameterized SQL statements with `mysql2/promise`. Dynamic sort columns and order directions are strictly verified against hardcoded allowlists.
- **Robust Validation:** All incoming request bodies, URL query parameters, and route parameters are validated and transformed using **Zod** schemas.
- **Defensive Error Handling:** Centralized Express error handler maps database error codes (e.g. duplicate keys, foreign key violations) into structured JSON responses, never leaking stack traces or internal queries in production.
- **CSV Formula Injection Protection:** Cells starting with formula characters (`=`, `+`, `-`, `@`, `\t`, `\r`) are automatically escaped with a prepended single quote (`'`), preventing malicious execution in Excel or Google Sheets.
- **Automated Testing Suite:** 35 comprehensive end-to-end and integration tests written with Jest and Supertest, verifying authorization boundaries, conversion rate math, and input validation.

---

## Technology Stack

- **Runtime:** Node.js (v20+ LTS recommended, verified on v24)
- **Web Framework:** Express.js (v4.21.x)
- **Database:** MySQL 8.0+ (InnoDB Storage Engine, utf8mb4)
- **Database Driver:** `mysql2/promise` with connection pooling
- **Authentication:** `jsonwebtoken` (HS256) stored in HTTP-only cookies via `cookie-parser`
- **Password Security:** `bcrypt` (12 salt rounds)
- **Validation:** `zod`
- **Security Middlewares:** `helmet`, `cors`, `express-rate-limit`
- **Testing:** `jest`, `supertest`
- **Code Quality:** `eslint` (v9 Flat Config)
- **Module System:** CommonJS (`require` / `module.exports`)

---

## Backend Architecture

The backend strictly follows a layered architectural pattern with clear separation of concerns:

```
Request  ──>  Helmet / CORS / Cookies  ──>  Rate Limiter  ──>  Router
                                                                 │
                                                                 ▼
                                                        Zod Validator Middleware
                                                                 │
                                                                 ▼
                                                      Authentication Middleware
                                                                 │
                                                                 ▼
                                                            Controller (HTTP concerns)
                                                                 │
                                                                 ▼
                                                             Service (Business logic & SQL)
                                                                 │
                                                                 ▼
                                                       MySQL Connection Pool
                                                                 │
                                                                 ▼
Response <──  Uniform JSON / Error Handler  <──  Controller / Service Result
```

- **Routes (`src/routes/`):** Define URI endpoints and connect middlewares.
- **Validators (`src/validators/`):** Zod schemas defining allowed types, lengths, regex formats, and bounds.
- **Middleware (`src/middleware/`):** Handles authentication, schema validation, route-not-found (404), and centralized error formatting.
- **Controllers (`src/controllers/`):** Extract HTTP parameters, invoke services, and structure HTTP responses.
- **Services (`src/services/`):** Execute business logic, compute analytical metrics, and execute parameterized SQL queries.
- **Configuration (`src/config/`):** Connection pool setup, graceful shutdown handlers, and environment validation.
- **Utilities (`src/utils/`):** Reusable helpers for `AppError`, `asyncHandler`, `cookies`, and `csv` generation.

---

## Prerequisites

1. **Node.js:** Version 20.x or newer (`node -v`)
2. **npm:** Version 9.x or newer (`npm -v`)
3. **MySQL Server:** Version 8.0 or newer running locally or on a remote host

---

## Folder Structure

```
server/
├── .env.example              # Documented environment variables template
├── .gitignore                # Excludes node_modules, secrets, and logs from Git
├── eslint.config.js          # Modern ESLint flat configuration
├── package.json              # Project scripts and dependencies
├── package-lock.json         # Pinned dependency tree
├── README.md                 # Complete system documentation
├── database/
│   ├── schema.sql            # MySQL schema with tables, constraints, and indexes
│   └── seed.js               # Development seed script with sample users & applications
├── src/
│   ├── app.js                # Express app setup, middlewares, and routes
│   ├── server.js             # HTTP listener, env validation, and graceful shutdown
│   ├── config/
│   │   └── db.js             # mysql2 connection pool with dateStrings protection
│   ├── controllers/
│   │   ├── authController.js
│   │   ├── applicationController.js
│   │   ├── dashboardController.js
│   │   └── profileController.js
│   ├── middleware/
│   │   ├── authenticate.js   # JWT cookie verification middleware
│   │   ├── validate.js       # Reusable Zod validation middleware
│   │   ├── errorHandler.js   # Centralized error handler
│   │   └── notFound.js       # 404 handler for undefined endpoints
│   ├── routes/
│   │   ├── authRoutes.js
│   │   ├── applicationRoutes.js
│   │   ├── dashboardRoutes.js
│   │   └── profileRoutes.js
│   ├── services/
│   │   ├── authService.js
│   │   ├── applicationService.js
│   │   ├── dashboardService.js
│   │   └── profileService.js
│   ├── utils/
│   │   ├── AppError.js       # Operational error class
│   │   ├── asyncHandler.js   # Higher-order async wrapper
│   │   ├── cookies.js        # Centralized HTTP-only cookie helper
│   │   └── csv.js            # Safe CSV generator with formula injection protection
│   └── validators/
│       ├── authValidators.js
│       ├── applicationValidators.js
│       ├── profileValidators.js
│       └── queryValidators.js
└── tests/
    ├── setup.js              # Test configuration and in-memory test DB
    ├── auth.test.js          # Auth, cookies, and rate-limiting tests
    ├── applications.test.js  # CRUD, filtering, sorting, isolation, and CSV tests
    ├── dashboard.test.js     # Analytics, conversions, and deadlines tests
    └── profile.test.js       # Profile management and duplicate email tests
```

---

## Installation & Setup

1. Open your terminal and navigate to the `server/` directory:
   ```bash
   cd server
   ```

2. Install all required production and development dependencies:
   ```bash
   npm install
   ```

---

## MySQL Database & Least-Privilege User Setup

Never connect your production or development backend using the MySQL `root` administrative superuser. Follow these steps in MySQL Shell or MySQL Workbench:

1. Log in to MySQL as administrator:
   ```bash
   mysql -u root -p
   ```

2. Create the databases for development and testing:
   ```sql
   CREATE DATABASE IF NOT EXISTS `internship_tracker`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

   CREATE DATABASE IF NOT EXISTS `internship_tracker_test`
     CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;
   ```

3. Create a dedicated application user with least-privilege permissions:
   ```sql
   CREATE USER IF NOT EXISTS 'internship_app'@'localhost' IDENTIFIED BY 'StrongAppPasswordHere!2026';

   -- Grant only necessary DML permissions (no DROP or administrative rights)
   GRANT SELECT, INSERT, UPDATE, DELETE ON `internship_tracker`.* TO 'internship_app'@'localhost';
   GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP ON `internship_tracker_test`.* TO 'internship_app'@'localhost';

   FLUSH PRIVILEGES;
   ```

4. Apply the database schema:
   ```bash
   mysql -u internship_app -p internship_tracker < database/schema.sql
   ```

5. (Optional) Populate with realistic seed data:
   ```bash
   npm run seed
   ```
   *Seed script creates two test accounts: `alex@example.com` and `priya@example.com` (password: `Password123!`)*

---

## Environment Configuration

Copy `.env.example` to create your active `.env` file:
```bash
cp .env.example .env
```

Generate a cryptographically secure 64-byte random string for `JWT_SECRET`:
```bash
node -e "console.log(require('crypto').randomBytes(64).toString('hex'))"
```

Configure your `.env` variables:
```env
# Server Environment & Port Configuration
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173

# MySQL Primary Database Configuration
DB_HOST=localhost
DB_PORT=3306
DB_NAME=internship_tracker
DB_USER=internship_app
DB_PASSWORD=StrongAppPasswordHere!2026
DB_CONNECTION_LIMIT=10

# Dedicated Test Database
TEST_DB_NAME=internship_tracker_test

# Authentication & Cookie Configuration
JWT_SECRET=your_generated_64_byte_random_string_here
JWT_EXPIRES_IN=1d
COOKIE_NAME=internship_token
```

---

## Running the Server

- **Development Mode (with auto-reloading via Nodemon):**
  ```bash
  npm run dev
  ```

- **Production Mode:**
  ```bash
  npm start
  ```

- **Health Check Verification:**
  Open `http://localhost:5000/health` in your browser or curl:
  ```bash
  curl http://localhost:5000/health
  ```
  Expected output:
  ```json
  {
    "success": true,
    "status": "healthy",
    "environment": "development",
    "timestamp": "2026-10-25T09:50:00.000Z"
  }
  ```

---

## Running Automated Tests

Run the complete Jest automated test suite:
```bash
npm test
```

Expected output:
```
PASS tests/applications.test.js
PASS tests/profile.test.js
PASS tests/auth.test.js
PASS tests/dashboard.test.js

Test Suites: 4 passed, 4 total
Tests:       35 passed, 35 total
Snapshots:   0 total
Time:        34.329 s
Ran all test suites.
```

To run tests in watch mode during development:
```bash
npm run test:watch
```

---

## Code Quality & Linting

Run ESLint across all codebase files:
```bash
npm run lint
```

Automatically format and fix lint errors:
```bash
npm run lint:fix
```

---

## API Documentation

### Uniform Response Format

**Success Response:**
```json
{
  "success": true,
  "message": "Optional descriptive message",
  "data": {}
}
```

**Failure Response:**
```json
{
  "success": false,
  "message": "Validation failed",
  "errors": [
    { "field": "email", "message": "Please provide a valid email address" }
  ]
}
```

---

### Authentication Endpoints

#### 1. Register User
- **Method:** `POST`
- **URL:** `/api/auth/register`
- **Authentication:** None
- **Rate Limit:** 20 requests per 15 minutes per IP
- **Request Body:**
  ```json
  {
    "name": "Alex Chen",
    "email": "alex@example.com",
    "password": "Password123!"
  }
  ```
- **Validation Rules:**
  - `name`: String, 2-100 characters.
  - `email`: Valid email format, max 255 characters (normalized to lowercase).
  - `password`: Min 8 characters, must contain at least 1 uppercase, 1 lowercase, and 1 digit.
- **Success Response (201 Created):**
  - Sets HTTP-only cookie `internship_token`
  ```json
  {
    "success": true,
    "message": "Account created successfully",
    "data": {
      "user": {
        "id": 1,
        "name": "Alex Chen",
        "email": "alex@example.com",
        "created_at": "2026-10-25T10:00:00.000Z"
      }
    }
  }
  ```
- **Error Responses:**
  - `400 Bad Request`: Validation failure.
  - `409 Conflict`: Email already registered.

#### 2. Login User
- **Method:** `POST`
- **URL:** `/api/auth/login`
- **Authentication:** None
- **Rate Limit:** 20 requests per 15 minutes per IP
- **Request Body:**
  ```json
  {
    "email": "alex@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (200 OK):**
  - Sets HTTP-only cookie `internship_token`
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "user": {
        "id": 1,
        "name": "Alex Chen",
        "email": "alex@example.com",
        "created_at": "2026-10-25T10:00:00.000Z"
      }
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Generic "Invalid email or password" (anti-enumeration).

#### 3. Logout User
- **Method:** `POST`
- **URL:** `/api/auth/logout`
- **Authentication:** None
- **Success Response (200 OK):**
  - Clears `internship_token` cookie
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

#### 4. Get Current User Identity
- **Method:** `GET`
- **URL:** `/api/auth/me`
- **Authentication:** Required (HTTP-only cookie or Bearer token)
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "name": "Alex Chen",
        "email": "alex@example.com",
        "created_at": "2026-10-25T10:00:00.000Z"
      }
    }
  }
  ```
- **Error Responses:**
  - `401 Unauthorized`: Missing, invalid, or expired session.

---

### Application CRUD Endpoints

#### 1. List Applications (Search, Filter, Sort, Paginate)
- **Method:** `GET`
- **URL:** `/api/applications`
- **Authentication:** Required
- **Query Parameters:**
  | Parameter | Type | Default | Description |
  |---|---|---|---|
  | `search` | String | - | Case-insensitive search on `company_name` and `role` |
  | `status` | Enum | - | `Saved`, `Applied`, `Assessment`, `Interview`, `Offer`, `Rejected`, `Withdrawn` |
  | `work_mode` | Enum | - | `Remote`, `Hybrid`, `Onsite` |
  | `internship_type` | String | - | e.g. `Summer 2025` |
  | `startDate` | YYYY-MM-DD | - | Lower bound for `date_applied` |
  | `endDate` | YYYY-MM-DD | - | Upper bound for `date_applied` (must be >= `startDate`) |
  | `sortBy` | Enum | `created_at` | Allowlisted: `date_applied`, `application_deadline`, `company_name`, `status`, `created_at` |
  | `order` | Enum | `DESC` | `ASC` or `DESC` |
  | `page` | Integer | `1` | Page number (min: 1) |
  | `limit` | Integer | `10` | Records per page (min: 1, max: 100) |
- **Example Request:**
  `GET /api/applications?search=Google&status=Interview&page=1&limit=10&sortBy=date_applied&order=DESC`
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      {
        "id": 1,
        "user_id": 1,
        "company_name": "Google",
        "role": "Software Engineering Intern - Cloud",
        "description": "Backend distributed systems engineering.",
        "company_website": "https://careers.google.com",
        "application_url": "https://careers.google.com/jobs/results/12345",
        "location": "Bengaluru, India",
        "work_mode": "Hybrid",
        "internship_type": "Summer 2025",
        "stipend_amount": 110000,
        "stipend_currency": "INR",
        "duration": "3 months",
        "application_deadline": "2026-11-15",
        "date_applied": "2026-10-10",
        "status": "Interview",
        "notes": "Round 1 technical screening completed.",
        "next_action": "System design review",
        "follow_up_date": "2026-10-28",
        "created_at": "2026-10-25T10:00:00.000Z",
        "updated_at": "2026-10-25T10:00:00.000Z"
      }
    ],
    "pagination": {
      "page": 1,
      "limit": 10,
      "totalRecords": 1,
      "totalPages": 1,
      "hasNextPage": false,
      "hasPrevPage": false
    }
  }
  ```

#### 2. Get Single Application by ID
- **Method:** `GET`
- **URL:** `/api/applications/:id`
- **Authentication:** Required
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "application": { "id": 1, "company_name": "Google", ... }
    }
  }
  ```
- **Error Responses:**
  - `404 Not Found`: If application does not exist OR belongs to another user.

#### 3. Create Application
- **Method:** `POST`
- **URL:** `/api/applications`
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "company_name": "Microsoft",
    "role": "Software Development Intern",
    "description": "Azure Core serverless team",
    "company_website": "https://careers.microsoft.com",
    "location": "Hyderabad, India",
    "work_mode": "Hybrid",
    "internship_type": "Summer 2025",
    "stipend_amount": 95000,
    "stipend_currency": "INR",
    "duration": "2 months",
    "application_deadline": "2026-11-30",
    "date_applied": "2026-10-05",
    "status": "Assessment",
    "notes": "Completed online assessment.",
    "next_action": "Await recruiter email",
    "follow_up_date": "2026-10-30"
  }
  ```
- **Success Response (201 Created):**
  ```json
  {
    "success": true,
    "message": "Application created successfully",
    "data": {
      "application": { "id": 2, ... }
    }
  }
  ```

#### 4. Update Application (Full Update)
- **Method:** `PUT`
- **URL:** `/api/applications/:id`
- **Authentication:** Required
- **Request Body:** Complete updated application object.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Application updated successfully",
    "data": {
      "application": { "id": 2, ... }
    }
  }
  ```
- **Error Responses:**
  - `404 Not Found`: If record does not exist or belongs to another user.

#### 5. Delete Application
- **Method:** `DELETE`
- **URL:** `/api/applications/:id`
- **Authentication:** Required
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Application deleted successfully"
  }
  ```

#### 6. Export Applications (CSV)
- **Method:** `GET`
- **URL:** `/api/applications/export`
- **Authentication:** Required
- **Headers Sent:**
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="internship-applications.csv"`
- **Response Body:** RFC 4180 compliant CSV stream with formula injection escaping.

---

### Dashboard & Analytics Endpoints

#### 1. High-Level Statistics & Conversion Rates
- **Method:** `GET`
- **URL:** `/api/dashboard/stats`
- **Authentication:** Required
- **Conversion Rate Formulas:**
  - **Interview Conversion Rate:** `((Interviews + Offers) / (Total Applications - Saved Drafts)) * 100`
  - **Offer Conversion Rate:** `(Offers / (Interviews + Offers)) * 100`
  - Handles 0 denominators safely (returns `0.0`).
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "totalApplications": 5,
      "statusCounts": {
        "Saved": 1,
        "Applied": 1,
        "Assessment": 1,
        "Interview": 1,
        "Offer": 1,
        "Rejected": 0,
        "Withdrawn": 0
      },
      "interviewCount": 1,
      "offerCount": 1,
      "rejectionCount": 0,
      "conversionRates": {
        "interviewConversionRate": 50.0,
        "offerConversionRate": 50.0
      }
    }
  }
  ```

#### 2. Monthly Application Activity
- **Method:** `GET`
- **URL:** `/api/dashboard/activity`
- **Authentication:** Required
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": [
      { "period": "2026-09", "count": 2 },
      { "period": "2026-10", "count": 3 }
    ]
  }
  ```

#### 3. Upcoming Deadlines & Reminders
- **Method:** `GET`
- **URL:** `/api/dashboard/upcoming-deadlines`
- **Authentication:** Required
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "upcomingDeadlines": [
        { "id": 1, "company_name": "Google", "role": "SWE Intern", "status": "Applied", "date": "2026-11-15" }
      ],
      "overdueDeadlines": [],
      "upcomingFollowUps": [
        { "id": 1, "company_name": "Google", "role": "SWE Intern", "status": "Interview", "next_action": "System design review", "date": "2026-10-28" }
      ],
      "overdueFollowUps": []
    }
  }
  ```

---

### Profile Endpoints

#### 1. View Profile
- **Method:** `GET`
- **URL:** `/api/profile`
- **Authentication:** Required
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "profile": {
        "id": 1,
        "name": "Alex Chen",
        "email": "alex@example.com",
        "created_at": "2026-10-25T10:00:00.000Z",
        "updated_at": "2026-10-25T10:00:00.000Z"
      }
    }
  }
  ```

#### 2. Update Profile
- **Method:** `PUT`
- **URL:** `/api/profile`
- **Authentication:** Required
- **Request Body:**
  ```json
  {
    "name": "Alex C. Chen",
    "email": "alex.chen@example.com"
  }
  ```
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Profile updated successfully",
    "data": {
      "profile": {
        "id": 1,
        "name": "Alex C. Chen",
        "email": "alex.chen@example.com",
        "created_at": "2026-10-25T10:00:00.000Z",
        "updated_at": "2026-10-25T10:05:00.000Z"
      }
    }
  }
  ```
- **Error Responses:**
  - `409 Conflict`: If the new email is already used by another account.

---

## Testing with Postman

Postman supports HTTP-only cookie persistence automatically through its built-in Cookie Jar:

1. **Register or Login:**
   - Send `POST` to `http://localhost:5000/api/auth/login` with email and password in the JSON body.
   - Postman automatically captures the `internship_token` cookie and displays it under the **Cookies** tab (top right below the Send button).
2. **Accessing Protected Routes:**
   - Once logged in, any subsequent request to `GET /api/applications`, `GET /api/dashboard/stats`, or `GET /api/profile` will automatically send the saved cookie.
3. **Alternative Authorization Header:**
   - If running automated Postman test scripts or environments where cookies are disabled, you can also pass the token as a Bearer token:
     `Authorization: Bearer <your_jwt_token>`
4. **Logout:**
   - Send `POST` to `http://localhost:5000/api/auth/logout`. Postman's cookie jar will clear the cookie.

---

## Architectural & Security Decisions

### 1. HTTP-Only Cookies vs LocalStorage
- **Decision:** JWT authentication tokens are stored exclusively in HTTP-only cookies (`httpOnly: true`).
- **Rationale:** Storing tokens in browser `localStorage` or `sessionStorage` exposes them to XSS (Cross-Site Scripting) theft via any malicious third-party script or npm dependency. With `httpOnly: true`, JavaScript running on the page cannot access `document.cookie`, completely insulating authentication tokens from XSS token exfiltration.

### 2. SameSite Policy & CSRF
- **Decision:** In development, cookies use `sameSite: 'lax'`, enabling smooth cross-port communication between Vite on `localhost:5173` and Express on `localhost:5000`. In production, when frontend and backend reside on different origins or cloud providers, `sameSite: 'none'` with `secure: true` (HTTPS) is enforced.
- **CSRF Mitigation:** State-changing requests (`POST`, `PUT`, `DELETE`) require `Content-Type: application/json`. Standard browser HTML forms cannot issue raw JSON payloads cross-origin without triggering a CORS preflight (`OPTIONS`) check, which our strict CORS origin check rejects.

### 3. Date Timezone Shift Prevention (`dateStrings: true`)
- **Gotcha:** In JavaScript, converting MySQL DATE columns (`'2026-10-25'`) into standard JavaScript `Date` objects causes Node.js to apply the local machine's UTC timezone offset. If the server is in GMT+5:30 or UTC-5, formatting dates can inadvertently display as the previous or next day (`'2026-10-24T18:30:00.000Z'`).
- **Solution:** Configured `dateStrings: true` directly in the `mysql2` connection pool (`src/config/db.js`). MySQL returns exact ISO date strings (`YYYY-MM-DD`), guaranteeing zero timezone shifts.

### 4. Spreadsheet Formula Injection (CSV Injection / CWE-1236)
- **Attack Vector:** If a user submits a company name or note such as `=cmd|' /C calc'!A0`, spreadsheet software (Excel, Google Sheets, LibreOffice) interprets the leading character as a formula and executes system commands when opening the CSV.
- **Defense:** In `src/utils/csv.js`, any string cell beginning with `=`, `+`, `-`, `@`, `\t`, or `\r` is automatically prepended with a single quote (`'`), which instructs spreadsheet software to treat the value strictly as literal text.

### 5. Dynamic SQL Allowlisting
- **Defense:** In `src/validators/queryValidators.js` and `src/services/applicationService.js`, the `sortBy` and `order` parameters are validated against explicit, hardcoded arrays:
  - Sort columns: `['date_applied', 'application_deadline', 'company_name', 'status', 'created_at']`
  - Sort orders: `['ASC', 'DESC']`
- Any unexpected string falls back safely to `created_at DESC`, guaranteeing SQL injection is impossible in `ORDER BY` clauses.

---

## Production Deployment Guidance

1. **Enforce HTTPS:**
   Always run behind a reverse proxy (e.g., Nginx, AWS ALB, Cloudflare) that terminates SSL/TLS. Node.js must run with `NODE_ENV=production`, which automatically activates `secure: true` for authentication cookies.
2. **Reverse Proxy & Trust Proxy:**
   If running Express behind Nginx, Kubernetes ingress, or Cloudflare, add `app.set('trust proxy', 1)` in `src/app.js` so that `express-rate-limit` and client IP detection accurately read `X-Forwarded-For`.
3. **Database Permissions:**
   Never grant administrative privileges to the web application. Ensure the MySQL user only possesses `SELECT`, `INSERT`, `UPDATE`, and `DELETE`.
4. **Environment Secrets:**
   Store `JWT_SECRET` and `DB_PASSWORD` in your cloud secret manager (AWS Secrets Manager, GCP Secret Manager, or Railway/Render environment variables). Never commit `.env` to Git.

---

## Frontend Integration Contract

The API is fully optimized for a React + Vite frontend using **Axios** and **React Router**:

```javascript
// src/api/axiosClient.js
import axios from "axios";

export const api = axios.create({
  baseURL: "http://localhost:5000/api",
  withCredentials: true, // REQUIRED: Transmits HTTP-only authentication cookies
  headers: {
    "Content-Type": "application/json",
  },
});
```
