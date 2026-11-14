"use client";

import { useState } from "react";

const STORAGE_KEY = "ck-contact-notes";

export function ContactForm() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [message, setMessage] = useState("");
  const [done, setDone] = useState(false);

  function onSubmit(event: React.FormEvent) {
    event.preventDefault();
    const entry = {
      name: name.trim(),
      email: email.trim(),
      message: message.trim(),
      at: new Date().toISOString(),
    };
    const raw = window.localStorage.getItem(STORAGE_KEY);
    const prev = raw ? (JSON.parse(raw) as unknown[]) : [];
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify([...prev, entry]));
    setDone(true);
    setName("");
    setEmail("");
    setMessage("");
  }

  return (
    <form onSubmit={onSubmit} className="flex flex-col gap-5">
      <label className="flex flex-col gap-2 text-sm">
        <span className="tracking-[0.18em] text-[color:#6d5c50]">სახელი</span>
        <input
          required
          value={name}
          onChange={(e) => setName(e.target.value)}
          className="h-12 border-b border-[color:#2c241e]/20 bg-transparent text-lg outline-none focus:border-[color:#2c241e]"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="tracking-[0.18em] text-[color:#6d5c50]">ელფოსტა</span>
        <input
          required
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="h-12 border-b border-[color:#2c241e]/20 bg-transparent text-lg outline-none focus:border-[color:#2c241e]"
        />
      </label>
      <label className="flex flex-col gap-2 text-sm">
        <span className="tracking-[0.18em] text-[color:#6d5c50]">შეტყობინება</span>
        <textarea
          required
          rows={5}
          value={message}
          onChange={(e) => setMessage(e.target.value)}
          className="border-b border-[color:#2c241e]/20 bg-transparent py-3 text-lg outline-none focus:border-[color:#2c241e]"
        />
      </label>
      <button
        type="submit"
        className="inline-flex h-12 w-fit items-center bg-[#2c241e] px-8 text-xs tracking-[0.22em] text-[#f7f1e8] uppercase"
      >
        გაგზავნა
      </button>
      <p className="text-sm leading-relaxed text-[color:#6d5c50]">
        შეტყობინება რჩება ამ ბრაუზერში. ფოსტის სერვერი ჯერ არ გვაქვს, ამიტომ წერილი არსად არ იგზავნება.
      </p>
      {done ? (
        <p role="status" className="text-base">
          შენახულია ამ მოწყობილობაზე.
        </p>
      ) : null}
    </form>
  );
}
