import 'dotenv/config';
import express from 'express';
import cors from 'cors';
import compression from 'compression';
import session from 'express-session';
import connectPgSimple from 'connect-pg-simple';
import path from 'node:path';
import passport from './lib/passport.js';
import authRoutes from './routes/auth.js';
import notesRoutes from './routes/notes.js';
import tagsRoutes from './routes/tags.js';
import attachmentsRoutes from './routes/attachments.js';

const app = express();
const PORT = Number(process.env.PORT) || 4000;

app.set('trust proxy', 1);
app.use(compression());

if (process.env.CORS_ORIGIN) {
  app.use(cors({ origin: process.env.CORS_ORIGIN, credentials: true }));
}

app.use(express.json({ limit: '1mb' }));
const PgSession = connectPgSimple(session);

app.use(
  session({
    store: new PgSession({
      conString: process.env.DATABASE_URL,
      createTableIfMissing: true,
    }),
    secret: process.env.SESSION_SECRET || 'dev-session-secret',
    resave: false,
    saveUninitialized: false,
    cookie: { httpOnly: true, sameSite: 'lax', secure: process.env.NODE_ENV === 'production' },
  }),
);
app.use(passport.initialize());
app.use(passport.session());

// Static uploads
app.use('/uploads', express.static(path.resolve(process.cwd(), 'uploads')));

app.get('/api/health', (_req, res) => res.json({ ok: true }));

app.use('/api/auth', authRoutes);
app.use('/api/notes', notesRoutes);
app.use('/api/tags', tagsRoutes);
app.use('/api/attachments', attachmentsRoutes);

// Serve compiled SPA in production
if (process.env.NODE_ENV === 'production') {
  const clientDist = path.resolve(process.cwd(), process.env.CLIENT_DIST_DIR ?? './client-dist');

  // Hashed Vite assets — long-lived immutable cache
  app.use('/assets', express.static(path.join(clientDist, 'assets'), { maxAge: '1y', immutable: true }));

  // Other static files (manifest, sw, workbox, favicon) — short cache, no automatic index
  app.use(express.static(clientDist, { maxAge: '1h', index: false }));

  // SPA fallback — always serve index.html for non-API, non-upload paths
  app.get('*', (req, res, next) => {
    if (req.path.startsWith('/api') || req.path.startsWith('/uploads')) return next();
    res.set('Cache-Control', 'no-cache');
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

// Error handler
app.use((err: Error, _req: express.Request, res: express.Response, _next: express.NextFunction) => {
  console.error(err);
  res.status(500).json({ error: err.message || 'Server error' });
});

app.listen(PORT, () => {
  console.log(`✓ Keepsake API running at http://localhost:${PORT}`);
});
