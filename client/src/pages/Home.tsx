import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Note } from '../types';
import QuickCompose from '../components/QuickCompose';
import NotesGrid from '../components/NotesGrid';
import NoteEditor from '../components/NoteEditor';

export default function Home() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Note | null>(null);
  const [creating, setCreating] = useState(false);
  const [query, setQuery] = useState('');

  const load = async (q?: string) => {
    setLoading(true);
    try {
      const data = await api.listNotes({ archived: false, q });
      setNotes(data);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  useEffect(() => {
    const t = setTimeout(() => load(query || undefined), 250);
    return () => clearTimeout(t);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [query]);

  const handleSaved = (note: Note) => {
    setNotes((prev) => {
      const exists = prev.find((n) => n.id === note.id);
      const next = exists ? prev.map((n) => (n.id === note.id ? note : n)) : [note, ...prev];
      // Re-sort: pinned first, then by updatedAt desc
      return next.sort((a, b) => {
        if (a.pinned !== b.pinned) return a.pinned ? -1 : 1;
        return new Date(b.updatedAt).getTime() - new Date(a.updatedAt).getTime();
      });
    });
  };

  const handleDeleted = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div>
      <div className="text-center mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-3">Today</p>
        <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight">
          What's on your mind?
        </h1>
      </div>

      <QuickCompose onClick={() => setCreating(true)} />

      <div className="max-w-md mx-auto mb-10">
        <input
          type="search"
          value={query}
          onChange={(e) => setQuery(e.target.value)}
          placeholder="Search notes"
          className="w-full bg-transparent border-b border-ink/15 focus:border-accent outline-none py-2 text-sm placeholder:text-ink/40 transition-colors"
        />
      </div>

      {loading ? (
        <p className="text-center text-muted">Loading…</p>
      ) : notes.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-xl italic text-muted">Nothing yet.</p>
          <p className="text-sm text-muted mt-2">Your notes will appear here.</p>
        </div>
      ) : (
        <NotesGrid
          notes={notes}
          onSelect={(n) => setEditing(n)}
          onUpdate={handleSaved}
        />
      )}

      {(creating || editing) && (
        <NoteEditor
          note={editing}
          onClose={() => {
            setCreating(false);
            setEditing(null);
          }}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
