"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";
import AdminHaikuCard from "@/components/AdminHaikuCard";

interface HaikuItem {
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
  isFiller: string | null;
  validationLink: string | null;
  eventHeadline: string | null;
  createdAt: string | null;
}

export default function AdminDashboardClient() {
  const [haikus, setHaikus] = useState<HaikuItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState("all");
  const router = useRouter();

  const fetchHaikus = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/haikus/all");
      if (res.status === 401) {
        router.push("/nimda");
        return;
      }
      const data = await res.json();
      setHaikus(data.haikus ?? []);
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [router]);

  useEffect(() => {
    fetchHaikus();
  }, [fetchHaikus]);

  const handleStatusChange = async (id: number, status: string, notes: string) => {
    const res = await fetch(`/api/haikus/${id}`, {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ status, adminNotes: notes || null }),
    });

    if (!res.ok) {
      const data = await res.json();
      alert(data.error || "Failed to update");
      return;
    }

    setHaikus((prev) =>
      prev.map((h) =>
        h.id === id ? { ...h, status, adminNotes: notes || null } : h,
      ),
    );
  };

  const filteredHaikus =
    filter === "all"
      ? haikus
      : haikus.filter((h) => h.status === filter);

  const counts = {
    all: haikus.length,
    pending: haikus.filter((h) => h.status === "pending").length,
    edits_requested: haikus.filter((h) => h.status === "edits_requested").length,
    approved: haikus.filter((h) => h.status === "approved").length,
    rejected: haikus.filter((h) => h.status === "rejected").length,
  };

  return (
    <div className="max-w-4xl mx-auto px-6 pt-16">
      <div className="flex items-center justify-between mb-8">
        <div>
          <p className="text-xs text-[var(--ink-muted)] tracking-widest uppercase font-[system-ui] mb-1">
            Admin
          </p>
          <h1 className="text-xl ">Dashboard</h1>
        </div>
        <div className="flex gap-px text-xs font-[system-ui]">
          {(["all", "pending", "edits_requested", "approved", "rejected"] as const).map((key) => (
            <button
              key={key}
              onClick={() => setFilter(key === "all" ? "all" : key)}
              className={`px-3 py-1.5 border transition-colors ${
                filter === key
                  ? "border-[var(--ink)] text-[var(--ink)] bg-[var(--surface)]"
                  : "border-[var(--rule)] text-[var(--ink-muted)] hover:border-[var(--ink-muted)]"
              }`}
            >
              {key === "all" ? "All" : key.replace("_", " ")}
              <span className="ml-1">({counts[key]})</span>
            </button>
          ))}
        </div>
      </div>

      {loading ? (
        <div className="space-y-4">
          {[1, 2, 3, 4].map((i) => (
            <div key={i} className="h-32 border border-[var(--rule)] bg-[var(--surface)]" />
          ))}
        </div>
      ) : filteredHaikus.length === 0 ? (
        <div className="text-center py-16 text-[var(--ink-muted)]">
          <p className="text-lg">No haikus yet</p>
          <p className="text-sm mt-1 font-[system-ui]">Haikus submitted by users will appear here.</p>
        </div>
      ) : (
        <div className="space-y-4">
          {filteredHaikus.map((haiku) => (
            <AdminHaikuCard
              key={haiku.id}
              haiku={haiku}
              onStatusChange={handleStatusChange}
            />
          ))}
        </div>
      )}
    </div>
  );
}
