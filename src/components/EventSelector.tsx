"use client";

interface EventItem {
  id: number;
  month: number;
  day: number;
  year: number | null;
  title: string;
  description: string | null;
  categoryName: string | null;
  categoryColor: string | null;
}

interface EventSelectorProps {
  date: string;
  events: EventItem[];
  loading: boolean;
  selectedEventId: number | null;
  onSelectEvent: (id: number | null) => void;
  customTitle: string;
  onCustomTitleChange: (title: string) => void;
}

export default function EventSelector({
  date,
  events,
  loading,
  selectedEventId,
  onSelectEvent,
  customTitle,
  onCustomTitleChange,
}: EventSelectorProps) {
  const [month, day] = date.split("-");
  const dateObj = new Date(parseInt(month) - 1, parseInt(day));
  const displayDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  return (
    <div>
      <p className="text-xs text-[var(--ink-muted)] font-[system-ui] tracking-widest uppercase mb-2">
        {displayDate}
      </p>
      <h2 className="text-xl font-serif mb-4">Choose Your Inspiration</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--surface)]" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="border border-[var(--rule)] p-4 text-sm text-[var(--ink-muted)] mb-6">
          No pop culture events found for this date. You can write your own inspiration below.
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => onSelectEvent(event.id)}
              className={`
                w-full text-left p-4 border transition-colors
                ${selectedEventId === event.id
                  ? "border-[var(--accent)] bg-[var(--surface)]"
                  : "border-[var(--rule)] hover:border-[var(--ink-muted)]"
                }
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="font-serif text-sm text-[var(--ink)]">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-[var(--ink-muted)] mt-1 leading-relaxed">{event.description}</p>
                  )}
                </div>
                {event.categoryName && (
                  <span className="text-[10px] font-[system-ui] text-[var(--accent)] shrink-0 mt-0.5">
                    {event.categoryName}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div>
        <label className="block text-xs font-[system-ui] text-[var(--ink-muted)] mb-1.5">
          Or write your own inspiration
        </label>
        <input
          type="text"
          value={customTitle}
          onChange={(e) => {
            onCustomTitleChange(e.target.value);
            if (e.target.value.trim()) {
              onSelectEvent(null);
            }
          }}
          placeholder="e.g., My own story about this day..."
          className="w-full px-3 py-2 border border-[var(--rule)] text-sm bg-transparent focus:outline-none focus:border-[var(--ink)] transition-colors placeholder:text-[var(--accent-dim)]"
        />
      </div>
    </div>
  );
}
