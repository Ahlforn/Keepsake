# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## Project

Keepsake is a Google Keep-inspired note-taking PWA. Two independent packages (`client/` and `server/`) with no shared code between them.

## Commands

### Server (`cd server`)
- `npm run dev` — Start Express API with hot reload (tsx watch), serves on `:4000`
- `npm run build` — TypeScript compile to `dist/`
- `npm run prisma:migrate` — Run Prisma migrations (`prisma migrate dev`)
- `npm run prisma:generate` — Regenerate Prisma client after schema changes
- `npm run prisma:studio` — Open Prisma Studio GUI

### Client (`cd client`)
- `npm run dev` — Start Vite dev server on `:5173`
- `npm run build` — TypeScript check + Vite production build

No test runner or linter is configured.

## Architecture

**Client:** React 18 + TypeScript + Vite + Tailwind + SCSS. React Router for navigation, Context API for auth state. `vite-plugin-pwa` provides service worker with NetworkFirst caching for `/api/` and CacheFirst for `/uploads/`. Vite dev server proxies `/api` and `/uploads` to the backend.

**Server:** Express + TypeScript. Prisma ORM on PostgreSQL. GitHub OAuth2 via Passport.js, issues JWT on callback. Multer handles image uploads (5MB limit, images only) stored locally in `/uploads`.

**Auth flow:** GitHub OAuth → server issues JWT → redirects to client with token in URL fragment → client stores in localStorage → Bearer token on all API requests.

**API routes:** `/api/auth/*` (OAuth + current user), `/api/notes` (CRUD + search via `?q=`), `/api/tags`, `/api/attachments/:noteId` (upload/delete).

## Database

PostgreSQL with Prisma. Schema at `server/prisma/schema.prisma`. Four models: User, Note, Tag, Attachment. Tags are per-user (unique on `[userId, name]`). Notes have a composite index on `[userId, archived, pinned]`. All deletes cascade from parent.

After changing the schema: run `npm run prisma:migrate` then `npm run prisma:generate`.

## Environment

Server requires `server/.env` (copy from `.env.example`). Key vars: `DATABASE_URL`, `JWT_SECRET`, `SESSION_SECRET`, `GITHUB_CLIENT_ID`, `GITHUB_CLIENT_SECRET`. Default database URL: `postgresql://postgres:postgres@localhost:5432/keepsake`.

## Conventions

- Zod for request body validation on the server side.
- Note colors are a fixed set: `default`, `rose`, `amber`, `sage`, `sky`, `lilac`, `stone` (defined in `client/src/lib/colors.ts`).
- Client API calls go through `client/src/lib/api.ts` which attaches the Bearer token.
