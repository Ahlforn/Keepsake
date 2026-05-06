import { Router } from 'express';
import multer from 'multer';
import path from 'node:path';
import fs from 'node:fs';
import { randomUUID } from 'node:crypto';
import { prisma } from '../lib/prisma.js';
import { requireAuth, type AuthedRequest } from '../middleware/auth.js';

const router = Router();
router.use(requireAuth);

const UPLOAD_DIR = path.resolve(process.cwd(), 'uploads');
fs.mkdirSync(UPLOAD_DIR, { recursive: true });

const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, UPLOAD_DIR),
  filename: (_req, file, cb) => {
    const ext = path.extname(file.originalname).toLowerCase();
    cb(null, `${randomUUID()}${ext}`);
  },
});

const upload = multer({
  storage,
  limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
  fileFilter: (_req, file, cb) => {
    if (!file.mimetype.startsWith('image/')) {
      return cb(new Error('Only image uploads allowed'));
    }
    cb(null, true);
  },
});

router.post('/:noteId', upload.single('file'), async (req: AuthedRequest, res) => {
  if (!req.file) return res.status(400).json({ error: 'No file' });
  const note = await prisma.note.findFirst({
    where: { id: req.params.noteId, userId: req.userId! },
  });
  if (!note) {
    fs.unlink(req.file.path, () => {});
    return res.status(404).json({ error: 'Note not found' });
  }
  const attachment = await prisma.attachment.create({
    data: {
      noteId: note.id,
      filename: req.file.originalname,
      mimeType: req.file.mimetype,
      url: `/uploads/${path.basename(req.file.path)}`,
    },
  });
  res.status(201).json(attachment);
});

router.delete('/:id', async (req: AuthedRequest, res) => {
  const attachment = await prisma.attachment.findFirst({
    where: { id: req.params.id, note: { userId: req.userId! } },
  });
  if (!attachment) return res.status(404).json({ error: 'Not found' });
  const filePath = path.join(UPLOAD_DIR, path.basename(attachment.url));
  fs.unlink(filePath, () => {});
  await prisma.attachment.delete({ where: { id: attachment.id } });
  res.status(204).end();
});

export default router;
