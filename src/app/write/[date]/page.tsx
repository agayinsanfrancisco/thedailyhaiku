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
  const [validationLink, setValidationLink] = useState("");
  const [validationStatus, setValidationStatus] = useState<"idle" | "validating" | "valid" | "invalid">("idle");
  const [validatedData, setValidatedData] = useState<{ headline?: string; description?: string; sources?: string[] } | null>(null);
  const [isFiller, setIsFiller] = useState(false);
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

  const handleValidate = async () => {
    const event = events.find((e) => e.id === selectedEventId);
    if (!event || !validationLink.trim()) return;

    setValidationStatus("validating");
    try {
      const res = await fetch("/api/validate-event", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          eventTitle: event.title,
          date,
          link: validationLink.trim(),
        }),
      });
      const result = await res.json();
      if (result.valid) {
        setValidationStatus("valid");
        setValidatedData({
          headline: result.headline,
          description: result.description,
          sources: result.sources,
        });
      } else {
        setValidationStatus("invalid");
      }
    } catch {
      setValidationStatus("invalid");
    }
  };

  const handleChooseFiller = () => {
    setIsFiller(true);
    setSelectedEventId(null);
    setShowBuilder(true);
  };

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
          isFiller,
          validationLink: validationLink || null,
          eventHeadline: validatedData?.headline ?? null,
          eventDescription: validatedData?.description ?? null,
          eventSources: validatedData?.sources ? JSON.stringify(validatedData.sources) : null,
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

  const selectedEvent = events.find((e) => e.id === selectedEventId);

  return (
    <article className="max-w-2xl mx-auto px-6 pt-16">
      <button
        onClick={() => router.push("/write")}
        className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors mb-6"
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
            onSelectEvent={(id) => {
              setSelectedEventId(id);
              setValidationStatus("idle");
              setValidatedData(null);
              setIsFiller(false);
            }}
            validationLink={validationLink}
            onValidationLinkChange={setValidationLink}
            validationStatus={validationStatus}
            onValidate={handleValidate}
            onChooseFiller={handleChooseFiller}
          />
          <button
            onClick={() => setShowBuilder(true)}
            disabled={validationStatus !== "valid"}
            className={`
              w-full py-3 text-sm tracking-wider uppercase border-2 transition-colors
              ${validationStatus === "valid"
                ? "border-[var(--accent)] text-[var(--accent)] hover:bg-[var(--accent)] hover:text-[var(--paper)]"
                : "border-[var(--rule)] text-[var(--ink-muted)] cursor-not-allowed"
              }
            `}
          >
            {validationStatus === "idle" && "Select an event and validate it"}
            {validationStatus === "invalid" && "Provide a valid source link"}
            {validationStatus === "validating" && "Validating..."}
            {validationStatus === "valid" && "Continue to Haiku Builder"}
          </button>
        </div>
      ) : (
        <div>
          {!isFiller && selectedEvent && (
            <div className="border border-[var(--accent)] bg-[var(--accent-light)] px-4 py-3 mb-6 flex items-center justify-between">
              <span className="text-sm text-[var(--ink)]">
                Inspired by:{" "}
                <strong className="text-[var(--accent)]">{selectedEvent.title}</strong>
              </span>
              <button
                onClick={() => setShowBuilder(false)}
                className="text-xs text-[var(--ink-muted)] underline hover:text-[var(--ink)]"
              >
                Change
              </button>
            </div>
          )}
          {isFiller && (
            <div className="border border-[var(--rule)] bg-[var(--surface)] px-4 py-3 mb-6">
              <span className="text-sm text-[var(--ink-muted)]">
                Writing a general haiku (no specific inspiration)
              </span>
            </div>
          )}

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
