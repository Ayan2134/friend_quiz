"use client";

import { useState, useTransition, type FormEvent } from "react";
import { useRouter } from "next/navigation";
import { adminLogin } from "@/lib/admin-actions";

export function AdminLoginForm() {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [pending, startTransition] = useTransition();

  function onSubmit(e: FormEvent) {
    e.preventDefault();
    setError(null);
    startTransition(async () => {
      const res = await adminLogin(password);
      if (!res.ok) {
        setError(res.error);
        return;
      }
      router.refresh();
    });
  }

  return (
    <form className="admin-login animate-rise" onSubmit={onSubmit}>
      <p className="eyebrow">Private</p>
      <h1 className="display mt-2 text-4xl">Admin</h1>
      <p className="mt-3 text-[var(--ink-muted)]">
        Enter the admin password to view site-wide quiz analytics.
      </p>
      <label className="label mt-6" htmlFor="adminPassword">
        Password
      </label>
      <input
        id="adminPassword"
        className="field mt-2"
        type="password"
        autoComplete="current-password"
        value={password}
        onChange={(e) => setPassword(e.target.value)}
        required
      />
      {error ? <p className="error-text mt-3">{error}</p> : null}
      <div className="btn-row mt-5">
        <button type="submit" className="btn-primary" disabled={pending}>
          {pending ? "Checking…" : "Open dashboard"}
        </button>
      </div>
    </form>
  );
}
