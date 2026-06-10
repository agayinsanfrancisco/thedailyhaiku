"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function SurpriseMeButton() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);

  const handleClick = async () => {
    setLoading(true);
    try {
      const res = await fetch("/api/haikus/random");
      const data = await res.json();
      if (data.id) {
        router.push(`/haiku/${data.id}`);
      }
    } catch {
      setLoading(false);
    }
  };

  return (
    <button
      onClick={handleClick}
      disabled={loading}
      className="text-xs text-[var(--ink-muted)] hover:text-[var(--ink)] transition-colors underline underline-offset-2 disabled:opacity-50"
    >
      {loading ? "Loading..." : "Surprise me \u2192"}
    </button>
  );
}
