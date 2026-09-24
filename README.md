# Sarhne Backend

A REST API backend for an anonymous Q&A / message-receiving app (a Saraha-style service). Users create accounts, verify their e-mail, and receive anonymous messages from other users. Admins can moderate messages and list users.

> **API reference:** see [API_DOCS.md](./API_DOCS.md) for every endpoint, including request bodies and success/error responses for all cases.

## Tech stack

| Layer | Technology |
|-------|------------|
| Runtime | Node.js (ESM, `type: module`) |
| Framework | Express 4 |
| Database | MongoDB (Mongoose 8) |
| Validation | Joi |
| Auth | JWT (access 1h / refresh 5d), bcrypt password hashing |
| Token blacklist | Mongo collection with TTL index (auto-purges expired tokens) |
| Encryption | crypto-js AES (phone numbers are stored encrypted) |
| E-mail | Nodemailer + Gmail SMTP (event-emitter based queue) |
| Misc | dotenv, uuid (`jti` for tokens) |

## Features

- Sign up with e-mail verification (JWT link), sign in/out, refresh tokens.
- Forgot / reset password via a hashed, single-use, expiring OTP (max 5 attempts).
- Role-based access: `user`, `admin`, `super_admin`.
- Send anonymous messages to any user; owners can delete their own messages, admins can moderate.
- Pagination (`page` / `limit`) on list and message endpoints (limit capped at 50).
- Soft-delete support and centralized error mapping with no internal-error leakage.

## Getting started

### Prerequisites

- Node.js 18+
- MongoDB running locally (or a remote `DB_URI`)
- pnpm (preferred) or npm

### Installation

1. **Install dependencies**

   ```bash
   pnpm install
   # or
   npm install
   ```

2. **Configure environment**

   ```bash
   cp .env.example .env
   ```

   Fill in the real values — most importantly `DB_URI`, the JWT secrets, and the Gmail SMTP credentials (use an [App Password](https://support.google.com/accounts/answer/185833), not your normal password). Never commit real secrets.

3. **Run the server**

   ```bash
   npm start          # production
   npm run dev        # development (auto-restart on changes, Windows)
   ```

4. **Verify it's up**

   ```bash
   curl http://localhost:3000/
   # hello world!
   ```

## Project structure

```
sarhne_backend/
├── index.js                         # entry point (boots the app)
├── .env.example                     # environment template
├── README.md                        # this file
├── API_DOCS.md                      # full endpoint + request/response reference
└── src/
    ├── main.js                      # Express bootstrap (JSON parser, routes, listen)
    ├── DB/
    │   ├── connection.js            # Mongoose connection
    │   └── models/                  # Mongoose models (User, Message, BlackListTokens)
    ├── Modules/                     # feature modules
    │   ├── auth/                    #   auth.controller.js (routes) + services/
    │   ├── user/                    #   user.controller.js (routes) + services/
    │   └── message/                 #   message.controller.js (routes) + services/
    ├── Middlewares/                 # authentication, authorization, validation, error handler
    ├── validators/                  # Joi schemas per endpoint
    ├── Services/                    # send-email service (Nodemailer + emitter)
    ├── utils/                       # encryption, sanitizers, error mapping, route mounting
    └── Constants/                   # systemRoles
```

Each module follows the same pattern: a controller file that defines the Express routes and a `services/` folder containing the request logic, with Joi validators in `src/validators/`.

## Endpoints overview

| Method | Path | Auth | Description |
|--------|------|------|-------------|
| GET | `/` | — | Health probe |
| **Auth** | | | |
| POST | `/auth/signup` | — | Create account, queue verification e-mail |
| POST | `/auth/signin` | — | Log in, get access + refresh tokens |
| POST | `/auth/logout` | access + refresh headers | Blacklist both tokens |
| GET | `/auth/verify-email/:token` | — | Confirm the e-mail verification link |
| POST | `/auth/refresh-token` | refresh header | New access token |
| PATCH | `/auth/forgot-password` | — | Send 6-digit OTP by e-mail |
| PUT | `/auth/reset-password` | — | Reset password with OTP |
| **User** | | `access_token` header | |
| GET | `/user/getProfileData` | auth | Current user's profile (decrypted phone) |
| PATCH | `/user/update-password` | auth | Change password (old + new) |
| PUT | `/user/update-profile` | auth | Update username / e-mail / phone |
| GET | `/user/list-users` | auth + admin | Paginated user list (ADMIN/SUPER_ADMIN) |
| **Message** | | | |
| POST | `/message/send` | — | Send an anonymous message |
| GET | `/message/getMessages` | auth + admin | Paginated all messages (ADMIN/SUPER_ADMIN) |
| GET | `/message/getUserMessages` | auth | Paginated caller's messages |
| DELETE | `/message/:id` | auth | Delete own message (or any, for admins) |

## Environment variables

See [.env.example](./.env.example) for the full template. Required values:

| Variable | Purpose |
|----------|---------|
| `DB_URI` | MongoDB connection string |
| `PORT` | Server port |
| `ENCRYPTED_KEY` | AES key for phone encryption |
| `SALT` | bcrypt salt rounds |
| `APP_URL` | Public base URL used in e-mails (prevents host-header injection) |
| `EMAIL_USER` / `EMAIL_PASS` | Gmail SMTP credentials |
| `JWT_SECRET_KEY` | Verification-link signing secret |
| `JWT_SECRET_ACCESS` | Access-token signing secret |
| `JWT_SECRET_REFRESH` | Refresh-token signing secret |

## License

ISC