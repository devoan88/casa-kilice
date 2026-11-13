"use client";

import { useState } from "react";

const STORAGE_KEY = "ck-glow-waitlist";

type Entry = { name: string; email: string; at: string };

export function WaitlistForm({ id = "waitlist" }: { id?: string }) {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const entry: Entry = { name: name.trim(), email: email.trim(), at: new Date().toISOString() };
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const prev: Entry[] = raw ? (JSON.parse(raw) as Entry[]) : [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...prev, entry]));
    setDone(true);
    setName("");
    setEmail("");
  }

  return (
    <form id={id} onSubmit={onSubmit} className="mt-8 flex max-w-xl flex-col gap-4">
      <label className="flex flex-col gap-2 text-sm">
        <span className="tracking-[0.18em] text-[color:#6d5c50]">სახელი</span>
        <input
          required
          name="name"
          value={name}
          onChange={(e) => setName(e.target.value)}
          autoComplete="name"
          className="h-12 border-b border-[color:#2c241e]/20 bg-transparent text-lg outline-none focus:border-[color:#2c241e]"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="tracking-[0.18em] text-[color:#6d5c50]">ელფოსტა</span>
        <input
          required
          type="email"
          name="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          autoComplete="email"
          className="h-12 border-b border-[color:#2c241e]/20 bg-transparent text-lg outline-none focus:border-[color:#2c241e]"
        />
      </label>
      <button
        type="submit"
        className="mt-2 inline-flex h-12 w-fit items-center bg-[#2c241e] px-8 text-xs tracking-[0.22em] text-[#f7f1e8] uppercase"
      >
        შემატყობინეთ
      </button>
      <p className="max-w-md text-sm leading-relaxed text-[color:#6d5c50]">
        სია ინახება მხოლოდ ამ ბრაუზერში. ელფოსტის სერვისი ჯერ არ არის დაკავშირებული და ფული არ იჭრება.
      </p>
      {done ? (
        <p className="text-base text-[#2c241e]" role="status">
          ჩაგიწერეთ. როცა წვეთი მზად იქნება, ამ სიას გამოვიყენებთ შეტყობინებისთვის.
        </p>
      ) : null}
    </form>
  );
}
