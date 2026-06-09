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
    pending: "bg-yellow-100 text-yellow-800",
    approved: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-800",
    edits_requested: "bg-blue-100 text-blue-800",
  };

  return (
    <div className="bg-white border border-gray-200 rounded-xl p-5 shadow-sm hover:shadow-md transition-shadow">
      <div className="flex items-start justify-between mb-3">
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-gray-500">{dateLabel}</span>
            {haiku.title && (
              <span className="text-sm font-semibold text-gray-800">&mdash; {haiku.title}</span>
            )}
          </div>
        </div>
        <span className={`text-xs font-medium px-2.5 py-1 rounded-full ${statusColors[haiku.status] ?? "bg-gray-100 text-gray-800"}`}>
          {haiku.status.replace("_", " ")}
        </span>
      </div>

      <div className="font-serif italic text-gray-700 mb-3 leading-relaxed">
        <p>{haiku.line1}</p>
        <p>{haiku.line2}</p>
        <p>{haiku.line3}</p>
      </div>

      <div className="flex flex-wrap gap-2 mb-3 text-xs text-gray-500">
        {haiku.authorName && <span>By {haiku.authorName}</span>}
        {haiku.categoryName && (
          <span className="px-2 py-0.5 bg-gray-100 rounded-full">{haiku.categoryName}</span>
        )}
        {haiku.eventTitle && (
          <span className="px-2 py-0.5 bg-gray-100 rounded-full" title={haiku.eventTitle}>
            {haiku.eventTitle.length > 40 ? haiku.eventTitle.slice(0, 40) + "..." : haiku.eventTitle}
          </span>
        )}
      </div>

      {haiku.adminNotes && (
        <div className="bg-gray-50 rounded-lg p-3 mb-3 text-sm text-gray-600 border border-gray-100">
          <span className="font-medium text-gray-700">Notes: </span>
          {haiku.adminNotes}
        </div>
      )}

      <div className="space-y-2">
        <button
          onClick={() => setNotesOpen(!notesOpen)}
          className="text-xs text-gray-500 hover:text-gray-700 underline"
        >
          {notesOpen ? "Hide notes" : "Add notes"}
        </button>
        {notesOpen && (
          <textarea
            value={notes}
            onChange={(e) => setNotes(e.target.value)}
            placeholder="Feedback for the author..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg text-sm focus:outline-none focus:ring-2 focus:ring-indigo-500"
            rows={2}
          />
        )}
        <div className="flex gap-2 pt-1">
          <button
            onClick={() => handleAction("approved")}
            disabled={acting}
            className="flex-1 px-3 py-1.5 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 disabled:opacity-50 transition-colors"
          >
            Approve
          </button>
          <button
            onClick={() => handleAction("edits_requested")}
            disabled={acting || !notes.trim()}
            className="flex-1 px-3 py-1.5 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 disabled:opacity-50 transition-colors"
            title={!notes.trim() ? "Add notes first" : "Request edits"}
          >
            Request Edits
          </button>
          <button
            onClick={() => handleAction("rejected")}
            disabled={acting}
            className="flex-1 px-3 py-1.5 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
          >
            Reject
          </button>
        </div>
      </div>
    </div>
  );
}
