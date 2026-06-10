"use client";

import { useEffect, useState } from "react";

export default function StreakCounter() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      const today = new Date().toISOString().split("T")[0];
      const raw = localStorage.getItem("dailyhaiku_streak");
      const data = raw ? JSON.parse(raw) : null;

      if (data?.date === today) {
        setStreak(data.count);
        return;
      }

      const yesterday = new Date(Date.now() - 86400000).toISOString().split("T")[0];
      const newCount = data?.date === yesterday ? data.count + 1 : 1;

      localStorage.setItem("dailyhaiku_streak", JSON.stringify({ date: today, count: newCount }));
      setStreak(newCount);
    } catch {
      setStreak(0);
    }
  }, []);

  if (streak < 2) return null;

  const fire = streak >= 7 ? "🔥" : streak >= 3 ? "✦" : "·";

  return (
    <div className="inline-flex items-center gap-1.5 text-xs text-[var(--accent)] mb-4 animate-fade-up">
      <span>{fire}</span>
      <span>{streak}-day streak</span>
    </div>
  );
}
