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

---

## Deployment

### Prerequisites

- Node.js 20+
- PostgreSQL 14+ accessible from the server
- A domain with HTTPS (required for PWA install and secure cookies)

### 1. Update your GitHub OAuth app

In your GitHub OAuth app settings, add production URLs:
- **Homepage URL:** `https://yourdomain.com`
- **Authorization callback URL:** `https://yourdomain.com/api/auth/github/callback`

### 2. Build the client

```bash
cd client
npm install
npm run build   # outputs to client/dist/
```

### 3. Build the server

```bash
cd server
npm install
npm run build   # compiles TypeScript to server/dist/
```

### 4. Configure production environment

Copy and edit the server env file:

```bash
cp server/.env.example server/.env
```

Update every value for production:

```
DATABASE_URL="postgresql://user:pass@host:5432/keepsake?schema=public"
PORT=4000
CLIENT_URL="https://yourdomain.com"

JWT_SECRET="<64+ random chars>"
SESSION_SECRET="<64+ random chars>"

GITHUB_CLIENT_ID="<your prod app id>"
GITHUB_CLIENT_SECRET="<your prod app secret>"
GITHUB_CALLBACK_URL="https://yourdomain.com/api/auth/github/callback"
```

Generate strong secrets with: `node -e "console.log(require('crypto').randomBytes(48).toString('hex'))"`

### 5. Run database migrations

```bash
cd server
npx prisma migrate deploy
```

Use `migrate deploy` (not `migrate dev`) in production — it applies pending migrations without generating new ones.

### 6. Start the server

```bash
cd server
node dist/index.js
```

For process management, use [PM2](https://pm2.keymetrics.io/):

```bash
npm install -g pm2
pm2 start dist/index.js --name keepsake --cwd server
pm2 save
pm2 startup   # follow the printed command to enable on reboot
```

### 7. Reverse proxy with nginx

Serve `client/dist/` as static files and proxy `/api` and `/uploads` to the Express server. Example config:

```nginx
server {
    listen 443 ssl;
    server_name yourdomain.com;

    # SSL config here (certbot/Let's Encrypt recommended)

    root /path/to/keepsake/client/dist;
    index index.html;

    # SPA fallback
    location / {
        try_files $uri $uri/ /index.html;
    }

    location /api/ {
        proxy_pass http://127.0.0.1:4000;
        proxy_set_header Host $host;
        proxy_set_header X-Real-IP $remote_addr;
    }

    location /uploads/ {
        proxy_pass http://127.0.0.1:4000;
    }
}

server {
    listen 80;
    server_name yourdomain.com;
    return 301 https://$host$request_uri;
}
```

### Production notes

- **Uploads:** The local-disk upload storage is dev-only. For production, move uploads to an S3-compatible store and update the multer configuration.
- **JWT security:** Consider moving the JWT from localStorage into an `httpOnly` cookie to harden against XSS token theft.
- **Cookies:** Set `cookie.secure: true` and `sameSite: 'none'` once running behind HTTPS.
- **PWA icons:** Drop `icon-192.png` and `icon-512.png` into `client/public/` before building — the service worker registration will fail without them.

---

## Containerized deployment (Docker + Traefik)

The repo ships with a `docker-compose.yml` that runs the full stack — PostgreSQL, the Express API, the React frontend (behind nginx), and Traefik as the edge proxy with automatic Let's Encrypt TLS.

```
internet → Traefik :443 → nginx (client) → Express (server) → PostgreSQL
                  :80  → redirect to HTTPS
```

Traefik provisions and renews the TLS certificate automatically via the ACME HTTP challenge. Uploads and database data are persisted in named Docker volumes.

### Prerequisites

- Docker and Docker Compose v2 installed on the host
- Ports 80 and 443 open and reachable from the internet (required for ACME HTTP challenge)
- A domain with its DNS A record pointed at the host

### 1. Update your GitHub OAuth app

In your GitHub OAuth app settings, set production URLs:
- **Homepage URL:** `https://yourdomain.com`
- **Authorization callback URL:** `https://yourdomain.com/api/auth/github/callback`

### 2. Configure environment

```bash
cp .env.example .env
```

Fill in every value:

```
DOMAIN=yourdomain.com
ACME_EMAIL=you@example.com

POSTGRES_PASSWORD=<strong random password>

JWT_SECRET=<64+ random chars>
SESSION_SECRET=<64+ random chars>

GITHUB_CLIENT_ID=<your prod app id>
GITHUB_CLIENT_SECRET=<your prod app secret>
```

Generate strong secrets with:
```bash
openssl rand -hex 32
```

`CLIENT_URL` and `GITHUB_CALLBACK_URL` are derived from `DOMAIN` automatically — no need to set them separately.

### 3. Build and start

```bash
docker compose up -d --build
```

On first run this will:
1. Pull base images and build the client and server images
2. Start PostgreSQL and wait for it to be healthy
3. Run `prisma migrate deploy` inside the server container
4. Obtain a TLS certificate from Let's Encrypt
5. Serve the app at `https://yourdomain.com`

### Useful commands

```bash
# View logs
docker compose logs -f

# Rebuild after a code change
docker compose up -d --build client   # or server

# Run a Prisma migration after a schema change
docker compose exec server node_modules/.bin/prisma migrate deploy

# Open a psql shell
docker compose exec db psql -U postgres keepsake

# Stop everything (data volumes are preserved)
docker compose down
```
