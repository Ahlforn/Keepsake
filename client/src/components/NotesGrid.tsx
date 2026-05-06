import type { Note } from '../types';
import NoteCard from './NoteCard';

interface Props {
  notes: Note[];
  onSelect: (note: Note) => void;
  onUpdate: (note: Note) => void;
}

export default function NotesGrid({ notes, onSelect, onUpdate }: Props) {
  const pinned = notes.filter((n) => n.pinned);
  const others = notes.filter((n) => !n.pinned);

  const togglePin = async (n: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    const { api } = await import('../lib/api');
    const updated = await api.updateNote(n.id, { pinned: !n.pinned });
    onUpdate(updated);
  };

  const toggleArchive = async (n: Note, e: React.MouseEvent) => {
    e.stopPropagation();
    const { api } = await import('../lib/api');
    const updated = await api.updateNote(n.id, { archived: !n.archived });
    onUpdate(updated);
  };

  const renderGrid = (items: Note[]) => (
    <div className="columns-1 sm:columns-2 lg:columns-3 gap-4">
      {items.map((n) => (
        <NoteCard
          key={n.id}
          note={n}
          onClick={() => onSelect(n)}
          onTogglePin={(e) => togglePin(n, e)}
          onToggleArchive={(e) => toggleArchive(n, e)}
        />
      ))}
    </div>
  );

  return (
    <div className="space-y-10">
      {pinned.length > 0 && (
        <section>
          <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted mb-4">Pinned</h2>
          {renderGrid(pinned)}
        </section>
      )}
      {others.length > 0 && (
        <section>
          {pinned.length > 0 && (
            <h2 className="text-[10px] uppercase tracking-[0.3em] text-muted mb-4">Others</h2>
          )}
          {renderGrid(others)}
        </section>
      )}
    </div>
  );
}
