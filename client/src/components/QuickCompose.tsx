interface Props {
  onClick: () => void;
}

export default function QuickCompose({ onClick }: Props) {
  return (
    <button
      onClick={onClick}
      className="w-full max-w-2xl mx-auto block text-left bg-paper border border-ink/10 rounded-2xl shadow-card hover:shadow-cardHover hover:border-ink/20 transition-all px-6 py-5 mb-12"
    >
      <span className="text-muted italic font-display text-lg">Take a note…</span>
    </button>
  );
}
