# Google OAuth Integration Plan

## 1. Executive Summary
We will transition the application's authentication from a simple Email/Password mock to a real Google OAuth 2.0 flow. This will serve as the foundation for future Google Calendar and Gmail integrations.

## 2. Architecture

### Frontend (React + Vite)
- **Library:** `@react-oauth/google`
- **Flow:**
    1.  User clicks "Sign in with Google".
    2.  Google popup appears.
    3.  On success, Google returns an `credential` (ID Token).
    4.  Frontend sends this `credential` to Backend via `POST /auth/google`.
    5.  Frontend receives the app's `access_token` and stores it.

### Backend (FastAPI)
- **Library:** `google-auth` / `requests` (to verify token)
- **New Endpoint:** `POST /auth/google`
    - Accepts: `{ token: str }`
    - Actions:
        1.  Verifies the Google ID Token.
        2.  Extracts email and user info.
        3.  Finds or Creates the user in MongoDB.
        4.  Generates and returns an internal JWT (Session Token).

## 3. Implementation Steps

### Step 1: Dependencies
- **Frontend:** `npm install @react-oauth/google`
- **Backend:** `pip install google-auth requests`

### Step 2: Environment Configuration
User must provide a **Google Client ID**.
- `backend/.env`: `GOOGLE_CLIENT_ID=...`
- `frontend/.env`: `VITE_GOOGLE_CLIENT_ID=...`

### Step 3: Backend Implementation
- Update `backend/routers/auth.py`:
    - Add `POST /google` endpoint.
    - Logic to verify token and sync user to DB.

### Step 4: Frontend Implementation
- Wrap App in `GoogleOAuthProvider`.
- Replace `Login.tsx` form with `<GoogleLogin />` component.
- Update `AuthContext` to handle the exchange of Google Token -> App Token.

## 4. Verification
- Launch app.
- Click Google Sign In.
- Verify user is created in MongoDB.
- Verify user is redirected to Dashboard.