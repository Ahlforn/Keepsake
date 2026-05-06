import { Router } from 'express';
import passport from '../lib/passport.js';
import { signToken, requireAuth, type AuthedRequest } from '../middleware/auth.js';
import { prisma } from '../lib/prisma.js';

const router = Router();

router.get('/github', passport.authenticate('github', { scope: ['user:email'] }));

router.get(
  '/github/callback',
  passport.authenticate('github', { session: false, failureRedirect: '/login' }),
  (req, res) => {
    const user = req.user as { id: string };
    const token = signToken(user.id);
    const clientUrl = process.env.CLIENT_URL || 'http://localhost:5173';
    // Redirect with token as fragment so it isn't sent to servers/logged
    res.redirect(`${clientUrl}/auth/callback#token=${token}`);
  },
);

router.get('/me', requireAuth, async (req: AuthedRequest, res) => {
  const user = await prisma.user.findUnique({
    where: { id: req.userId! },
    select: { id: true, username: true, email: true, avatarUrl: true },
  });
  if (!user) return res.status(404).json({ error: 'Not found' });
  res.json(user);
});

export default router;
