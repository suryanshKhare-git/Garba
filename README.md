# GarbaCircle

GarbaCircle is a responsive, location-first community app for finding people to dance Garba with. It uses a React + TypeScript + Vite client, an Express API, MongoDB/Mongoose, and cookie-based server sessions. It is structured as a small full-stack app so the main flows run against persisted data rather than a frontend mock.

## What is implemented

- Hashed-password registration and login, email OTP verification, server-side session cookies, logout, and protected API endpoints.
- Profile editing, visibility and photo visibility controls, age and location fields, dance styles, languages, timing, and availability.
- Nearby discovery with city, age, experience, style, and timing filters; explainable estimates only when enough preference overlap exists.
- Shortlists, partner invitations, accept/decline/cancel handling, connection-gated conversations, persisted messages, and notifications.
- Event listings with city/date filters and opt-in attendance, plus report, block, account deletion, and privacy settings.
- Responsive desktop sidebar, mobile bottom navigation, empty states, form feedback, and development sample labels.

Discovery defaults to the user’s selected city and neighbourhood. The app does not request GPS permission or display distance claims. The initial location feature matches city and locality text. Radius is saved as a preference for future coordinate-backed search; this initial version does not geocode addresses or calculate radius distances. Adding a geocoding/map provider requires choosing a provider and configuring its credentials.

## Requirements

- Node.js 20 or newer
- MongoDB 6 or newer, local or hosted

## Local setup

```bash
npm install
Copy-Item .env.example .env
```

Set `MONGODB_URI` and `SESSION_SECRET` in `.env`. Generate a long random session secret before deploying. Then start both development servers:

```bash
npm run dev
```

Open `http://localhost:5173`. The Vite server proxies `/api` requests to the Express server on port 4000. The API can also be started alone with `npm run dev:server`.

### Email verification

For real OTP email delivery, set `RESEND_API_KEY` and `OTP_FROM_EMAIL` in `.env`. The sending domain must be verified with Resend. In local development without those values, the verification screen displays the short-lived development code so the flow can be tried without email credentials. Production rejects signup when email delivery is not configured. Verification codes expire after 10 minutes and allow up to five guesses.

### Optional development sample data

The seed command creates six fictional, visibly labelled demo profiles and four sample events in Ahmedabad, Surat, Vadodara, and Indore. Event venues and dates are illustrative only; these are not live event listings or real people. Run:

```bash
npm run seed
```

Demo account password: `GarbaDemo2026!`. Log in with `demo.aarav@garbacircle.test`, `demo.mira@garbacircle.test`, `demo.ishita@garbacircle.test`, `demo.kabir@garbacircle.test`, `demo.nisha@garbacircle.test`, or `demo.dev@garbacircle.test`.

## Environment variables

| Variable | Purpose |
| --- | --- |
| `PORT` | Express API port (default `4000`) |
| `MONGODB_URI` | MongoDB connection string; required for application data |
| `SESSION_SECRET` | Secret used to sign session cookies; set a unique random value |
| `CLIENT_ORIGIN` | Allowed browser origin (default `http://localhost:5173`) |
| `NODE_ENV` | Set to `production` to enable secure-only cookies |
| `RESEND_API_KEY` | Resend API key for sending signup verification codes (required for production signup) |
| `OTP_FROM_EMAIL` | Verified sender address used for OTP email |

## Build and deployment

```bash
npm run build
npm start
```

Configure MongoDB, `SESSION_SECRET`, `RESEND_API_KEY`, and `OTP_FROM_EMAIL` on the server. `npm start` runs the compiled Express API and serves the built React client from the same origin. The API session cookie is HTTP-only and secure in production.

### Deploy on Render

This repository includes a `render.yaml` Blueprint for a Node web service. Push the repository to GitHub, choose **New > Blueprint** in Render, and connect the repository. Before the first production signup, provide:

- `MONGODB_URI`: a reachable MongoDB connection string, such as a MongoDB Atlas database URI.
- `RESEND_API_KEY`: a Resend key for delivering signup OTP codes.
- `OTP_FROM_EMAIL`: a sender address on a domain verified with Resend.

Render generates `SESSION_SECRET`. `NODE_ENV`, `NODE_VERSION`, the build/start commands, and `/api/health` check are declared in the Blueprint. Keep the database URI and email key in Render environment settings; never commit them to Git.

## Integrations and current limits

- MongoDB is required for production application data. Resend is used for production signup OTP email. No dedicated photo-storage service, map/geocoding API, live event feed, or real-time transport is configured.
- Password reset returns a clear setup message until an email provider is configured.
- A user can upload a JPG, PNG, or WebP up to 350 KB; the development flow stores it as a data URL in MongoDB. For production, move image bytes to object storage and persist only the resulting URL.
- Messaging is database-backed and refreshes on page selection; it is not real-time.
- Partner matching is a small explainable preference heuristic, not a scientific compatibility measure.
- Photo URLs in the sample seed point to Unsplash and need an internet connection to load.

## Safety notes

Only public profile attributes are selected for discovery. Email and phone are excluded from public profile responses. Exact address and GPS capture are not part of the current interface. Conversations require an accepted partner request. Rate limiting is applied to authentication routes. For a public launch, add email verification/password reset, durable report moderation, upload scanning/storage, stronger abuse controls, and a reviewed privacy policy.
