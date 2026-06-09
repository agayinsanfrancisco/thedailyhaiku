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
      <h2 className="text-xl font-semibold text-gray-800 mb-2">
        {displayDate}
      </h2>
      <p className="text-sm text-gray-600 mb-4">
        Pick a pop culture event from this day as inspiration, or write your own.
      </p>

      {loading ? (
        <div className="space-y-3">
          {[1, 2, 3].map((i) => (
            <div key={i} className="h-20 bg-gray-100 rounded-lg animate-pulse" />
          ))}
        </div>
      ) : events.length === 0 ? (
        <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 text-blue-700 text-sm">
          No pop culture events found for this date. You can write your own inspiration below!
        </div>
      ) : (
        <div className="space-y-2 mb-4">
          {events.map((event) => (
            <button
              key={event.id}
              onClick={() => onSelectEvent(event.id)}
              className={`
                w-full text-left p-4 rounded-lg border-2 transition-all duration-150
                ${selectedEventId === event.id
                  ? "border-indigo-500 bg-indigo-50 shadow-sm"
                  : "border-gray-200 hover:border-gray-300 hover:bg-gray-50"
                }
              `}
            >
              <div className="flex items-start justify-between gap-2">
                <div className="flex-1">
                  <p className="font-medium text-gray-800">{event.title}</p>
                  {event.description && (
                    <p className="text-sm text-gray-500 mt-1">{event.description}</p>
                  )}
                </div>
                {event.categoryName && (
                  <span
                    className="text-xs font-medium px-2 py-1 rounded-full shrink-0"
                    style={{
                      backgroundColor: event.categoryColor
                        ? `${event.categoryColor}20`
                        : "#e5e7eb",
                      color: event.categoryColor ?? "#374151",
                    }}
                  >
                    {event.categoryName}
                  </span>
                )}
              </div>
            </button>
          ))}
        </div>
      )}

      <div>
        <label className="block text-sm font-medium text-gray-700 mb-1">
          Or write your own event title / inspiration
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
          className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-indigo-500 focus:border-transparent"
        />
      </div>
    </div>
  );
}
