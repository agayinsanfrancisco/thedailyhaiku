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
  validationLink: string;
  onValidationLinkChange: (link: string) => void;
  validationStatus: "idle" | "validating" | "valid" | "invalid";
  onValidate: () => void;
  onChooseFiller: () => void;
}

export default function EventSelector({
  date,
  events,
  loading,
  selectedEventId,
  onSelectEvent,
  validationLink,
  onValidationLinkChange,
  validationStatus,
  onValidate,
  onChooseFiller,
}: EventSelectorProps) {
  const [month, day] = date.split("-");
  const dateObj = new Date(parseInt(month) - 1, parseInt(day));
  const displayDate = dateObj.toLocaleDateString("en-US", { month: "long", day: "numeric" });

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <div>
      <p className="text-xs text-[var(--ink-muted)] tracking-widest uppercase mb-2">
        {displayDate}
      </p>
      <h2 className="text-xl mb-6">Choose Your Inspiration</h2>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-16 bg-[var(--surface)] animate-pulse" />
          ))}
        </div>
      ) : (
        <div className="space-y-2 mb-6">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => {
                onSelectEvent(event.id);
                onValidationLinkChange("");
              }}
              className={`
                w-full text-left p-4 border transition-all
                ${selectedEventId === event.id
                  ? "border-[var(--accent)] bg-[var(--accent-light)]"
                  : "border-[var(--rule)] hover:border-[var(--ink-muted)]"
                }
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1 min-w-0">
                  <p className="text-sm text-[var(--ink)]">{event.title}</p>
                  {event.description && (
                    <p className="text-xs text-[var(--ink-muted)] mt-0.5 leading-relaxed">{event.description}</p>
                  )}
                  {event.year && (
                    <p className="text-[11px] text-[var(--accent-muted)] mt-0.5">{event.year}</p>
                  )}
                </div>
                {event.categoryName && (
                  <span className="text-[10px] text-[var(--accent)] shrink-0 mt-0.5">
                    {event.categoryName}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      {selectedEvent && (
        <div className="border border-[var(--rule)] p-4 space-y-3 mb-6">
          <p className="text-xs text-[var(--ink-muted)]">
            Provide a source link to validate this event:
          </p>
          <div className="flex gap-2">
            <input
              type="url"
              value={validationLink}
              onChange={(e) => onValidationLinkChange(e.target.value)}
              placeholder="https://..."
              className="flex-1 px-3 py-2 border border-[var(--rule)] text-sm bg-transparent focus:outline-none focus:border-[var(--ink)] transition-colors placeholder:text-[var(--accent-light)]"
              disabled={validationStatus === "validating" || validationStatus === "valid"}
            />
            <button
              onClick={onValidate}
              disabled={!validationLink.trim() || validationStatus === "validating" || validationStatus === "valid"}
              className={`
                px-4 py-2 text-sm border transition-colors whitespace-nowrap
                ${validationStatus === "valid"
                  ? "border-[var(--accent)] text-[var(--accent)] bg-[var(--accent-light)]"
                  : validationStatus === "validating"
                  ? "border-[var(--ink-muted)] text-[var(--ink-muted)] cursor-wait"
                  : "border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                }
                disabled:opacity-50 disabled:cursor-not-allowed
              `}
            >
              {validationStatus === "valid"
                ? "Validated"
                : validationStatus === "validating"
                ? "Checking..."
                : "Validate"}
            </button>
          </div>
          {validationStatus === "invalid" && (
            <p className="text-xs text-[var(--ink-muted)]">
              The link doesn&rsquo;t match this event. Try a different source.
            </p>
          )}
        </div>
      )}

      <div className="border-t border-[var(--rule)] pt-4">
        <button
          onClick={onChooseFiller}
          className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors underline underline-offset-2"
        >
          Skip inspiration &mdash; write a general haiku
        </button>
      </div>
    </div>
  );
}
