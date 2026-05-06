import { useEffect, useRef, useState } from 'react';
import type { Note, NoteColor } from '../types';
import { COLORS } from '../lib/colors';
import { api } from '../lib/api';

interface Props {
  note: Note | null; // null = creating new
  onClose: () => void;
  onSaved: (note: Note) => void;
  onDeleted?: (id: string) => void;
}

export default function NoteEditor({ note, onClose, onSaved, onDeleted }: Props) {
  const [title, setTitle] = useState(note?.title ?? '');
  const [content, setContent] = useState(note?.content ?? '');
  const [color, setColor] = useState<NoteColor>(note?.color ?? 'default');
  const [tags, setTags] = useState<string[]>(note?.tags.map((t) => t.name) ?? []);
  const [tagInput, setTagInput] = useState('');
  const [attachments, setAttachments] = useState(note?.attachments ?? []);
  const [saving, setSaving] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const titleRef = useRef<HTMLInputElement>(null);

  useEffect(() => {
    if (!note) titleRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') handleSave();
    };
    document.addEventListener('keydown', onKey);
    return () => document.removeEventListener('keydown', onKey);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const addTag = () => {
    const t = tagInput.trim();
    if (t && !tags.includes(t)) setTags([...tags, t]);
    setTagInput('');
  };

  const handleSave = async () => {
    // Don't save empty new notes
    if (!note && !title.trim() && !content.trim() && attachments.length === 0) {
      onClose();
      return;
    }
    setSaving(true);
    try {
      const payload = { title, content, color, tags };
      const saved = note
        ? await api.updateNote(note.id, payload)
        : await api.createNote(payload);
      onSaved(saved);
      onClose();
    } catch (err) {
      console.error(err);
      alert('Failed to save note');
    } finally {
      setSaving(false);
    }
  };

  const handleDelete = async () => {
    if (!note || !onDeleted) return;
    if (!confirm('Delete this note?')) return;
    await api.deleteNote(note.id);
    onDeleted(note.id);
    onClose();
  };

  const handleFile = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;
    // Need a saved note to attach to — save first if new
    let targetId = note?.id;
    if (!targetId) {
      const created = await api.createNote({ title, content, color, tags });
      targetId = created.id;
      onSaved(created);
    }
    const att = await api.uploadAttachment(targetId!, file);
    setAttachments((prev) => [...prev, att]);
  };

  const removeAttachment = async (id: string) => {
    await api.deleteAttachment(id);
    setAttachments((prev) => prev.filter((a) => a.id !== id));
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-start justify-center px-4 py-12 overflow-y-auto bg-ink/40 backdrop-blur-sm"
      onClick={handleSave}
    >
      <div
        className={`color-${color} w-full max-w-2xl rounded-2xl shadow-cardHover border border-ink/10 overflow-hidden`}
        onClick={(e) => e.stopPropagation()}
      >
        {attachments.length > 0 && (
          <div className="grid grid-cols-2 gap-1 p-1">
            {attachments.map((a) => (
              <div key={a.id} className="relative group">
                <img src={a.url} alt="" className="w-full h-40 object-cover rounded" />
                <button
                  onClick={() => removeAttachment(a.id)}
                  className="absolute top-2 right-2 bg-ink/70 text-paper text-xs rounded-full w-6 h-6 opacity-0 group-hover:opacity-100 transition-opacity"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        )}

        <div className="p-6">
          <input
            ref={titleRef}
            type="text"
            placeholder="Title"
            value={title}
            onChange={(e) => setTitle(e.target.value)}
            className="w-full bg-transparent font-display text-2xl font-medium tracking-tight outline-none placeholder:text-ink/30"
          />
          <textarea
            placeholder="Take a note…"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            rows={8}
            className="mt-4 w-full bg-transparent resize-none outline-none placeholder:text-ink/30 leading-relaxed"
          />

          <div className="mt-4 flex flex-wrap gap-1.5 items-center">
            {tags.map((t) => (
              <span
                key={t}
                className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-ink/10 text-ink/70 flex items-center gap-1"
              >
                {t}
                <button onClick={() => setTags(tags.filter((x) => x !== t))} className="hover:text-accent">×</button>
              </span>
            ))}
            <input
              type="text"
              value={tagInput}
              onChange={(e) => setTagInput(e.target.value)}
              onKeyDown={(e) => {
                if (e.key === 'Enter' || e.key === ',') {
                  e.preventDefault();
                  addTag();
                }
              }}
              placeholder="+ tag"
              className="bg-transparent text-xs outline-none placeholder:text-ink/40 w-20"
            />
          </div>
        </div>

        <div className="px-4 py-3 border-t border-ink/10 flex items-center gap-1 flex-wrap">
          {COLORS.map((c) => (
            <button
              key={c.value}
              onClick={() => setColor(c.value)}
              aria-label={c.label}
              className={`w-7 h-7 rounded-full border-2 transition-transform hover:scale-110 ${
                color === c.value ? 'border-ink' : 'border-ink/15'
              }`}
              style={{ background: c.swatch }}
            />
          ))}
          <div className="ml-auto flex items-center gap-1">
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              onChange={handleFile}
              className="hidden"
            />
            <button
              onClick={() => fileInputRef.current?.click()}
              className="text-xs px-3 py-1.5 rounded-full hover:bg-ink/8 transition-colors"
            >
              + image
            </button>
            {note && onDeleted && (
              <button
                onClick={handleDelete}
                className="text-xs px-3 py-1.5 rounded-full hover:bg-ink/8 text-muted hover:text-accent transition-colors"
              >
                Delete
              </button>
            )}
            <button
              onClick={handleSave}
              disabled={saving}
              className="text-xs px-4 py-1.5 rounded-full bg-ink text-paper hover:bg-ink/90 transition-colors disabled:opacity-50"
            >
              {saving ? 'Saving…' : 'Done'}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
