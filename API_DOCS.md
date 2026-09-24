# API Documentation

Base URL: `http://localhost:3000` (or the `APP_URL` you configure).

- All requests/responses are JSON (`Content-Type: application/json`).
- Protected endpoints require the JWT access token in the request **headers**: `access_token: <token>`.
- `POST /auth/refresh-token` and `POST /auth/logout` also require `refresh_token: <token>`.
- Send-to-owner and phone fields are handled server-side; phone is stored encrypted and returned decrypted to the owner.

## Contents

- [Root](#root)
- [Auth](#auth)
  - [POST /auth/signup](#post-authsignup)
  - [POST /auth/signin](#post-authsignin)
  - [POST /auth/logout](#post-authlogout)
  - [GET /auth/verify-email/:token](#get-authverify-emailtoken)
  - [POST /auth/refresh-token](#post-authrefresh-token)
  - [PATCH /auth/forgot-password](#patch-authforgot-password)
  - [PUT /auth/reset-password](#put-authreset-password)
- [User](#user)
  - [GET /user/getProfileData](#get-usergetprofiledata)
  - [PATCH /user/update-password](#get-userupdate-password)
  - [PUT /user/update-profile](#put-userupdate-profile)
  - [GET /user/list-users](#get-userlist-users)
- [Message](#message)
  - [POST /message/send](#post-messagesend)
  - [GET /message/getMessages](#get-messagegetmessages)
  - [GET /message/getUserMessages](#get-messagegetusermessages)
  - [DELETE /message/:id](#delete-messageid)
- [Common errors](#common-errors)

---

## Root

### GET /

Health probe.

**Response**

```json
// 200
"hello world!"
```

Any unknown path returns:

```json
// 404
{ "message": "Page not found" }
```

---

## Auth

### POST /auth/signup

Creates a user and queues a verification e-mail (link valid 30 minutes).

**Body**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `username` | string | yes | 3–20 chars |
| `email` | string | yes | valid e-mail |
| `password` | string | yes | min 8 chars |
| `confirmPassword` | string | yes | must equal `password` |
| `phone` | string | yes | 10–15 chars |

**Success — `201`**

```json
{
  "message": "user created successfully",
  "user": {
    "_id": "...",
    "userName": "jane",
    "email": "jane@example.com",
    "phone": "...",
    "role": "user",
    "isDeleted": false,
    "isEmailVerified": false,
    "otpAttempts": 0,
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors**

| Status | Body |
|--------|------|
| 400 | `{ "message": "validation Errors", "errors": [ ...Joi details ] }` |
| 400 | `{ "message": "Passwords do not match" }` |
| 409 | `{ "message": "Email already exists" }` |
| 500 | `{ "message": "create user failed, try again" }` |
| 500 | `{ "message": "Internal Server Error" }` |

> Note: password/OTP fields are always stripped from responses.

---

### POST /auth/signin

Authenticates a user and returns an access token (1h) plus a refresh token (5d).

**Body**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `email` | string | yes | valid e-mail |
| `password` | string | yes | 8–100 chars |

**Success — `200`**

```json
{
  "message": "user logged in successfully",
  "token": "<access_token (1h)>",
  "refresh_token": "<refresh_token (5d)>",
  "user": { "_id": "...", "userName": "jane", "email": "jane@example.com", "...": "..." }
}
```

**Errors**

| Status | Body |
|--------|------|
| 400 | `{ "message": "validation Errors", "errors": [ ... ] }` |
| 401 | `{ "message": "invalid email or password" }` |
| 403 | `{ "message": "Please verify your email before signing in" }` |

---

### POST /auth/logout

Blacklists both the access and refresh tokens (idempotent).

**Headers:** `access_token`, `refresh_token`

**Success — `200`**

```json
{ "message": "Logged out successfully" }
```

**Errors**

| Status | Body |
|--------|------|
| 401 | `{ "message": "Logout requires access_token and refresh_token" }` |
| 401 | `{ "message": "No access token provided" }` / `{ "message": "Invalid token" }` / `{ "message": "Token expired" }` |
| 401 | `{ "message": "Token is blacklisted" }` (if already logged out) |

---

### GET /auth/verify-email/:token`

Confirms e-mail verification via the signed JWT sent by e-mail.

**Params:** `token` — the JWT from the verification link.

**Success — `200`**

```json
{ "message": "Email verfied successfully", "user": { "...": "..." } }
```

**Errors**

| Status | Body |
|--------|------|
| 401 | `{ "message": "Invalid token" }` / `{ "message": "Token expired" }` |
| 404 | `{ "message": "User not found" }` |

---

### POST /auth/refresh-token

Exchanges a valid refresh token for a new access token (1h).

**Headers:** `refresh_token: <token>`

**Success — `200`**

```json
{ "message": "Token refreshed successfully", "token": "<new access_token>" }
```

**Errors**

| Status | Body |
|--------|------|
| 401 | `{ "message": "No refresh token provided" }` |
| 401 | `{ "message": "Token expired" }` / `{ "message": "Invalid token" }` |
| 401 | `{ "message": "Token is blacklisted" }` |

---

### PATCH /auth/forgot-password

Sends a 6-digit OTP to the account e-mail (valid 10 minutes, max 5 attempts).

**Body**

| Field | Type | Required |
|-------|------|----------|
| `email` | string | yes |

**Success — `200`**

```json
{ "message": "Reset password email sent successfully" }
```

**Errors**

| Status | Body |
|--------|------|
| 400 | `{ "message": "validation Errors", "errors": [ ... ] }` |
| 404 | `{ "message": "User not found" }` |

---

### PUT /auth/reset-password

Resets the password using the OTP from `forgot-password`. OTP is single-use; a 5th wrong OTP returns `429`.

**Body**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `email` | string | yes | valid e-mail |
| `otp` | string | yes | exactly 6 digits |
| `password` | string | yes | 8–100 chars |
| `confirmPassword` | string | yes | must equal `password` |

**Success — `200`**

```json
{ "message": "password updated successfully" }
```

**Errors**

| Status | Body |
|--------|------|
| 400 | `{ "message": "validation Errors", "errors": [ ... ] }` |
| 400 | `{ "message": "Passwords do not match" }` |
| 401 | `{ "message": "Invalid OTP" }` (unknown user / no OTP pending) |
| 401 | `{ "message": "OTP has expired, please request a new one" }` |
| 429 | `{ "message": "Too many incorrect attempts, request a new OTP" }` |

---

## User

All user endpoints require `access_token` in the headers (except as noted). Soft-deleted accounts receive `401`.

### GET /user/getProfileData

Returns the authenticated user's profile (phone decrypted for the owner).

**Headers:** `access_token`

**Success — `200`**

```json
{
  "message": "user founded successfully",
  "user": {
    "_id": "...",
    "userName": "jane",
    "email": "jane@example.com",
    "phone": "+201234567890",
    "role": "user",
    "isEmailVerified": true
  }
}
```

**Errors**

| Status | Body |
|--------|------|
| 401 | `{ "message": "No access token provided" }` / `{ "message": "Invalid token" }` / `{ "message": "Token expired" }` / `{ "message": "Token is blacklisted" }` |
| 401 | `{ "message": "Access denied" }` (soft-deleted) |
| 404 | `{ "message": "User not found" }` |

---

### PATCH /user/update-password

**Headers:** `access_token`

**Body**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `oldPassword` | string | yes | 8–100 chars |
| `newPassword` | string | yes | 8–100 chars |
| `confirmNewPassword` | string | yes | must equal `newPassword` |

**Success — `200`**

```json
{ "message": "Password updated successfully" }
```

**Errors**

| Status | Body |
|--------|------|
| 400 | `{ "message": "validation Errors", "errors": [ ... ] }` |
| 400 | `{ "message": "New passwords do not match" }` |
| 401 | `{ "message": "Invalid old password" }` |
| 404 | `{ "message": "User not found" }` |

---

### PUT /user/update-profile

Updates username, phone, and/or e-mail. Changing the e-mail re-sends a verification link and marks the account unverified.

**Headers:** `access_token`

**Body** (at least one field required)

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `userName` | string | no | 3–20 chars |
| `email` | string | no | valid e-mail |
| `phone` | string | no | 10–15 chars |

**Success — `200`**

```json
{
  "message": "User updated successfully",
  "user": { "_id": "...", "userName": "jane", "email": "jane@example.com", "...": "..." }
}
```

**Errors**

| Status | Body |
|--------|------|
| 400 | `{ "message": "validation Errors", "errors": [ ... ] }` |
| 404 | `{ "message": "User not found" }` |
| 409 | `{ "message": "Email already exists" }` |

---

### GET /user/list-users

Paginated user list (ADMIN / SUPER_ADMIN only).

**Headers:** `access_token`

**Query**

| Param | Type | Default | Max |
|-------|------|---------|-----|
| `page` | int ≥ 1 | 1 | — |
| `limit` | int ≥ 1 | 10 | 50 |

**Success — `200`**

```json
{
  "message": "Users listed successfully",
  "users": [ { "_id": "...", "userName": "...", "...": "..." } ],
  "pagination": { "page": 1, "limit": 10, "total": 23, "totalPages": 3 }
}
```

**Errors**

| Status | Body |
|--------|------|
| 400 | `{ "message": "validation Errors", "errors": [ ... ] }` (bad `page`/`limit`) |
| 401 | token errors (see above) |
| 403 | `{ "message": "Access denied" }` (role not admin/super_admin) |

---

## Message

### POST /message/send

Posts a message to a target user. **No authentication required.**

**Body**

| Field | Type | Required | Rules |
|-------|------|----------|-------|
| `body` | string | yes | 1–1000 chars |
| `ownerId` | string | yes | 24-hex Mongo ObjectId |

**Success — `201`**

```json
{
  "message": "Message sent successfully",
  "newMessage": {
    "_id": "...",
    "body": "...",
    "ownerId": "...",
    "createdAt": "...",
    "updatedAt": "..."
  }
}
```

**Errors**

| Status | Body |
|--------|------|
| 400 | `{ "message": "validation Errors", "errors": [ ... ] }` / `{ "message": "Invalid ownerId format" }` |
| 404 | `{ "message": "User not found" }` |

---

### GET /message/getMessages

All messages with owner info, paginated (ADMIN / SUPER_ADMIN only).

**Headers:** `access_token`

**Query:** `page` (≥1, default 1), `limit` (1–50, default 10)

**Success — `200`**

```json
{
  "message": "Messages retrieved successfully",
  "messages": [ { "_id": "...", "body": "...", "ownerId": { "_id": "...", "userName": "...", "...": "..." } } ],
  "pagination": { "page": 1, "limit": 10, "total": 4, "totalPages": 1 }
}
```

**Errors:** `401` (token errors), `403` `{ "message": "Access denied" }`, `400` (bad pagination).

---

### GET /message/getUserMessages

Only the caller's messages, paginated.

**Headers:** `access_token`

**Query:** `page`, `limit` (same rules as above)

**Success — `200`**

```json
{
  "message": "Messages retrieved successfully",
  "messages": [ { "_id": "...", "body": "...", "ownerId": "..." } ],
  "pagination": { "page": 1, "limit": 10, "total": 2, "totalPages": 1 }
}
```

**Errors:** `401` (token errors), `400` (bad pagination).

---

### DELETE /message/:id

Deletes a message. The owner may delete their own message; admins/super admins may delete any (moderation).

**Headers:** `access_token`

**Params:** `id` — 24-hex Mongo ObjectId

**Success — `200`**

```json
{ "message": "Message deleted successfully" }
```

**Errors**

| Status | Body |
|--------|------|
| 400 | `{ "message": "validation Errors", "errors": [ ... ] }` / `{ "message": "Invalid message id" }` |
| 401 | token errors |
| 403 | `{ "message": "Access denied" }` (not owner, not admin) |
| 404 | `{ "message": "Message not found" }` |

---

## Common errors

Validation failures always return:

```json
{ "message": "validation Errors", "errors": [ { "message": "...", "path": "...", "type": "..." } ] }
```

Uncaught errors are mapped to a safe response by the global error handler:

```json
{ "message": "Internal Server Error" }
```

Common token errors (any protected route): `401` with `No access token provided`, `Invalid token`, `Token expired`, `Token is blacklisted`, or `Access denied`.

Unknown paths return `404` `{ "message": "Page not found" }`.
