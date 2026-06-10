"use client";

import { useState, useEffect, useCallback } from "react";
import { useRouter } from "next/navigation";

interface CalendarProps {
  year?: number;
}

const MONTHS = [
  "January", "February", "March", "April", "May", "June",
  "July", "August", "September", "October", "November", "December",
];

const DAYS = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];

export default function Calendar({ year: initialYear }: CalendarProps) {
  const today = new Date();
  const [currentMonth, setCurrentMonth] = useState(today.getMonth());
  const [currentYear, setCurrentYear] = useState(initialYear ?? today.getFullYear());
  const [takenDates, setTakenDates] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(true);
  const router = useRouter();

  const fetchDates = useCallback(async () => {
    setLoading(true);
    try {
      const res = await fetch(`/api/dates?year=${currentYear}`);
      const data = await res.json();
      setTakenDates(data.takenDates ?? {});
    } catch {
      // ignore
    } finally {
      setLoading(false);
    }
  }, [currentYear]);

  useEffect(() => {
    fetchDates();
  }, [fetchDates]);

  const firstDayOfMonth = new Date(currentYear, currentMonth, 1).getDay();
  const daysInMonth = new Date(currentYear, currentMonth + 1, 0).getDate();

  const prevMonth = () => {
    if (currentMonth === 0) {
      setCurrentMonth(11);
      setCurrentYear((y) => y - 1);
    } else {
      setCurrentMonth((m) => m - 1);
    }
  };

  const nextMonth = () => {
    if (currentMonth === 11) {
      setCurrentMonth(0);
      setCurrentYear((y) => y + 1);
    } else {
      setCurrentMonth((m) => m + 1);
    }
  };

  const getDateKey = (day: number) =>
    `${String(currentMonth + 1).padStart(2, "0")}-${String(day).padStart(2, "0")}`;

  const isAvailable = (day: number) => {
    const key = getDateKey(day);
    return !takenDates[key];
  };

  const handleDateClick = (day: number) => {
    if (!isAvailable(day)) return;
    const dateKey = getDateKey(day);
    router.push(`/write/${dateKey}`);
  };

  const cells: (number | null)[] = [];
  for (let i = 0; i < firstDayOfMonth; i++) cells.push(null);
  for (let d = 1; d <= daysInMonth; d++) cells.push(d);
  while (cells.length % 7 !== 0) cells.push(null);

  const isCurrentMonth = today.getMonth() === currentMonth && today.getFullYear() === currentYear;

  return (
    <div className="max-w-sm mx-auto">
      <div className="flex items-center justify-between mb-6">
        <button
          onClick={prevMonth}
          className="p-2 hover:bg-[var(--surface)] text-[var(--ink-muted)]"
          aria-label="Previous month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M15 19l-7-7 7-7" />
          </svg>
        </button>
        <h2 className="text-base font-serif text-[var(--ink)]">
          {MONTHS[currentMonth]} {currentYear}
        </h2>
        <button
          onClick={nextMonth}
          className="p-2 hover:bg-[var(--surface)] text-[var(--ink-muted)]"
          aria-label="Next month"
        >
          <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={1.5} d="M9 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <div className="grid grid-cols-7 gap-px mb-px">
        {DAYS.map((day) => (
          <div key={day} className="text-center text-xs font-[system-ui] text-[var(--ink-muted)] py-2">
            {day}
          </div>
        ))}
      </div>

      {loading ? (
        <div className="grid grid-cols-7 gap-px">
          {Array.from({ length: 35 }).map((_, i) => (
            <div key={i} className="aspect-square bg-[var(--surface)]" />
          ))}
        </div>
      ) : (
        <div className="grid grid-cols-7 gap-px">
          {cells.map((day, i) => {
            if (day === null) {
              return <div key={`empty-${i}`} className="aspect-square" />;
            }

            const available = isAvailable(day);
            const isToday = isCurrentMonth && day === today.getDate();

            return (
              <button
                key={day}
                onClick={() => handleDateClick(day)}
                disabled={!available}
                className={`
                  aspect-square text-sm font-[system-ui] flex items-center justify-center
                  transition-colors
                  ${available
                    ? "text-[var(--ink)] hover:bg-[var(--surface)] cursor-pointer"
                    : "text-[var(--accent-dim)] cursor-not-allowed line-through"
                  }
                  ${isToday ? "ring-1 ring-[var(--accent)] ring-inset" : ""}
                `}
                title={available ? "Open" : "Has a haiku"}
              >
                {day}
              </button>
            );
          })}
        </div>
      )}

      <div className="flex items-center justify-center gap-6 mt-6 text-xs text-[var(--ink-muted)] font-[system-ui]">
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[var(--surface)] border border-[var(--rule)]" />
          <span>Open</span>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-3 h-3 bg-[var(--accent-dim)] border border-[var(--accent-dim)]" />
          <span>Has haiku</span>
        </div>
      </div>
    </div>
  );
}
