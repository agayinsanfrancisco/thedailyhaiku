"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

export default function AdminLoginPage() {
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);
  const router = useRouter();

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError("");

    try {
      const res = await fetch("/api/admin/verify", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ password }),
      });

      if (!res.ok) {
        setError("Invalid password");
        setLoading(false);
        return;
      }

      router.push("/admin/dashboard");
    } catch {
      setError("Network error");
      setLoading(false);
    }
  };

  return (
    <article className="max-w-sm mx-auto px-6 pt-24">
      <p className="text-xs text-[var(--ink-muted)] tracking-widest uppercase font-[system-ui] mb-2 text-center">
        Admin
      </p>
      <h1 className="text-xl text-center mb-8">Sign In</h1>
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-xs font-[system-ui] text-[var(--ink-muted)] mb-1">
            Password
          </label>
          <input
            type="password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="w-full px-3 py-2 border border-[var(--rule)] bg-transparent text-sm focus:outline-none focus:border-[var(--ink)] transition-colors"
            autoFocus
          />
        </div>
        {error && (
          <p className="text-sm text-[var(--accent)] text-center">{error}</p>
        )}
        <button
          type="submit"
          disabled={loading || !password}
          className="w-full py-2 text-sm font-[system-ui] tracking-wider uppercase border-2 border-[var(--ink)] text-[var(--ink)] hover:bg-[var(--ink)] hover:text-[var(--paper)] transition-colors disabled:border-[var(--accent-dim)] disabled:text-[var(--accent-dim)] disabled:cursor-not-allowed"
        >
          {loading ? "Verifying..." : "Sign In"}
        </button>
      </form>
    </article>
  );
}
