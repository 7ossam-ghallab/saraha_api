# Commit Changes

Chronological list of all commits in this repository, from the initial scaffold (`v-1`) to the final security hardening. Each entry includes the professional message, the commit SHA, and notes about what was changed.

> **Note:** The original `v-1` through `v-6` commit messages were rewritten into the professional messages below. The `fix(security)` commit was already professionally named and is preserved verbatim.
>
> **History cleanup:** `.env`, the `src/config/*.env` files, the `Assets/` folder, and `ANALYSIS.md` have been removed from the entire commit history (no source file ever references them). The `chore(config)` commit (which only added `.env` entries) became empty after the cleanup and was dropped, leaving **10 commits**.

---

## Table of contents

| # | Commit | Message |
|---|--------|---------|
| 1 | `bc6ffd2` | `feat: scaffold Express and Mongoose backend with auth and user modules` |
| 2 | `6825458` | `feat(auth): add email verification via JWT token and Nodemailer` |
| 3 | `3ebc370` | `feat(auth): add refresh tokens, logout, and forgot/reset password flows` |
| 4 | `76ec68c` | `feat(message): add messages module with role-based middleware and user profile management` |
| 5 | `5fb7d34` | `feat(validation): add Joi signup schema and validation middleware` |
| 6 | `f3d2967` | `chore(scripts): simplify npm start command` |
| 7 | `548ed9f` | `feat: add root health-check endpoint` |
| 8 | `ad1afca` | `fix(scripts): correct npm start command syntax` |
| 9 | `4b90462` | `fix(validation): enforce Joi validation on signup route` |
| 10 | `HEAD` | `fix(security): resolve critical P0 security vulnerabilities` |

---

## 1. `bc6ffd2` — feat: scaffold Express and Mongoose backend with auth and user modules

**Original message:** `v-1`

- Sets up the Node.js/ESM Express application, MongoDB connection, and root `index.js`/`main.js` entry points.
- Adds the `User` Mongoose model (username, email, password, phone, profile image, OTP, soft-delete, and email-verification flags).
- Implements the initial `signUp` and `signIn` auth services and the user module controllers.
- Adds an AES phone-encryption utility and a generic router-mounting helper.

---

## 2. `6825458` — feat(auth): add email verification via JWT token and Nodemailer

**Original message:** `v-2`

- Introduces the Nodemailer e-mail service with an event-emitter-based mail queue.
- Adds the `POST /auth/verify-email/:token` flow: a signed JWT verification link e-mailed at signup, then verified against the user.
- Adds `jsonwebtoken` and `nodemailer` dependencies.

---

## 3. `3ebc370` — feat(auth): add refresh tokens, logout, and forgot/reset password flows

**Original message:** `v-3`

- Issues access (`1h`) and refresh (`5d`) tokens with `jti` (via `uuid`) during sign-in.
- Adds the `BlackListTokens` Mongoose model to support logout; the access token is blacklisted on logout.
- Adds `POST /auth/logout`, `POST /auth/refresh-token`, `PUT /auth/forgot-password`, and `PUT /auth/reset-password` endpoints (reset uses a numeric OTP).
- Reformats and extends the `User` model; adds the `uuid` dependency.

---

## 4. `76ec68c` — feat(message): add messages module with role-based middleware and user profile management

**Original message:** `v-4`

- Adds the `Message` model and the full messages module: `POST /message/send`, `GET /message/getMessages`, and `GET /message/getUserMessages`.
- Defines the `systemRoles` constants (`ADMIN`, `USER`, `SUPER_ADMIN`).
- Adds the authentication middleware (JWT verify + blacklist check) and the (misspelled) *autherization* authorization middleware.
- Adds a global error-handler middleware.
- Extends the user module with `GET /user/getProfileData`, `PATCH /user/update-password`, `PUT /user/update-profile`, and `GET /user/list-users`.

---

## 5. `5fb7d34` — feat(validation): add Joi signup schema and validation middleware

**Original message:** `v-5`

- Adds the `signUp.schema.js` Joi schema and a generic `validationMiddleware`.
- Adds the `joi` and `express-async-handler` dependencies.
- Renames the npm scripts to `start`/`dev`.

---

## 6. `f3d2967` — chore(scripts): simplify npm start command

**Original message:** `v-5`

- Shortens the npm `start` script (removing the inline `NODE_ENV` prefix). This commit originally also changed `DB_URI` in `.env`; that file was later removed from history during the cleanup.

---

## 7. `548ed9f` — feat: add root health-check endpoint

**Original message:** `v-5`

- Adds the root `GET /` route returning `hello world!` as a simple health probe.

---

## 8. `ad1afca` — fix(scripts): correct npm start command syntax

**Original message:** `v-5`

- Fixes the npm `start` script from `node.` to `node .`.

---

## 9. `4b90462` — fix(validation): enforce Joi validation on signup route

**Original message:** `v-6`

- Reworks `validationMiddleware` to collect all validation errors (`abortEarly: false`) and respond `400` with the error details.
- Corrects the Joi reference (`joi.object` → `Joi.object`) in the signup schema and exports the middleware as a default.
- Wires the middleware into the `POST /auth/signup` route.

---

## 10. `HEAD` — fix(security): resolve critical P0 security vulnerabilities

**Original message:** `fix(security): resolve critical P0 security vulnerabilities` (unchanged)

- **Authentication & authorization:** protects `GET /message/getMessages` with authentication + ADMIN role; restricts `GET /user/list-users` to ADMIN/SUPER_ADMIN.
- **Token lifecycle:** `refresh-token` now requires the header and rejects blacklisted refresh tokens after logout; logout is idempotent.
- **Data exposure:** sanitizes user responses everywhere (strips `password`, `otp`, `__v`); auth middleware projection excludes OTP.
- **Secrets:** removes committed env files from tracking, adds `.env.example`, and gitignores `.env`. ⚠️ Credentials were previously committed and must be **rotated**.
- **Error handling:** centralized `getErrorResponse` maps `CastError`/`ValidationError`/JWT errors/duplicate key to proper 4xx responses and generic `500`, stopping internal-error leaks.
- **Emails:** verification links built from `APP_URL` to prevent host-header injection.
- **Misc:** signin returns `200`; phone decryption uses `JSON.parse`; expired/invalid tokens return `401`; reset-password guards a missing OTP; verify-email token lifetime extended to `15m`.