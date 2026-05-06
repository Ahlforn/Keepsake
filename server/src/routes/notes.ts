import { Router } from 'express';
import { z } from 'zod';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const NoteInput = z.object({
  title: z.string().max(500).optional(),
  content: z.string().optional(),
  color: z.string().max(32).optional(),
  pinned: z.boolean().optional(),
  archived: z.boolean().optional(),
  tags: z.array(z.string().min(1).max(64)).optional(),
});

const includeRelations = {
  tags: true,
  attachments: true,
};

// LIST — supports ?archived=true and ?q=search
router.get('/', async (req: AuthedRequest, res) => {
  const archived = req.query.archived === 'true';
  const q = typeof req.query.q === 'string' ? req.query.q : undefined;
  const notes = await prisma.note.findMany({
    where: {
      userId: req.userId!,
      archived,
      ...(q
        ? {
            OR: [
              { title: { contains: q, mode: 'insensitive' } },
              { content: { contains: q, mode: 'insensitive' } },
            ],
          }
        : {}),
    },
    include: includeRelations,
    orderBy: [{ pinned: 'desc' }, { updatedAt: 'desc' }],
  });
  res.json(notes);
});

// CREATE
router.post('/', async (req: AuthedRequest, res) => {
  const parsed = NoteInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const { tags, ...data } = parsed.data;
  const note = await prisma.note.create({
    data: {
      ...data,
      userId: req.userId!,
      tags: tags
        ? {
            connectOrCreate: tags.map((name) => ({
              where: { userId_name: { userId: req.userId!, name } },
              create: { name, userId: req.userId! },
            })),
          }
        : undefined,
    },
    include: includeRelations,
  });
  res.status(201).json(note);
});

// UPDATE
router.patch('/:id', async (req: AuthedRequest, res) => {
  const parsed = NoteInput.safeParse(req.body);
  if (!parsed.success) return res.status(400).json({ error: parsed.error.flatten() });
  const existing = await prisma.note.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!existing) return res.status(404).json({ error: 'Not found' });

  const { tags, ...data } = parsed.data;
  const note = await prisma.note.update({
    where: { id: req.params.id },
    data: {
      ...data,
      ...(tags !== undefined
        ? {
            tags: {
              set: [],
              connectOrCreate: tags.map((name) => ({
                where: { userId_name: { userId: req.userId!, name } },
                create: { name, userId: req.userId! },
              })),
            },
          }
        : {}),
    },
    include: includeRelations,
  });
  res.json(note);
});

// DELETE
router.delete('/:id', async (req: AuthedRequest, res) => {
  const existing = await prisma.note.findFirst({
    where: { id: req.params.id, userId: req.userId! },
  });
  if (!existing) return res.status(404).json({ error: 'Not found' });
  await prisma.note.delete({ where: { id: req.params.id } });
  res.status(204).end();
});

export default router;
