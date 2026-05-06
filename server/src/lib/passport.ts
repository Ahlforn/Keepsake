import passport from 'passport';
import { Strategy as GitHubStrategy } from 'passport-github2';
import { prisma } from './prisma.js';

passport.serializeUser((user: any, done) => done(null, user.id));

passport.deserializeUser(async (id: string, done) => {
  try {
    const user = await prisma.user.findUnique({ where: { id } });
    done(null, user);
  } catch (err) {
    done(err as Error);
  }
});

passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID!,
      clientSecret: process.env.GITHUB_CLIENT_SECRET!,
      callbackURL: process.env.GITHUB_CALLBACK_URL!,
      scope: ['user:email'],
    },
    async (_accessToken: string, _refreshToken: string, profile: any, done: any) => {
      try {
        const githubId = String(profile.id);
        const email = profile.emails?.[0]?.value ?? null;
        const user = await prisma.user.upsert({
          where: { githubId },
          update: {
            username: profile.username ?? profile.displayName ?? 'user',
            email,
            avatarUrl: profile.photos?.[0]?.value ?? null,
          },
          create: {
            githubId,
            username: profile.username ?? profile.displayName ?? 'user',
            email,
            avatarUrl: profile.photos?.[0]?.value ?? null,
          },
        });
        done(null, user);
      } catch (err) {
        done(err);
      }
    },
  ),
);

export default passport;
