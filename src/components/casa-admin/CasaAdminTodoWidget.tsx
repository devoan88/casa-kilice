"use client";

import { useCallback, useEffect, useState } from "react";

type Todo = { id: string; body: string; done: boolean; sortOrder: number };

export function CasaAdminTodoWidget() {
  const [todos, setTodos] = useState<Todo[]>([]);
  const [body, setBody] = useState("");
  const [loading, setLoading] = useState(true);
  const [busy, setBusy] = useState<string | null>(null);

  const load = useCallback(async () => {
    const res = await fetch("/api/casa-admin/todos");
    const j = (await res.json().catch(() => null)) as { ok?: boolean; todos?: Todo[] } | null;
    if (res.ok && j?.ok && Array.isArray(j.todos)) setTodos(j.todos);
  }, []);

  useEffect(() => {
    let cancelled = false;
    (async () => {
      await load();
      if (!cancelled) setLoading(false);
    })();
    return () => {
      cancelled = true;
    };
  }, [load]);

  async function add(e: React.FormEvent) {
    e.preventDefault();
    const t = body.trim();
    if (!t) return;
    setBusy("new");
    try {
      const res = await fetch("/api/casa-admin/todos", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ body: t }),
      });
      const j = (await res.json().catch(() => null)) as { ok?: boolean } | null;
      if (res.ok && j?.ok) {
        setBody("");
        await load();
      }
    } finally {
      setBusy(null);
    }
  }

  async function patch(id: string, patch: { done?: boolean; body?: string }) {
    setBusy(id);
    try {
      await fetch(`/api/casa-admin/todos/${id}`, {
        method: "PATCH",
        headers: { "content-type": "application/json" },
        body: JSON.stringify(patch),
      });
      await load();
    } finally {
      setBusy(null);
    }
  }

  async function remove(id: string) {
    setBusy(id);
    try {
      await fetch(`/api/casa-admin/todos/${id}`, { method: "DELETE" });
      await load();
    } finally {
      setBusy(null);
    }
  }

  const open = todos.filter((t) => !t.done);
  const done = todos.filter((t) => t.done);

  return (
    <div className="border-t border-[color:color-mix(in_srgb,var(--espresso)_08%,transparent)] bg-[color:color-mix(in_srgb,#fff_92%,var(--sand))] px-3 py-3">
      <p className="px-1 text-[9px] font-semibold uppercase tracking-[0.22em] text-muted">To-do</p>
      <form onSubmit={add} className="mt-2 flex gap-1">
        <input
          value={body}
          onChange={(e) => setBody(e.target.value)}
          placeholder="Packaging, calls…"
          className="min-w-0 flex-1 rounded-lg border border-[color:color-mix(in_srgb,var(--espresso)_12%,transparent)] bg-[color:var(--surface)] px-2 py-1.5 text-[11px] text-[color:var(--espresso)] outline-none focus:ring-1 focus:ring-[color:color-mix(in_srgb,var(--espresso)_22%,transparent)]"
          maxLength={500}
        />
        <button
          type="submit"
          disabled={busy === "new" || !body.trim()}
          className="shrink-0 rounded-lg bg-[color:var(--espresso)] px-2 py-1.5 text-[9px] font-semibold uppercase tracking-wide text-[color:var(--sand-soft)] disabled:opacity-50"
        >
          Add
        </button>
      </form>
      <div className="mt-2 max-h-40 space-y-1 overflow-y-auto pr-0.5">
        {loading ? <p className="px-1 py-2 text-[10px] text-muted">Loading…</p> : null}
        {!loading && open.length === 0 && done.length === 0 ? (
          <p className="px-1 py-2 text-[10px] text-muted">No tasks yet.</p>
        ) : null}
        {open.map((t) => (
          <div key={t.id} className="flex items-start gap-1.5 rounded-md px-1 py-0.5 hover:bg-[color:color-mix(in_srgb,var(--espresso)_04%,transparent)]">
            <input
              type="checkbox"
              checked={false}
              disabled={busy === t.id}
              onChange={() => void patch(t.id, { done: true })}
              className="mt-0.5 accent-[color:var(--espresso)]"
              aria-label={`Mark done: ${t.body}`}
            />
            <span className="min-w-0 flex-1 text-[11px] leading-snug text-[color:var(--espresso)]">{t.body}</span>
            <button
              type="button"
              disabled={busy === t.id}
              onClick={() => void remove(t.id)}
              className="shrink-0 text-[9px] uppercase tracking-wide text-muted hover:text-red-700 disabled:opacity-50"
            >
              ×
            </button>
          </div>
        ))}
        {done.length > 0 ? (
          <div className="mt-2 border-t border-[color:color-mix(in_srgb,var(--espresso)_06%,transparent)] pt-1">
            <p className="px-1 text-[8px] font-semibold uppercase tracking-wider text-muted">Done</p>
            {done.map((t) => (
              <div key={t.id} className="flex items-start gap-1.5 rounded-md px-1 py-0.5 opacity-70">
                <input
                  type="checkbox"
                  checked
                  disabled={busy === t.id}
                  onChange={() => void patch(t.id, { done: false })}
                  className="mt-0.5 accent-[color:var(--espresso)]"
                  aria-label={`Reopen: ${t.body}`}
                />
                <span className="min-w-0 flex-1 text-[11px] leading-snug line-through">{t.body}</span>
                <button
                  type="button"
                  disabled={busy === t.id}
                  onClick={() => void remove(t.id)}
                  className="shrink-0 text-[9px] uppercase tracking-wide text-muted hover:text-red-700 disabled:opacity-50"
                >
                  ×
                </button>
              </div>
            ))}
          </div>
        ) : null}
      </div>
    </div>
  );
}
