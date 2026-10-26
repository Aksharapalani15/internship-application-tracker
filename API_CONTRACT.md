# API Contract: Internship Application Tracker Backend

This document specifies the exact API contract, data models, security configurations, and operational capabilities for the Node.js + Express backend located in `server/`.

---

## 1. Local Server Configuration & Base URL

- **Protocol & Host:** `http://localhost`
- **Port:** `5000` (configurable via `PORT` environment variable, defaults to `5000`)
- **Base URL:** `http://localhost:5000`
- **API Prefix:** `http://localhost:5000/api`
- **Liveness / Health Check:** `http://localhost:5000/health`
- **Allowed Frontend Origin (`CLIENT_ORIGIN`):** `http://localhost:5173` (Vite default)

> **Note on root `app.js`:** The root directory contains a standalone legacy `app.js` (listening on port 3000), but `package.json` scripts (`start`, `dev`, `test`, `seed`) strictly execute the Express server inside `server/src/server.js` on port 5000.

---

## 2. Authentication, CORS, Validation & Error Handling

### Authentication Architecture
- **Mechanism:** JWT (JSON Web Token) signed with HMAC SHA-256 (`HS256`).
- **Token Delivery (Primary):** Stored in a secure HTTP-only cookie named `internship_token` (configurable via `COOKIE_NAME`).
  - Cookie attributes in development: `httpOnly: true`, `secure: false`, `sameSite: "lax"`, `path: "/"`, `maxAge: 86400000` (24h).
  - Cookie attributes in production: `httpOnly: true`, `secure: true`, `sameSite: "none"`, `path: "/"`.
- **Token Delivery (Fallback):** HTTP header `Authorization: Bearer <token>` is supported for tools like curl, Postman, or mobile clients.
- **Session Verification:** On every authenticated request, the `authenticate` middleware re-queries MySQL (`SELECT id, name, email FROM users WHERE id = ? LIMIT 1`) to ensure the user exists and is active.
- **Identity Injection:** Injected into `req.user` as `{ id: number, name: string, email: string }`.
- **Rate Limiting:** Auth routes (`/api/auth/register` and `/api/auth/login`) are rate-limited to 20 requests per 15-minute window per IP (bypassed in `test` environment).

### CORS Configuration
- Configured via `cors` in `server/src/app.js`:
  - **Allowed Origins:** Matches `process.env.CLIENT_ORIGIN` (defaults to `http://localhost:5173`). Requests with no origin header (curl, Postman, mobile) are also allowed.
  - **Credentials:** `credentials: true` (permits browser cookie passing).
  - **Allowed Methods:** `GET`, `POST`, `PUT`, `DELETE`, `OPTIONS` (**Note: `PATCH` is NOT enabled**).
  - **Allowed Headers:** `Content-Type`, `Authorization`.

### Input Validation
- Built with **Zod** (`server/src/validators/`).
- Validated via middleware `validate(schema, "body" | "query" | "params")`.
- Incoming payloads are sanitized, trimmed, type-coerced, and stripped of unvalidated fields before reaching controllers.
- Invalid requests return HTTP `400 Bad Request` with structured error items: `[{ field, message }]`.

### Global Error Handling
- Handled by `server/src/middleware/errorHandler.js`.
- **Consistent Failure Envelope:**
  ```json
  {
    "success": false,
    "message": "Error description message",
    "errors": []
  }
  ```
- **Error Status Mapping:**
  - `400 Bad Request`: Zod validation failures, malformed JSON bodies, foreign key constraints (`ER_NO_REFERENCED_ROW_2`).
  - `401 Unauthorized`: Missing or expired JWT token (`JsonWebTokenError`, `TokenExpiredError`), invalid login credentials.
  - `404 Not Found`: Route not found, resource not found, or cross-tenant resource access (prevents ID enumeration).
  - `409 Conflict`: Unique constraint violation (`ER_DUP_ENTRY`), such as registering an existing email.
  - `503 Service Unavailable`: MySQL connection failures (`ECONNREFUSED`, `PROTOCOL_CONNECTION_LOST`, `ER_ACCESS_DENIED_ERROR`).
  - `500 Internal Server Error`: Unhandled operational errors (stack traces hidden in production).

---

## 3. Data Model: Internship Application (`applications` table)

| Field Name | DB Type | TypeScript / JS Type | Nullable | Default | Description / Constraints |
|---|---|---|---|---|---|
| `id` | `BIGINT UNSIGNED` | `number` | No | Auto-increment | Primary Key |
| `user_id` | `BIGINT UNSIGNED` | `number` | No | - | Foreign Key -> `users(id)` ON DELETE CASCADE |
| `company_name` | `VARCHAR(150)` | `string` | No | - | Company name (1 - 150 chars, required) |
| `role` | `VARCHAR(150)` | `string` | No | - | Position / Role title (1 - 150 chars, required) |
| `description` | `TEXT` | `string \| null` | Yes | `null` | Role description or notes (max 5000 chars) |
| `company_website` | `VARCHAR(255)` | `string \| null` | Yes | `null` | Valid URL (max 255 chars) |
| `application_url` | `VARCHAR(255)` | `string \| null` | Yes | `null` | Job portal / listing URL (max 255 chars) |
| `location` | `VARCHAR(150)` | `string \| null` | Yes | `null` | City / Office location (max 150 chars) |
| `work_mode` | `ENUM` | `"Remote" \| "Hybrid" \| "Onsite"` | No | `"Onsite"` | Allowed: `Remote`, `Hybrid`, `Onsite` |
| `internship_type` | `VARCHAR(100)` | `string \| null` | Yes | `null` | e.g. "Summer 2025", "Fall Co-op" |
| `stipend_amount` | `DECIMAL(12, 2)` | `number \| null` | Yes | `null` | Non-negative numeric value |
| `stipend_currency` | `VARCHAR(10)` | `string` | No | `"INR"` | Currency ISO code (max 10 chars) |
| `duration` | `VARCHAR(100)` | `string \| null` | Yes | `null` | e.g. "3 months", "6 months" |
| `application_deadline`| `DATE` | `string \| null` | Yes | `null` | ISO Date format `YYYY-MM-DD` |
| `date_applied` | `DATE` | `string \| null` | Yes | `null` | ISO Date format `YYYY-MM-DD` |
| `status` | `ENUM` | `"Saved" \| "Applied" \| "Assessment" \| "Interview" \| "Offer" \| "Rejected" \| "Withdrawn"` | No | `"Applied"` | Current workflow stage |
| `notes` | `TEXT` | `string \| null` | Yes | `null` | Personal application notes (max 5000 chars) |
| `next_action` | `VARCHAR(255)` | `string \| null` | Yes | `null` | Next task (max 255 chars) |
| `follow_up_date` | `DATE` | `string \| null` | Yes | `null` | Follow-up deadline `YYYY-MM-DD` |
| `created_at` | `TIMESTAMP` | `string` | No | `CURRENT_TIMESTAMP` | Record creation timestamp (ISO string) |
| `updated_at` | `TIMESTAMP` | `string` | No | `CURRENT_TIMESTAMP` | Last update timestamp (ISO string) |

---

## 4. Complete API Endpoints Reference

### 4.1 System & Health

#### `GET /health`
- **Description:** Server liveness and environment diagnostic check.
- **Auth Required:** No.
- **Request Parameters:** None.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "status": "healthy",
    "environment": "development",
    "timestamp": "2026-10-26T06:30:00.000Z"
  }
  ```

---

### 4.2 Authentication (`/api/auth`)

#### `POST /api/auth/register`
- **Description:** Registers a new user account, hashes password via bcrypt (12 rounds), sets HTTP-only auth cookie.
- **Auth Required:** No (Rate limited: 20 req/15min).
- **Request Body (JSON):**
  - `name` *(string, required, 2-100 chars)*
  - `email` *(string, required, valid email, max 255 chars)*
  - `password` *(string, required, 8-100 chars, at least 1 uppercase, 1 lowercase, 1 digit)*
  ```json
  {
    "name": "Alex Chen",
    "email": "alex@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (201 Created):** Sets cookie `internship_token`.
  ```json
  {
    "success": true,
    "message": "Account created successfully",
    "data": {
      "user": {
        "id": 1,
        "name": "Alex Chen",
        "email": "alex@example.com",
        "created_at": "2026-10-26T06:30:00.000Z"
      }
    }
  }
  ```
- **Error Responses:** `400 Bad Request` (validation failed), `409 Conflict` (email already exists).

#### `POST /api/auth/login`
- **Description:** Verifies credentials and sets HTTP-only auth cookie.
- **Auth Required:** No (Rate limited: 20 req/15min).
- **Request Body (JSON):**
  - `email` *(string, required, valid email)*
  - `password` *(string, required)*
  ```json
  {
    "email": "alex@example.com",
    "password": "Password123!"
  }
  ```
- **Success Response (200 OK):** Sets cookie `internship_token`.
  ```json
  {
    "success": true,
    "message": "Logged in successfully",
    "data": {
      "user": {
        "id": 1,
        "name": "Alex Chen",
        "email": "alex@example.com",
        "created_at": "2026-10-26T06:30:00.000Z"
      }
    }
  }
  ```
- **Error Responses:** `401 Unauthorized` ("Invalid email or password").

#### `POST /api/auth/logout`
- **Description:** Clears the `internship_token` HTTP-only cookie.
- **Auth Required:** No.
- **Request Body:** None.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Logged out successfully"
  }
  ```

#### `GET /api/auth/me`
- **Description:** Returns the profile of the currently authenticated user from the active session.
- **Auth Required:** Yes (`internship_token` cookie or Bearer token).
- **Request Body:** None.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "user": {
        "id": 1,
        "name": "Alex Chen",
        "email": "alex@example.com",
        "created_at": "2026-10-26T06:30:00.000Z"
      }
    }
  }
  ```
- **Error Responses:** `401 Unauthorized`.

---

### 4.3 Internship Applications (`/api/applications`)

All routes require authentication.

#### `GET /api/applications`
- **Description:** Lists user's internship applications with full-text search, multi-field filtering, sorting, and pagination.
- **Auth Required:** Yes.
- **Query Parameters (All optional):**
  | Parameter | Type | Default | Constraints & Description |
  |---|---|---|---|
  | `search` | `string` | - | Case-insensitive substring match against `company_name` OR `role` |
  | `status` | `string` | - | One of: `Saved`, `Applied`, `Assessment`, `Interview`, `Offer`, `Rejected`, `Withdrawn` |
  | `work_mode` | `string` | - | One of: `Remote`, `Hybrid`, `Onsite` |
  | `internship_type` | `string` | - | Max 100 chars (e.g. `Summer 2025`) |
  | `startDate` | `string` | - | Format `YYYY-MM-DD`. Filters `date_applied >= startDate` |
  | `endDate` | `string` | - | Format `YYYY-MM-DD`. Filters `date_applied <= endDate`. Must be `>= startDate` |
  | `sortBy` | `string` | `"created_at"` | Allowlisted: `date_applied`, `application_deadline`, `company_name`, `status`, `created_at` |
  | `order` | `string` | `"DESC"` | `"ASC"` or `"DESC"` (case-insensitive in input) |
  | `page` | `number` | `1` | Positive integer (min: 1) |
  | `limit` | `number` | `10` | Positive integer (min: 1, max: 100) |
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
        "created_at": "2026-10-26T06:30:00.000Z",
        "updated_at": "2026-10-26T06:30:00.000Z"
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

#### `GET /api/applications/export`
- **Description:** Streams a CSV file containing all application records of the authenticated user. Includes protection against spreadsheet formula injection (CWE-1236).
- **Auth Required:** Yes.
- **Route Position:** Defined before `/:id` to avoid parameter conflicts.
- **Headers Returned:**
  - `Content-Type: text/csv; charset=utf-8`
  - `Content-Disposition: attachment; filename="internship-applications.csv"`
- **Response Body:** Formatted CSV text stream.

#### `GET /api/applications/:id`
- **Description:** Retrieves full details for a single internship application.
- **Auth Required:** Yes.
- **Route Parameters:**
  - `id` *(number, required, positive integer)*
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "application": {
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
        "created_at": "2026-10-26T06:30:00.000Z",
        "updated_at": "2026-10-26T06:30:00.000Z"
      }
    }
  }
  ```
- **Error Responses:** `404 Not Found` (if ID does not exist OR belongs to another user).

#### `POST /api/applications`
- **Description:** Creates a new application record owned by the authenticated user.
- **Auth Required:** Yes.
- **Request Body Fields:**
  - **Required:**
    - `company_name`: `string` (1 - 150 chars, non-blank)
    - `role`: `string` (1 - 150 chars, non-blank)
  - **Optional (Defaults apply if omitted):**
    - `description`: `string \| null` (max 5000 chars)
    - `company_website`: `string \| null` (valid URL, max 255 chars)
    - `application_url`: `string \| null` (valid URL, max 255 chars)
    - `location`: `string \| null` (max 150 chars)
    - `work_mode`: `"Remote" \| "Hybrid" \| "Onsite"` (default: `"Onsite"`)
    - `internship_type`: `string \| null` (max 100 chars)
    - `stipend_amount`: `number \| null` (min: 0)
    - `stipend_currency`: `string` (default: `"INR"`, max 10 chars)
    - `duration`: `string \| null` (max 100 chars)
    - `application_deadline`: `string \| null` (`YYYY-MM-DD`)
    - `date_applied`: `string \| null` (`YYYY-MM-DD`)
    - `status`: `"Saved" \| "Applied" \| "Assessment" \| "Interview" \| "Offer" \| "Rejected" \| "Withdrawn"` (default: `"Applied"`)
    - `notes`: `string \| null` (max 5000 chars)
    - `next_action`: `string \| null` (max 255 chars)
    - `follow_up_date`: `string \| null` (`YYYY-MM-DD`)
- **Example Request:**
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
      "application": {
        "id": 2,
        "user_id": 1,
        "company_name": "Microsoft",
        "role": "Software Development Intern",
        "status": "Assessment",
        ...
      }
    }
  }
  ```
- **Error Responses:** `400 Bad Request` (validation errors).

#### `PUT /api/applications/:id`
- **Description:** Complete update/replacement of an existing application record.
- **Auth Required:** Yes.
- **Route Parameters:**
  - `id` *(number, required, positive integer)*
- **Request Body Fields:**
  - **Identical schema to `POST /api/applications` (`createApplicationSchema`).**
  - `company_name` and `role` are **mandatory**.
  - Any omitted optional fields will be replaced with their schema defaults or set to `null` in MySQL.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Application updated successfully",
    "data": {
      "application": {
        "id": 2,
        "user_id": 1,
        "company_name": "Microsoft",
        "role": "Software Development Intern",
        "status": "Interview",
        ...
      }
    }
  }
  ```
- **Error Responses:** `400 Bad Request`, `404 Not Found` (if non-existent or owned by another user).

#### `DELETE /api/applications/:id`
- **Description:** Permanently deletes an internship application record owned by the authenticated user.
- **Auth Required:** Yes.
- **Route Parameters:**
  - `id` *(number, required, positive integer)*
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "message": "Application deleted successfully"
  }
  ```
- **Error Responses:** `404 Not Found` (if non-existent or owned by another user).

---

### 4.4 Dashboard & Analytics (`/api/dashboard`)

All routes require authentication.

#### `GET /api/dashboard/stats`
- **Description:** Computes real-time aggregate application counts, stage breakdowns, and conversion rates.
- **Auth Required:** Yes.
- **Conversion Calculations:**
  - `interviewConversionRate = ((Interview + Offer) / (Total - Saved)) * 100` (returns 0.0 if submitted = 0)
  - `offerConversionRate = (Offer / (Interview + Offer)) * 100` (returns 0.0 if interviews + offers = 0)
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

#### `GET /api/dashboard/activity`
- **Description:** Monthly application velocity over the preceding 6 calendar months for charting.
- **Auth Required:** Yes.
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

#### `GET /api/dashboard/upcoming-deadlines`
- **Description:** Returns categorized lists of upcoming deadlines, overdue deadlines, upcoming follow-ups, and overdue follow-ups (up to 10 records per category).
- **Auth Required:** Yes.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "upcomingDeadlines": [
        {
          "id": 1,
          "company_name": "Google",
          "role": "Software Engineering Intern - Cloud",
          "status": "Applied",
          "date": "2026-11-15"
        }
      ],
      "overdueDeadlines": [],
      "upcomingFollowUps": [
        {
          "id": 1,
          "company_name": "Google",
          "role": "Software Engineering Intern - Cloud",
          "status": "Interview",
          "next_action": "System design review",
          "date": "2026-10-28"
        }
      ],
      "overdueFollowUps": []
    }
  }
  ```

---

### 4.5 User Profile (`/api/profile`)

All routes require authentication.

#### `GET /api/profile`
- **Description:** Retrieves the account profile of the currently authenticated user.
- **Auth Required:** Yes.
- **Success Response (200 OK):**
  ```json
  {
    "success": true,
    "data": {
      "profile": {
        "id": 1,
        "name": "Alex Chen",
        "email": "alex@example.com",
        "created_at": "2026-10-26T06:30:00.000Z",
        "updated_at": "2026-10-26T06:30:00.000Z"
      }
    }
  }
  ```

#### `PUT /api/profile`
- **Description:** Updates user name and/or email. Verifies email uniqueness across other users.
- **Auth Required:** Yes.
- **Request Body Fields (at least one must be provided):**
  - `name`: `string` (min 2, max 100 chars, optional)
  - `email`: `string` (valid email, max 255 chars, optional)
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
        "created_at": "2026-10-26T06:30:00.000Z",
        "updated_at": "2026-10-26T06:35:00.000Z"
      }
    }
  }
  ```
- **Error Responses:** `400 Bad Request` (neither provided or invalid format), `409 Conflict` (email already taken).

---

## 5. Missing, Incomplete, or Non-Working Endpoints & Limitations

1. **No Dedicated Status Update Endpoint (`PATCH /api/applications/:id/status`):**
   - There is **no `PATCH` route** implemented in the backend.
   - The CORS config also restricts HTTP methods to `GET, POST, PUT, DELETE, OPTIONS`.
   - **How frontend must update status:** The frontend must perform a full `PUT /api/applications/:id`, supplying `company_name`, `role`, and the updated `status`. Omitting mandatory fields triggers a validation failure.
2. **No Partial Update (PATCH) for Applications:**
   - Any modification requires supplying the complete application object via `PUT /api/applications/:id`.
3. **No Bulk / Batch Endpoints:**
   - There are no endpoints for batch status updates, bulk deletions, or batch importing.
4. **No Password Change or Reset Endpoints:**
   - There are no `/api/auth/forgot-password`, `/api/auth/reset-password`, or `/api/profile/password` endpoints.
5. **No File Uploads (Resumes / Attachments):**
   - `multipart/form-data` is not parsed and no storage handler (e.g. Multer, S3) is installed. Applications only store link strings (`application_url`, `company_website`).
6. **No Account Deletion Endpoint:**
   - There is no `DELETE /api/profile` or user deletion route.
7. **Root `app.js` is Legacy / Inactive:**
   - `app.js` at the workspace root is a primitive HTTP stub. The real backend resides entirely inside `server/`.

---

## 6. How to Start the Backend and Test Endpoints

### Step 1: Database Setup (MySQL 8.0+)
Open MySQL Shell / Workbench and run:
```sql
CREATE DATABASE IF NOT EXISTS `internship_tracker`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

CREATE DATABASE IF NOT EXISTS `internship_tracker_test`
  CHARACTER SET utf8mb4 COLLATE utf8mb4_unicode_ci;

-- Optional dedicated user:
CREATE USER IF NOT EXISTS 'internship_app'@'localhost' IDENTIFIED BY 'StrongPassword123!';
GRANT SELECT, INSERT, UPDATE, DELETE ON `internship_tracker`.* TO 'internship_app'@'localhost';
GRANT SELECT, INSERT, UPDATE, DELETE, CREATE, DROP ON `internship_tracker_test`.* TO 'internship_app'@'localhost';
FLUSH PRIVILEGES;
```
Import schema:
```bash
mysql -u internship_app -p internship_tracker < server/database/schema.sql
```

### Step 2: Configure Environment
Copy `server/.env.example` to `server/.env` and verify keys:
```env
NODE_ENV=development
PORT=5000
CLIENT_ORIGIN=http://localhost:5173
DB_HOST=localhost
DB_PORT=3306
DB_NAME=internship_tracker
DB_USER=internship_app
DB_PASSWORD=StrongPassword123!
DB_CONNECTION_LIMIT=10
TEST_DB_NAME=internship_tracker_test
JWT_SECRET=your_secure_64_byte_random_hex_string_here
JWT_EXPIRES_IN=1d
COOKIE_NAME=internship_token
```

### Step 3: Seed Sample Data (Optional)
From project root:
```bash
npm run seed
```
*(Creates users `alex@example.com` and `priya@example.com` with password `Password123!` and sample applications)*

### Step 4: Start the Backend Server
- **Development (with hot reload):**
  ```bash
  npm run dev
  # OR: cd server && npm run dev
  ```
- **Production mode:**
  ```bash
  npm start
  # OR: cd server && npm start
  ```

### Step 5: Test Endpoints
- **Liveness check:**
  ```bash
  curl http://localhost:5000/health
  ```
- **Automated tests (Jest suite):**
  ```bash
  npm test
  # OR: cd server && npm test
  ```
  *(Tests execute against an in-memory SQL mock engine defined in `server/tests/setup.js` and do not require active MySQL)*
- **Manual Postman / curl workflow:**
  1. Login to obtain session cookie:
     ```bash
     curl -i -X POST http://localhost:5000/api/auth/login \
       -H "Content-Type: application/json" \
       -d '{"email":"alex@example.com","password":"Password123!"}'
     ```
  2. Call protected application routes using either the returned cookie (`internship_token=...`) or `Authorization: Bearer <jwt_token>`:
     ```bash
     curl -i http://localhost:5000/api/applications \
       -H "Authorization: Bearer <token>"
     ```
