import type { Note } from '../types';

interface Props {
  note: Note;
  onClick: () => void;
  onTogglePin: (e: React.MouseEvent) => void;
  onToggleArchive: (e: React.MouseEvent) => void;
}

export default function NoteCard({ note, onClick, onTogglePin, onToggleArchive }: Props) {
  const firstImage = note.attachments[0];
  return (
    <article
      onClick={onClick}
      className={`note-card color-${note.color} group cursor-pointer rounded-2xl shadow-card hover:shadow-cardHover overflow-hidden break-inside-avoid mb-4 border border-ink/5`}
    >
      {firstImage && (
        <img
          src={firstImage.url}
          alt=""
          className="w-full max-h-72 object-cover"
        />
      )}
      <div className="p-5">
        <div className="flex items-start justify-between gap-3 mb-2">
          {note.title && (
            <h3 className="font-display font-medium text-lg leading-snug tracking-tight flex-1">
              {note.title}
            </h3>
          )}
          <button
            onClick={onTogglePin}
            aria-label={note.pinned ? 'Unpin' : 'Pin'}
            className="opacity-0 group-hover:opacity-100 focus:opacity-100 transition-opacity text-ink/60 hover:text-accent"
          >
            {note.pinned ? '★' : '☆'}
          </button>
        </div>

        {note.content && (
          <p className="text-sm text-ink/80 whitespace-pre-wrap leading-relaxed line-clamp-[12]">
            {note.content}
          </p>
        )}

        {note.tags.length > 0 && (
          <div className="mt-4 flex flex-wrap gap-1.5">
            {note.tags.map((t) => (
              <span
                key={t.id}
                className="text-[11px] uppercase tracking-wider px-2 py-0.5 rounded-full bg-ink/8 text-ink/70"
              >
                {t.name}
              </span>
            ))}
          </div>
        )}

        <div className="mt-4 flex items-center justify-between text-xs text-muted opacity-0 group-hover:opacity-100 transition-opacity">
          <span>{new Date(note.updatedAt).toLocaleDateString()}</span>
          <button
            onClick={onToggleArchive}
            className="hover:text-ink transition-colors"
          >
            {note.archived ? 'Unarchive' : 'Archive'}
          </button>
        </div>
      </div>
    </article>
  );
}
