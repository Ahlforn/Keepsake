# Keepsake

A personal note-taking PWA in the spirit of Google Keep. Paper-textured, offline-capable, and sign-in gated via GitHub OAuth.

Notes can be colour-tinted, pinned, archived, tagged, and searched. Images can be attached. The service worker keeps the app shell and recent API responses available offline.

**Stack:** React 18 + Vite + Tailwind + SCSS on the client; Node.js + Express + Prisma + PostgreSQL on the server. Auth is GitHub OAuth2 via Passport, issuing a JWT that the client stores in localStorage.

```
keepsake/
├── client/    React PWA (Vite build, vite-plugin-pwa)
└── server/    Express API + static file server (TypeScript, Prisma)
```

---

## Development

In development, `vite build --watch` keeps `client/dist` up to date and Express serves it directly — the same way it works in production. There is no separate Vite dev server and no HMR; after editing client code, wait for the watcher to finish its rebuild (~2 s) and reload the browser.

### Prerequisites

- Node.js 20+
- A running PostgreSQL instance (quickest with Docker):

  ```bash
  docker run -d --name keepsake-pg \
    -e POSTGRES_PASSWORD=postgres \
    -e POSTGRES_DB=keepsake \
    -p 5432:5432 postgres:16
  ```

- A GitHub OAuth app (create at <https://github.com/settings/developers>):
  - **Homepage URL:** `http://localhost:4000`
  - **Authorization callback URL:** `http://localhost:4000/api/auth/github/callback`

### Setup

**1. Install dependencies**

```bash
npm install              # root (installs concurrently)
cd client && npm install
cd ../server && npm install
```

**2. Configure the server**

```bash
cp server/.env.example server/.env
```

Fill in `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`, and set strong values for `JWT_SECRET` and `SESSION_SECRET`. Leave `DATABASE_URL` as-is if you used the Docker command above.

**3. Run database migrations**

```bash
cd server && npx prisma migrate dev --name init
```

**4. Start**

```bash
npm run dev    # from the repo root
```

Both processes start together. The `client` pane shows a build complete message after a few seconds. Open **http://localhost:4000**.

---

## Deployment

### Option 1 — Docker + Traefik (recommended)

The repo ships with a `docker-compose.yml` that runs the full stack behind Traefik, which handles HTTPS automatically via Let's Encrypt.

```
internet → Traefik :443 → Express :4000 → PostgreSQL
                  :80  → redirect to HTTPS
```

**Prerequisites:**
- Docker and Docker Compose v2
- Ports 80 and 443 open to the internet
- A domain with its DNS A record pointing at the host

**1. Update your GitHub OAuth app**

Add your production domain:
- **Homepage URL:** `https://yourdomain.com`
- **Authorization callback URL:** `https://yourdomain.com/api/auth/github/callback`

**2. Configure environment**

```bash
cp .env.example .env
```

```
DOMAIN=yourdomain.com
ACME_EMAIL=you@example.com

POSTGRES_PASSWORD=<strong password>

JWT_SECRET=<64+ random chars>
SESSION_SECRET=<64+ random chars>

GITHUB_CLIENT_ID=<prod app id>
GITHUB_CLIENT_SECRET=<prod app secret>
```

Generate secrets: `openssl rand -hex 32`

**3. Build and start**

```bash
docker compose up -d --build
```

On first run this builds both packages into a single image, applies database migrations, obtains a TLS certificate, and starts serving at `https://yourdomain.com`.

**Useful commands:**

```bash
docker compose logs -f                                            # stream logs
docker compose up -d --build server                              # rebuild after a code change
docker compose exec server node_modules/.bin/prisma migrate deploy  # apply new migrations
docker compose exec db psql -U postgres keepsake                 # psql shell
docker compose down                                              # stop (volumes preserved)
```

---

### Option 2 — Manual

**1. Update your GitHub OAuth app** (same as above, with your production domain)

**2. Build**

```bash
npm run build    # from the repo root — builds client/dist then server/dist
```

**3. Configure the server**

```bash
cp server/.env.example server/.env
```

```
DATABASE_URL="postgresql://user:pass@host:5432/keepsake"
NODE_ENV=production
PORT=4000

JWT_SECRET="<64+ random chars>"
SESSION_SECRET="<64+ random chars>"

GITHUB_CLIENT_ID="<prod app id>"
GITHUB_CLIENT_SECRET="<prod app secret>"
GITHUB_CALLBACK_URL="https://yourdomain.com/api/auth/github/callback"
```

**4. Apply database migrations**

```bash
cd server && npx prisma migrate deploy
```

**5. Start**

```bash
cd server && node dist/index.js
```

Express serves the SPA at `/`, the API at `/api/*`, and uploads at `/uploads/*`. A catch-all fallback returns `index.html` for any path that is not an API or upload route, so client-side navigation works correctly.

For process management, use [PM2](https://pm2.keymetrics.io/):

```bash
npm install -g pm2
pm2 start dist/index.js --name keepsake --cwd server
pm2 save && pm2 startup
```

---

## Production notes

- **HTTPS is required** for PWA install prompts and for `secure` session cookies.
- **PWA icons:** place `icon-192.png` and `icon-512.png` in `client/public/` before building. The service worker registration will fail without them.
- **Uploads** are stored on local disk under `server/uploads/`. For a multi-instance or ephemeral deployment, move uploads to S3-compatible object storage and update the multer configuration.
- **JWT storage:** tokens currently live in `localStorage`. For stronger XSS protection, consider moving to an `httpOnly` cookie.

---

## API

| Method | Path | Notes |
|--------|------|-------|
| GET | `/api/auth/github` | Start OAuth flow |
| GET | `/api/auth/github/callback` | OAuth callback — redirects to client with JWT |
| GET | `/api/auth/me` | Current user (Bearer token required) |
| GET | `/api/notes?archived=&q=` | List notes for authenticated user |
| POST | `/api/notes` | Create note |
| PATCH | `/api/notes/:id` | Update note (any subset of fields) |
| DELETE | `/api/notes/:id` | Delete note |
| GET | `/api/tags` | List user's tags |
| POST | `/api/attachments/:noteId` | Upload image (multipart `file` field) |
| DELETE | `/api/attachments/:id` | Delete attachment |
