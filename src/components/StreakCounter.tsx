"use client";

import { useEffect, useState } from "react";

export default function StreakCounter() {
  const [streak, setStreak] = useState(0);

  useEffect(() => {
    try {
      // Key streak days by the visitor's local date, not UTC.
      const localDateKey = (d: Date) =>
        `${d.getFullYear()}-${String(d.getMonth() + 1).padStart(2, "0")}-${String(d.getDate()).padStart(2, "0")}`;
      const today = localDateKey(new Date());
      const raw = localStorage.getItem("dailyhaiku_streak");
      const data = raw ? JSON.parse(raw) : null;
      const savedCount = Number(data?.count) || 0;

      if (data?.date === today && savedCount > 0) {
        setStreak(savedCount);
        return;
      }

      const yesterdayDate = new Date();
      yesterdayDate.setDate(yesterdayDate.getDate() - 1);
      const newCount = data?.date === localDateKey(yesterdayDate) ? savedCount + 1 : 1;

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
