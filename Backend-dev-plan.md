# Backend Development Plan — Daily Action Hub

## 1️⃣ Executive Summary
This project connects an existing React frontend (Daily Action Hub) to a FastAPI backend. The goal is to replace current frontend mock data/contexts with real API integrations backed by MongoDB Atlas.
- **Goal:** Fully functional "Daily Action Hub" where users can sync meetings, extract action items via AI (mocked/heuristic for MVP), and execute them.
- **Constraints:** FastAPI (Python 3.13), MongoDB Atlas (Motor/Pydantic v2), No Docker, Single-branch (`main`), Manual testing per task.
- **Approach:** 4 Sprints to connect Auth, Meetings, and Action Item workflows.

## 2️⃣ In-Scope & Success Criteria
### In-Scope Features
- **Authentication:** Signup, Login, Logout (JWT).
- **Meeting Management:** Sync "Google Calendar" (simulated), Display Daily Dashboard.
- **Action Item Processing:** Extract actions from meeting summaries (heuristic/AI), Edit/Confirm actions.
- **Action Execution:** Send Email, Create Invite, Assign Task (Mock/Simulated external calls).

### Success Criteria
- Frontend `AuthContext`, `MeetingContext`, and components fetch real data from `http://localhost:8000`.
- All "Manual Test Steps" pass in the UI.
- No "dummy data" remains in critical paths (Meeting list, Action Item list).

## 3️⃣ API Design
**Base Path:** `/api/v1`

| Method | Path | Purpose | Request/Response |
| :--- | :--- | :--- | :--- |
| **GET** | `/healthz` | Check API & DB status | Res: `{ status: "ok", db: "connected" }` |
| **POST** | `/auth/signup` | Register user | Req: `{ email, password }` <br> Res: `{ id, email }` |
| **POST** | `/auth/login` | Log in user | Req: `{ email, password }` <br> Res: `{ access_token, token_type }` |
| **POST** | `/meetings/sync` | Sync daily meetings | Res: `{ message, synced_count }` |
| **GET** | `/meetings` | Get today's meetings | Res: `[ { id, title, start_time, ... } ]` |
| **POST** | `/meetings/{id}/process` | Extract actions from summary | Req: `{ summary_text }` <br> Res: `[ { description, type, ... } ]` |
| **GET** | `/action-items` | Get pending actions | Res: `[ { id, description, status, ... } ]` |
| **PATCH** | `/action-items/{id}` | Update action details | Req: `{ description, status, ... }` |
| **POST** | `/action-items/{id}/execute` | Execute action (email/task) | Res: `{ status: "executed" }` |

## 4️⃣ Data Model (MongoDB Atlas)

### `users`
```json
{
  "_id": "ObjectId",
  "email": "sarah@example.com",
  "hashed_password": "...",
  "created_at": "datetime"
}
```

### `meetings`
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "google_event_id": "evt_123",
  "title": "Weekly Sync",
  "start_time": "datetime",
  "is_online": true,
  "summary_link": "http://...",
  "status": "pending" // pending, processed, unrecorded
}
```

### `action_items`
```json
{
  "_id": "ObjectId",
  "user_id": "ObjectId",
  "meeting_id": "ObjectId", // optional
  "description": "Send follow-up email",
  "action_type": "email", // email, invite, task
  "status": "pending" // pending, executed, rejected
}
```

## 5️⃣ Frontend Audit & Feature Map

| Component | Route | Backend Need | Status |
| :--- | :--- | :--- | :--- |
| **Login** | `/login` | `POST /auth/login` | 🟡 Needs connection |
| **Dashboard** | `/` | `GET /meetings`, `GET /action-items` | 🟡 Needs connection |
| **MeetingCard** | `/` | `POST /meetings/sync`, `POST /meetings/{id}/process` | 🟡 Needs connection |
| **ActionItemCard** | `/` | `PATCH /action-items/{id}`, `POST .../execute` | 🟡 Needs connection |

## 6️⃣ Configuration & ENV Vars
- `MONGODB_URI`: Atlas connection string
- `SECRET_KEY`: JWT signing key
- `ALGORITHM`: "HS256"
- `ACCESS_TOKEN_EXPIRE_MINUTES`: 30
- `CORS_ORIGINS`: "http://localhost:5173"

## 7️⃣ Testing Strategy
- **Per Task:** Developer validates endpoint via Swagger (`/docs`), then validates UI flow.
- **Confirmation:** "Manual Test Step" must be performed in the browser.
- **Fixes:** If UI fails, fix Backend logic or adjust Frontend API calls immediately.

---

## 🔟 Dynamic Sprint Plan

## 🧱 S0 – Environment Fixes & Connection

**Objectives:**
- Fix Python import errors in `backend/main.py`.
- Ensure successful connection to MongoDB Atlas.
- Verify `/healthz` works from browser.

**Tasks:**
1. **Fix Imports & Config**
   - Refactor `backend/main.py` imports to work with root-level execution (`uvicorn backend.main:app`).
   - Ensure `config.py` is loaded correctly.
   - **Manual Test:** Run `uvicorn backend.main:app --reload`. Terminal should not show `ModuleNotFoundError`.

2. **Database Connection**
   - Verify `MONGODB_URI` in `.env`.
   - Ensure `backend/database.py` connects using `motor`.
   - **Manual Test:** Access `http://localhost:8000/healthz`. Response: `{"status": "ok", "db": "connected"}`.

3. **CORS Setup**
   - Verify `backend/main.py` allows `http://localhost:5173`.
   - **Manual Test:** Fetch `/healthz` from browser console on port 5173.

**Definition of Done:**
- Backend runs without errors.
- `/healthz` returns 200 OK and DB connected.
- Code pushed to `main`.

---

## 🧩 S1 – Authentication Integration

**Objectives:**
- Connect Frontend Login page to Backend API.
- Secure API routes.

**Tasks:**
1. **Backend Auth Routes**
   - Ensure `POST /auth/signup` and `/auth/login` return correct JWT structure.
   - **Manual Test:** Create user via Swagger UI. Log in via Swagger UI.

2. **Frontend AuthContext Integration**
   - Modify `frontend/src/context/AuthContext.tsx` to call `login` API instead of setting localStorage directly.
   - Store JWT in localStorage upon success.
   - **Manual Test:** Go to `/login`. Enter credentials. Click "Sign in". Should redirect to Dashboard.

3. **Protected Routes**
   - Ensure `GET /meetings` requires `Authorization: Bearer <token>`.
   - **Manual Test:** Try to access `/meetings` in Swagger without lock. Should fail (401).

**Definition of Done:**
- User can log in via UI.
- Token is stored in browser.
- Code pushed to `main`.

---

## 📅 S2 – Meetings & Dashboard Data

**Objectives:**
- Populate "Today's Dashboard" with data from Backend.
- Implement "Sync" functionality.

**Tasks:**
1. **Meeting Sync Endpoint**
   - Review/Enhance `POST /meetings/sync` in `backend/routers/meetings.py`.
   - Ensure it creates dummy data for *today* (so it shows up in UI).
   - **Manual Test:** Call `/meetings/sync` via Swagger. Check DB for new docs.

2. **Frontend Meeting Context**
   - Update `frontend/src/context/MeetingContext.tsx` to `fetch` from `/api/v1/meetings`.
   - Add a "Sync" button or auto-sync on load in Frontend (if missing).
   - **Manual Test:** Refresh Dashboard. Meetings should appear.

3. **Dashboard Display**
   - Ensure `TodayDashboard.tsx` renders the fetched meetings correctly.
   - **Manual Test:** Verify meeting titles/times match what's in DB.

**Definition of Done:**
- Dashboard shows real (simulated) meeting data from DB.
- Code pushed to `main`.

---

## ⚡ S3 – Action Item Workflow

**Objectives:**
- Connect "Process Meeting" and "Action Item" execution flows.

**Tasks:**
1. **Action Extraction API**
   - Verify `POST /meetings/{id}/process` logic in `backend/routers/action_items.py`.
   - Ensure it returns generated actions.
   - **Manual Test:** Send a meeting summary via Swagger. Check response.

2. **Frontend Extraction Hook**
   - In `MeetingCard`, connect the "Process/Generate Actions" button to the API.
   - **Manual Test:** Click "Generate Actions" on a meeting. Action items should appear in the UI.

3. **Action Execution Endpoints**
   - Implement/Verify `POST /action-items/{id}/execute`.
   - Implement `PATCH /action-items/{id}` for edits.
   - **Manual Test:** Edit an action item's text in UI. Save. Reload. Text should persist.

4. **Frontend Execution Integration**
   - Connect "Send Email" / "Create Invite" buttons in `ActionItemCard` to backend.
   - **Manual Test:** Click "Send Email". UI should update status to "Executed". DB status should be "Executed".

**Definition of Done:**
- Full flow: Sync -> View -> Process -> Execute works in UI.
- Code pushed to `main`.

---