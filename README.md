# Kritique Backend

Backend API for the Kritique teacher review platform. Built with Express, TypeScript, MongoDB (Mongoose), and Firebase Admin for authentication.

## Table of Contents

- [Setup](#setup)
- [Environment Variables](#environment-variables)
- [Running the Server](#running-the-server)
- [API Overview](#api-overview)
- [Response Format](#response-format)
- [API Routes](#api-routes)
  - [Authentication](#authentication)
  - [Faculties](#faculties)
  - [Reviews](#reviews)
  - [Faculty Reactions (Like/Dislike)](#faculty-reactions-likedislike)
  - [Review Votes (Upvote/Downvote)](#review-votes-upvotedownvote)
  - [Bookmarks](#bookmarks)
- [Data Models](#data-models)
- [Backward Compatibility](#backward-compatibility)

---

## Setup

```bash
npm install
```

## Environment Variables

Create a `.env` file based on `.env.example`:

| Variable | Description |
|---|---|
| `PORT` | Server port (default: 3300) |
| `MONGO_URI` | MongoDB connection string |
| `FIREBASE_PROJECT_ID` | Firebase project ID |
| `FIREBASE_CLIENT_EMAIL` | Firebase service account email |
| `FIREBASE_PRIVATE_KEY` | Firebase service account private key |
| `ACCESS_TOKEN_DISABLED` | Set `"true"` to skip auth (dev only) |
| `ALLOW_KIIT_ONLY` | Set `"true"` to restrict to `@kiit.ac.in` emails |
| `ENFORCE_APP_VERSION` | Set `"true"` to enforce version header |
| `APP_VERSION` | Expected app version for version enforcement |

## Running the Server

```bash
# Development (with hot reload)
npm run dev

# Production
npm start
```

---

## API Overview

All routes return responses in this format:

```json
{
  "status": 200,
  "message": "Successful",
  "data": { ... }
}
```

Routes mounted under `/reviews`, `/faculties`, and `/bookmark` require Firebase auth (Bearer token in `Authorization` header). Routes under `/authenticate`, `/review`, `/faculty` do not require auth.

---

## API Routes

### Authentication

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/authenticate/` | No | Register/login a user |
| `DELETE` | `/authenticate/:id` | Yes | Delete a user account |

#### POST `/authenticate/`

**Body:**
```json
{ "token": "Bearer <firebase_id_token>", "role": "user" }
```

**Response (200):** Returns the user object (`uid`, `name`, `anon_name`, `email`, `photoUrl`, `role`, `status`, `bookmark`).

---

### Faculties

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/faculties/` | Yes | List/search faculties |
| `GET` | `/faculties/:id` | Yes | Get a single faculty |

#### GET `/faculties/`

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `limit` | number | Results per page (default: 10) |
| `page` | number | Page number (0-indexed) |
| `name` | string | Search by name (case-insensitive regex) |
| `ids` | string | Comma-separated faculty IDs for bulk fetch (for side-by-side comparison) |

**Examples:**
```
GET /faculties/?limit=20&page=0
GET /faculties/?name=smith
GET /faculties/?ids=id1,id2,id3
```

**Response (200):** Array of faculty objects with fields: `_id`, `name`, `experience`, `photoUrl`, `avgRating`, `totalRatings`, `avgTeaching`, `avgBehaviour`, `avgMarks`, `likes`, `dislikes`.

#### GET `/faculties/:id`

**Response (200):** Single faculty object (same fields as above).

---

### Reviews

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/reviews/` | Yes | List all reviews (paginated) |
| `POST` | `/reviews/` | Yes | Create a review |
| `GET` | `/reviews/:facultyId` | Yes | Get reviews for a faculty |
| `PUT` | `/reviews/:reviewId` | Yes | Update a review |
| `DELETE` | `/reviews/:id` | Yes | Delete a review |
| `GET` | `/reviews/:id/history` | Yes | Get review history for a user |

#### POST `/reviews/`

**Body:**
```json
{
  "createdFor": "<faculty_id>",
  "rating": 4.5,
  "feedback": "Great teacher!",
  "teachingRating": 5,
  "behaviourRating": 4,
  "marksRating": 4
}
```

| Field | Required | Description |
|---|---|---|
| `createdFor` | Yes | Faculty ID |
| `rating` | Yes | Overall rating (1.0 - 5.0) |
| `feedback` | Yes | Review text |
| `teachingRating` | No | Teaching category rating (1.0 - 5.0) |
| `behaviourRating` | No | Behaviour category rating (1.0 - 5.0) |
| `marksRating` | No | Marks category rating (1.0 - 5.0) |

**Behavior:**
- One review per user per faculty (enforced).
- `avgRating` on the faculty is updated using the overall `rating`.
- Category averages (`avgTeaching`, `avgBehaviour`, `avgMarks`) are recomputed from all reviews that have those fields. Old reviews without category fields are ignored for category averages.

#### GET `/reviews/:facultyId`

**Query Parameters:**

| Param | Type | Description |
|---|---|---|
| `limit` | number | Results per page (default: 10) |
| `page` | number | Page number (0-indexed) |
| `sort` | string | `"top"` to sort by most upvotes first (default: newest first) |

**Response:** Array of review objects, each populated with `createdBy` (user info). Each review includes `upvotes` and `downvotes` counts.

#### PUT `/reviews/:reviewId`

**Body:** Any subset of `rating`, `teachingRating`, `behaviourRating`, `marksRating`, `feedback`. All fields validated (1.0 - 5.0 range for ratings). Category averages are recomputed on update.

#### DELETE `/reviews/:id`

Deletes the review, removes associated votes, and recomputes all faculty averages (overall + categories).

---

### Faculty Reactions (Like/Dislike)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/faculties/:id/reaction` | Yes | Like or dislike a faculty |
| `DELETE` | `/faculties/:id/reaction` | Yes | Remove your reaction |
| `GET` | `/faculties/:id/reactions` | Yes | Get reaction counts + your reaction |

#### POST `/faculties/:id/reaction`

**Body:**
```json
{ "type": "like" }
```

`type` must be `"like"` or `"dislike"`.

**Behavior:**
- One reaction per user per faculty (unique constraint on `faculty + user`).
- Re-tapping the same type returns `ALREADY_REACTED` (code 210) without changing anything.
- Tapping the opposite type flips the reaction (removes old, adds new, updates faculty counters).
- Returns the reaction document.

**Response:** `likes` and `dislikes` counts are denormalized on the Faculty document for fast reads.

#### DELETE `/faculties/:id/reaction`

Removes the current user's reaction from this faculty. Updates faculty `likes`/`dislikes` counters.

#### GET `/faculties/:id/reactions`

**Response:**
```json
{
  "status": 200,
  "message": "Successful",
  "data": {
    "likes": 15,
    "dislikes": 2,
    "myReaction": "like"
  }
}
```

`myReaction` is `"like"`, `"dislike"`, or `null` if the user hasn't reacted.

---

### Review Votes (Upvote/Downvote)

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `POST` | `/reviews/:id/vote` | Yes | Upvote or downvote a review |
| `DELETE` | `/reviews/:id/vote` | Yes | Remove your vote |
| `GET` | `/reviews/:id/votes` | Yes | Get vote counts + your vote |

#### POST `/reviews/:id/vote`

**Body:**
```json
{ "type": "up" }
```

`type` must be `"up"` or `"down"`.

**Behavior:**
- One vote per user per review (unique constraint on `review + user`).
- Re-tapping the same type returns `ALREADY_VOTED` (code 212) without changing anything.
- Tapping the opposite type flips the vote and updates review counters.
- Returns the vote document.

**Response:** `upvotes` and `downvotes` counts are denormalized on the Review document.

#### DELETE `/reviews/:id/vote`

Removes the current user's vote from this review. Updates review `upvotes`/`downvotes` counters.

#### GET `/reviews/:id/votes`

**Response:**
```json
{
  "status": 200,
  "message": "Successful",
  "data": {
    "upvotes": 8,
    "downvotes": 1,
    "myVote": "up"
  }
}
```

`myVote` is `"up"`, `"down"`, or `null` if the user hasn't voted.

---

### Bookmarks

| Method | Endpoint | Auth | Description |
|---|---|---|---|
| `GET` | `/bookmark/` | Yes | Get user's bookmarks |
| `POST` | `/bookmark/` | Yes | Add a faculty to bookmarks |
| `DELETE` | `/bookmark/` | Yes | Remove a faculty from bookmarks |

#### POST `/bookmark/`

**Body:** `{ "fic": "<faculty_id>" }`

#### DELETE `/bookmark/`

**Body:** `{ "fic": "<faculty_id>" }`

---

## Data Models

### Faculty

| Field | Type | Description |
|---|---|---|
| `name` | String (unique) | Faculty name |
| `experience` | Number | Years of experience |
| `photoUrl` | String | Profile photo URL |
| `avgRating` | Number | Average overall rating (from all reviews) |
| `totalRatings` | Number | Total number of reviews |
| `avgTeaching` | Number | Average teaching rating (new reviews only) |
| `avgBehaviour` | Number | Average behaviour rating (new reviews only) |
| `avgMarks` | Number | Average marks rating (new reviews only) |
| `likes` | Number | Total like count |
| `dislikes` | Number | Total dislike count |
| `reviewList` | ObjectId[] | Array of review IDs |

### Review

| Field | Type | Description |
|---|---|---|
| `createdBy` | ObjectId (ref User) | Review author |
| `createdFor` | ObjectId (ref Faculty) | Faculty being reviewed |
| `rating` | Number (1.0-5.0) | Overall rating |
| `teachingRating` | Number? (1.0-5.0) | Teaching category rating (optional) |
| `behaviourRating` | Number? (1.0-5.0) | Behaviour category rating (optional) |
| `marksRating` | Number? (1.0-5.0) | Marks category rating (optional) |
| `feedback` | String | Review text |
| `upvotes` | Number | Upvote count |
| `downvotes` | Number | Downvote count |
| `status` | String | `"validated"` or `"not validated"` |

### FacultyReaction

| Field | Type | Description |
|---|---|---|
| `faculty` | ObjectId (ref Faculty) | Faculty being reacted to |
| `user` | ObjectId (ref User) | User who reacted |
| `type` | String | `"like"` or `"dislike"` |

Unique compound index on `(faculty, user)`.

### ReviewVote

| Field | Type | Description |
|---|---|---|
| `review` | ObjectId (ref Review) | Review being voted on |
| `user` | ObjectId (ref User) | User who voted |
| `type` | String | `"up"` or `"down"` |

Unique compound index on `(review, user)`.

### User

| Field | Type | Description |
|---|---|---|
| `uid` | String | Firebase UID |
| `name` | String | Display name |
| `anon_name` | String | Anonymous (Star Wars) name |
| `email` | String | Email address |
| `photoUrl` | String | Profile photo URL |
| `role` | String | `"admin"` or `"user"` |
| `status` | Boolean | Verification status |
| `bookmark` | String[] | Array of faculty IDs |

---

## Backward Compatibility

- **Old reviews without category ratings** continue to work. They still count toward `avgRating` and `totalRatings` on the faculty.
- **Category averages** (`avgTeaching`, `avgBehaviour`, `avgMarks`) are computed only from reviews that include those fields. Old single-rating reviews do not affect category numbers.
- **No data migration required.** Old documents in MongoDB are untouched. New fields have sensible defaults (`0` for averages/counts, `null` for optional rating fields).
- The existing `rating` field on reviews remains **required** — no changes to existing validation.
- All existing endpoints continue to work identically. New fields are additive.

---

## Status Codes

| Code | Meaning |
|---|---|
| 200 | Successful |
| 201 | Created |
| 202 | Deleted |
| 203 | Updated |
| 204 | User not found |
| 205 | Reviews not found |
| 206 | Faculty not found |
| 207 | Already reviewed |
| 208 | Email not allowed |
| 209 | Profanity detected |
| 210 | Reaction updated (already reacted) |
| 211 | Reaction removed |
| 212 | Vote updated (already voted) |
| 213 | Vote removed |
| 214 | Reaction not found |
| 215 | Vote not found |
| 400 | Invalid request |
| 401 | Token required |
| 402 | Invalid token |
| 403 | Unauthorized |
| 404 | Internal server error |
| 405 | Version mismatch |
