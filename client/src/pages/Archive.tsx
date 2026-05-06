import { useEffect, useState } from 'react';
import { api } from '../lib/api';
import type { Note } from '../types';
import NotesGrid from '../components/NotesGrid';
import NoteEditor from '../components/NoteEditor';

export default function Archive() {
  const [notes, setNotes] = useState<Note[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState<Note | null>(null);

  useEffect(() => {
    api.listNotes({ archived: true }).then((data) => {
      setNotes(data);
      setLoading(false);
    });
  }, []);

  const handleSaved = (note: Note) => {
    if (!note.archived) {
      setNotes((prev) => prev.filter((n) => n.id !== note.id));
    } else {
      setNotes((prev) => prev.map((n) => (n.id === note.id ? note : n)));
    }
  };

  const handleDeleted = (id: string) => {
    setNotes((prev) => prev.filter((n) => n.id !== id));
  };

  return (
    <div>
      <div className="text-center mb-10">
        <p className="text-[10px] uppercase tracking-[0.3em] text-muted mb-3">The vault</p>
        <h1 className="font-display text-4xl md:text-5xl font-medium tracking-tight italic">
          Archive
        </h1>
      </div>

      {loading ? (
        <p className="text-center text-muted">Loading…</p>
      ) : notes.length === 0 ? (
        <div className="text-center py-20">
          <p className="font-display text-xl italic text-muted">Empty.</p>
          <p className="text-sm text-muted mt-2">Archived notes live here.</p>
        </div>
      ) : (
        <NotesGrid notes={notes} onSelect={(n) => setEditing(n)} onUpdate={handleSaved} />
      )}

      {editing && (
        <NoteEditor
          note={editing}
          onClose={() => setEditing(null)}
          onSaved={handleSaved}
          onDeleted={handleDeleted}
        />
      )}
    </div>
  );
}
