import { Router } from 'express';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

router.get('/', async (req: AuthedRequest, res) => {
  const tags = await prisma.tag.findMany({
    where: { userId: req.userId! },
    orderBy: { name: 'asc' },
  });
  res.json(tags);
});

router.delete('/:id', async (req: AuthedRequest, res) => {
  const tag = await prisma.tag.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!tag) return res.status(404).json({ error: 'Not found' });
  await prisma.tag.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;
