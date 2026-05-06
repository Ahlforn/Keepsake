# Keepsake

A Google Keep–inspired note-taking PWA. Quiet, paper-textured, with the bones of a real app.

**Stack**
- **Client:** React 18 + TypeScript + Vite + Tailwind + SCSS, installable PWA via `vite-plugin-pwa`
- **Server:** Node.js + Express + TypeScript
- **Database:** PostgreSQL via Prisma
- **Auth:** GitHub OAuth2 (Passport) → JWT bearer tokens

**Features**
- Color-tinted notes, free-form tags, pin & archive
- Image attachments (multipart upload, served from `/uploads`)
- Full-text search across title and content
- Sign in with GitHub
- Offline-capable: API + uploads cached by the service worker

---

## Project layout

```
keepsake/
├── client/   # Vite + React PWA
└── server/   # Express + Prisma API
```

## 1. Database

You need a running PostgreSQL instance. The fastest way:

```bash
docker run -d --name keepsake-pg \
  -e POSTGRES_PASSWORD=postgres \
  -e POSTGRES_DB=keepsake \
  -p 5432:5432 postgres:16
```

## 2. GitHub OAuth app

Create one at https://github.com/settings/developers with:
- **Homepage URL:** `http://localhost:5173`
- **Authorization callback URL:** `http://localhost:4000/api/auth/github/callback`

Copy the Client ID and generate a Client Secret.

## 3. Server

```bash
cd server
cp .env.example .env
# edit .env: paste GITHUB_CLIENT_ID, GITHUB_CLIENT_SECRET, set strong JWT_SECRET/SESSION_SECRET
npm install
npx prisma migrate dev --name init
npm run dev
```

The API now runs on http://localhost:4000.

## 4. Client

```bash
cd client
npm install
npm run dev
```

Open http://localhost:5173. The Vite dev server proxies `/api` and `/uploads` to the backend, so no CORS gymnastics in dev.

## API surface

| Method | Path                          | Notes                                    |
| ------ | ----------------------------- | ---------------------------------------- |
| GET    | `/api/auth/github`            | Start OAuth flow                         |
| GET    | `/api/auth/github/callback`   | OAuth callback → redirects with JWT      |
| GET    | `/api/auth/me`                | Current user (Bearer token)              |
| GET    | `/api/notes?archived=&q=`     | List notes for user                      |
| POST   | `/api/notes`                  | Create note                              |
| PATCH  | `/api/notes/:id`              | Update note (any subset of fields)       |
| DELETE | `/api/notes/:id`              | Delete note                              |
| GET    | `/api/tags`                   | List user's tags                         |
| POST   | `/api/attachments/:noteId`    | Upload image (multipart `file`)          |
| DELETE | `/api/attachments/:id`        | Delete attachment                        |

## PWA installability

Run `npm run build` in `client/` and serve `dist/` over HTTPS. Lighthouse should give it the install prompt — the manifest, icons, and service worker are configured by `vite-plugin-pwa`. You'll need to drop your own `icon-192.png` and `icon-512.png` into `client/public/` before shipping.

## Production notes

- Move uploads to S3-compatible storage; the local-disk approach is dev-only.
- Put the JWT in an httpOnly cookie if you want to harden against XSS token theft. The current setup is a pragmatic default for an OAuth-redirect SPA.
- Tighten `cookie.secure: true` and `sameSite: 'none'` once you're behind HTTPS.
