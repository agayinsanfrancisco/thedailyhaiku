"use client";

import { useState, useEffect, use } from "react";
import { useRouter } from "next/navigation";
import EventSelector from "@/components/EventSelector";
import HaikuBuilder from "@/components/HaikuBuilder";

export default function WriteDatePage({
  params,
}: {
  params: Promise<{ date: string }>;
}) {
  const { date } = use(params);
  const router = useRouter();

  const [events, setEvents] = useState<Array<{ id: number; month: number; day: number; year: number | null; title: string; description: string | null; categoryName: string | null; categoryColor: string | null }>>([]);
  const [eventsLoading, setEventsLoading] = useState(true);
  const [selectedEventId, setSelectedEventId] = useState<number | null>(null);
  const [customTitle, setCustomTitle] = useState("");
  const [categories, setCategories] = useState<Array<{ id: number; name: string; slug: string; color: string }>>([]);
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState<string | null>(null);
  const [showBuilder, setShowBuilder] = useState(false);

  useEffect(() => {
    async function loadData() {
      const [eventsRes, catsRes] = await Promise.all([
        fetch(`/api/events?date=${date}`),
        fetch(`/api/categories`),
      ]);
      const eventsData = await eventsRes.json();
      const catsData = await catsRes.json();
      setEvents(eventsData.events ?? []);
      setCategories(catsData.categories ?? []);
      setEventsLoading(false);
    }
    loadData();
  }, [date]);

  const handleSubmit = async (data: {
    line1: string;
    line2: string;
    line3: string;
    title: string;
    categoryId: number | null;
    authorName: string;
    authorEmail: string;
  }) => {
    setIsSubmitting(true);
    setSubmitError(null);

    try {
      const res = await fetch("/api/haikus", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          date,
          line1: data.line1,
          line2: data.line2,
          line3: data.line3,
          title: data.title,
          categoryId: data.categoryId,
          eventId: selectedEventId,
          customEventTitle: customTitle || null,
          authorName: data.authorName,
          authorEmail: data.authorEmail,
        }),
      });

      const result = await res.json();

      if (!res.ok) {
        setSubmitError(result.error || "Something went wrong");
        if (result.counts) {
          setSubmitError(
            `Syllable counts: ${result.counts[0]}-${result.counts[1]}-${result.counts[2]}. Need 5-7-5.`,
          );
        }
        setIsSubmitting(false);
        return;
      }

      router.push(`/haiku/${result.haiku.id}`);
    } catch {
      setSubmitError("Network error. Please try again.");
      setIsSubmitting(false);
    }
  };

  return (
    <article className="max-w-2xl mx-auto px-6 pt-16">
      <button
        onClick={() => router.push("/write")}
        className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors mb-6 font-[system-ui]"
      >
        &larr; Back to calendar
      </button>

      {!showBuilder ? (
        <div className="space-y-6">
          <EventSelector
            date={date}
            events={events}
            loading={eventsLoading}
            selectedEventId={selectedEventId}
            onSelectEvent={setSelectedEventId}
            customTitle={customTitle}
            onCustomTitleChange={setCustomTitle}
          />
          <button
            onClick={() => setShowBuilder(true)}
            disabled={selectedEventId === null && !customTitle.trim()}
            className={`
              w-full py-3 text-sm font-[system-ui] tracking-wider uppercase border-2 transition-colors
              ${selectedEventId !== null || customTitle.trim()
                ? "border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)]"
                : "border-[var(--accent-dim)] text-[var(--accent-dim)] cursor-not-allowed"
              }
            `}
          >
            Continue to Haiku Builder
          </button>
        </div>
      ) : (
        <div>
          <div className="border border-[var(--accent)] bg-[var(--surface)] px-4 py-3 mb-6 flex items-center justify-between">
            <span className="text-sm text-[var(--ink)]">
              Inspired by:{" "}
              <strong className="text-[var(--accent)]">
                {selectedEventId
                  ? events.find((e) => e.id === selectedEventId)?.title
                  : customTitle}
              </strong>
            </span>
            <button
              onClick={() => setShowBuilder(false)}
              className="text-xs text-[var(--ink-muted)] underline hover:text-[var(--ink)]"
            >
              Change
            </button>
          </div>

          <HaikuBuilder
            categories={categories}
            onSubmit={handleSubmit}
            isSubmitting={isSubmitting}
            submitError={submitError}
          />
        </div>
      )}
    </article>
  );
}
