# InternTrack Frontend (React + Vite)

A modern, high-aesthetic React web application built for the Internship Application Tracker REST API backend.

---

## Features

- **Cohesive Portfolio-Grade UI Design:**
  - Warm cream and soft ivory backgrounds (`#FAF7F2`)
  - Blush pink and dusty rose surfaces (`#FDF2F0`, `#F6E2DF`)
  - Muted coral-orange and peach action accents (`#E07A5F`, `#F28482`)
  - Deep plum and warm charcoal typography (`#291D26`)
  - Distinctive custom pill badges for all 7 application workflow stages
- **Real Backend Integration:**
  - 100% connected to Express REST API with HTTP-only cookie authentication (`credentials: 'include'`).
  - No dummy/mock fallbacks when errors occur—provides honest, actionable error states.
- **Interactive Dashboard:**
  - Dynamic KPI cards (Total Applications, Active Pipeline, Interviews, Offers).
  - Calculated conversion rates: **Interview Conversion Rate** and **Offer Conversion Rate**.
  - Custom SVG Application Velocity monthly chart.
  - Interactive Action Items widget with tabs for Upcoming Deadlines, Overdue Deadlines, and Follow-ups.
- **Complete Application Management:**
  - Table view and Responsive Grid Card view options.
  - Multi-attribute live search and filtering by status, work mode, and dates.
  - Dynamic allowlisted sorting (`created_at`, `date_applied`, `application_deadline`, `company_name`, `status`).
  - Add & Edit modals with thorough client-side validation and backend error translation.
  - Quick-status changer in both table and cards (automatically performs full `PUT` request with existing fields).
  - Detail drawer/modal showing comprehensive application history, links, and notes.
  - Deletion with confirmation dialog.
  - 1-click CSV Export download with formula injection safety.
- **Account & Profile Management:**
  - View member profile and update full name and email with uniqueness conflict detection.
  - Secure sign-in, registration, and sign-out with demo quick-fill helper.

---

## Getting Started

### 1. Prerequisites
- Node.js (v20+ recommended)
- Backend server running on `http://localhost:5000` (see `../server/README.md`)

### 2. Install Dependencies
```bash
cd client
npm install
```

### 3. Environment Configuration
The frontend connects to the backend at `http://localhost:5000/api` by default. To customize:
```bash
# In client/
cp .env.example .env
```
Ensure `VITE_API_BASE_URL` points to your active backend:
```env
VITE_API_BASE_URL=http://localhost:5000/api
```

### 4. Run Development Server
```bash
npm run dev
```
Open `http://localhost:5173` in your browser.

### 5. Build for Production
```bash
npm run build
```
The optimized production bundle will be generated in `client/dist/`.
