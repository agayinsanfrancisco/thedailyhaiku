"use client";

import { useState } from "react";

interface AdminHaikuCardProps {
  haiku: {
    id: number;
    date: string;
    line1: string;
    line2: string;
    line3: string;
    title: string | null;
    authorName: string | null;
    authorEmail: string | null;
    status: string;
    adminNotes: string | null;
    categoryName: string | null;
    eventTitle: string | null;
    customEventTitle: string | null;
    createdAt: string | null;
  };
  onStatusChange: (id: number, status: string, notes: string) => Promise<void>;
}

export default function AdminHaikuCard({ haiku, onStatusChange }: AdminHaikuCardProps) {
  const [notes, setNotes] = useState(haiku.adminNotes ?? "");
  const [notesOpen, setNotesOpen] = useState(false);
  const [acting, setActing] = useState(false);

  const handleAction = async (status: string) => {
    setActing(true);
    await onStatusChange(haiku.id, status, notes);
    setActing(false);
  };

  const monthDay = haiku.date;
  const [m, d] = monthDay.split("-");
  const dateLabel = `${["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"][parseInt(m) - 1]} ${parseInt(d)}`;

  const statusColors: Record<string, string> = {
    pending: "border-[var(--ink-muted)] text-[var(--ink-muted)]",
    approved: "border-[var(--accent)] text-[var(--accent)]",
    rejected: "border-[var(--accent-dim)] text-[var(--ink-muted)]",
    edits_requested: "border-[var(--ink)] text-[var(--ink)]",
  };

  return (
    <div className="border border-[var(--rule)] p-5 bg-[var(--surface)]">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-xs font-[system-ui] text-[var(--ink-muted)]">{dateLabel}</span>
            {haiku.title && (
              <span className="text-sm text-[var(--ink)]">&mdash; {haiku.title}</span>
            )}
          </div>
        </div>
        <span className={`text-[10px] font-[system-ui] tracking-wider uppercase border px-2 py-0.5 ${statusColors[haiku.status] ?? "border-[var(--rule)] text-[var(--ink-muted)]"}`}>
          {haiku.status.replace("_", " ")}
        </span>
      </div>

      <div className="text-[15px] text-[var(--ink)] mb-3 leading-relaxed">
        <p>{haiku.line1}</p>
        <p>{haiku.line2}</p>
        <p>{haiku.line3}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3 text-xs text-[var(--ink-muted)] font-[system-ui]">
        {haiku.authorName && <span>By {haiku.authorName}</span>}
        {haiku.categoryName && (
          <span className="text-[var(--accent)]">{haiku.categoryName}</span>
        )}
        {haiku.eventTitle && (
          <span className="text-[var(--ink-muted)] truncate max-w-[200px]" title={haiku.eventTitle}>
            {haiku.eventTitle.length > 40 ? haiku.eventTitle.slice(0, 40) + "..." : haiku.eventTitle}
          </span>
        )}
      </div>

      {haiku.adminNotes && (
        <div className="border border-[var(--rule)] p-3 mb-3 text-sm text-[var(--ink-muted)]">
          <span className="font-[system-ui] text-[var(--ink)]">Notes: </span>
          {haiku.adminNotes}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={() => setNotesOpen(!notesOpen)}
          className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] underline font-[system-ui]"
        >
          {notesOpen ? "Hide notes" : "Add notes"}
        </button>
        {notesOpen && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Feedback for the author..."
            className="w-full px-3 py-2 border border-[var(--rule)] bg-transparent text-sm focus:outline-none focus:border-[var(--ink)] transition-colors"
            rows={2}
          />
        )}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => handleAction("approved")}
            disabled={acting}
            className="flex-1 px-3 py-1.5 border border-[var(--accent)] text-[var(--accent)] text-sm font-[system-ui] tracking-wider uppercase hover:bg-[var(--accent)] hover:text-[var(--paper)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Approve
          </button>
          <button
            onClick={() => handleAction("edits_requested")}
            disabled={acting || !notes.trim()}
            className="flex-1 px-3 py-1.5 border border-[var(--ink)] text-[var(--ink)] text-sm font-[system-ui] tracking-wider uppercase hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            title={!notes.trim() ? "Add notes first" : "Request edits"}
          >
            Request Edits
          </button>
          <button
            onClick={() => handleAction("rejected")}
            disabled={acting}
            className="flex-1 px-3 py-1.5 border border-[var(--accent-dim)] text-[var(--ink-muted)] text-sm font-[system-ui] tracking-wider uppercase hover:bg-[var(--accent-dim)] hover:text-[var(--ink)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
