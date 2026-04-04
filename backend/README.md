# Campus Book Exchange Backend

## Setup
1. SQLite is file-based (no external DB server needed).
2. Copy `.env.example` to `.env` inside `backend/` and set:
   - `DATABASE_URL` (example: `file:./dev.db`)
   - `JWT_SECRET`
   - (optional) `UNIVERSITY_EMAIL_DOMAINS`
   - (optional) `CORS_ORIGIN`

## Run
```bash
cd backend
npm install
npx prisma migrate dev
npm run dev
```

Server starts at `http://localhost:${PORT}` and exposes:
- `GET /health`
- `/api/auth/register` (password-based; optional)
- `/api/auth/login` (password-based; optional)
- `POST /api/auth/request-otp`
- `POST /api/auth/verify-otp`
- `POST /api/auth/logout` (client-side JWT logout)
- `/api/books/*`
- `/api/requests/*`

## Notes
- Your requested “book returned” flow is implemented via an extra endpoint:
  - `PUT /api/requests/:id/complete`
- For now, book `image` is treated as a URL string (no file upload endpoint included).

## OTP Settings
- **Dev mode** (`OTP_DEV_RETURN=true`): OTP is returned in API response and shown on screen. No email sent.
- **Real email**: Set `OTP_DEV_RETURN=false` and configure SMTP.

### Send OTP to real email (Brevo - free)
1. Sign up at [brevo.com](https://brevo.com)
2. Go to **SMTP & API** → **SMTP** → Create an SMTP key
3. In `backend/.env`:
   ```
   OTP_DEV_RETURN="false"
   SMTP_HOST="smtp-relay.brevo.com"
   SMTP_PORT=587
   SMTP_USER="your-brevo-login-email@example.com"
   SMTP_PASS="your-smtp-key-from-brevo"
   SMTP_FROM="Campus Book Exchange <your-verified-sender@example.com>"
   ```
4. Restart backend. OTP will be sent to the user's email.

