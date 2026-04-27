"use client";

import { useState } from "react";
import { ArrowRightIcon } from "@/components/icons/ArrowRightIcon";

type FormState = "idle" | "submitting" | "success" | "error";

export function ContactForm() {
  const [formState, setFormState] = useState<FormState>("idle");
  const [fields, setFields] = useState({
    name: "",
    email: "",
    subject: "",
    message: "",
  });

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement | HTMLSelectElement>
  ) => {
    setFields((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setFormState("submitting");
    // Simulate async submission — replace with a real endpoint in production.
    await new Promise((r) => setTimeout(r, 1200));
    setFormState("success");
  };

  const inputClass = `
    w-full bg-stone-900 border border-stone-800 rounded-lg
    px-4 py-3 font-sans text-sm text-stone-200
    placeholder:text-stone-700
    focus:outline-none focus:border-beige/40
    transition-colors duration-150
  `;

  if (formState === "success") {
    return (
      <div className="glass-panel rounded-xl p-8 flex flex-col items-start gap-4">
        <span className="w-2 h-2 rounded-full bg-green-400" />
        <p className="font-sans text-sm text-stone-300">
          Message received. We'll be in touch shortly.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} noValidate className="flex flex-col gap-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
        <div className="flex flex-col gap-1.5">
          <label htmlFor="name" className="font-sans text-xs text-stone-600 uppercase tracking-wider">
            Name
          </label>
          <input
            id="name"
            name="name"
            type="text"
            required
            value={fields.name}
            onChange={handleChange}
            placeholder="Jane Smith"
            className={inputClass}
          />
        </div>
        <div className="flex flex-col gap-1.5">
          <label htmlFor="email" className="font-sans text-xs text-stone-600 uppercase tracking-wider">
            Email
          </label>
          <input
            id="email"
            name="email"
            type="email"
            required
            value={fields.email}
            onChange={handleChange}
            placeholder="jane@fund.com"
            className={inputClass}
          />
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="subject" className="font-sans text-xs text-stone-600 uppercase tracking-wider">
          Subject
        </label>
        <select
          id="subject"
          name="subject"
          value={fields.subject}
          onChange={handleChange}
          className={inputClass}
        >
          <option value="" disabled>Select a topic</option>
          <option value="institutional">Institutional inquiry</option>
          <option value="partnership">Partnership proposal</option>
          <option value="technical">Technical question</option>
          <option value="security">Security disclosure</option>
          <option value="other">Other</option>
        </select>
      </div>

      <div className="flex flex-col gap-1.5">
        <label htmlFor="message" className="font-sans text-xs text-stone-600 uppercase tracking-wider">
          Message
        </label>
        <textarea
          id="message"
          name="message"
          required
          rows={5}
          value={fields.message}
          onChange={handleChange}
          placeholder="Tell us about your use case…"
          className={`${inputClass} resize-none`}
        />
      </div>

      <button
        type="submit"
        disabled={formState === "submitting"}
        className="btn-primary self-start disabled:opacity-50 disabled:cursor-not-allowed"
      >
        {formState === "submitting" ? (
          <>
            <span className="w-3.5 h-3.5 rounded-full border border-obsidian/30 border-t-obsidian animate-spin" />
            <span>Sending…</span>
          </>
        ) : (
          <>
            <span>Send Message</span>
            <ArrowRightIcon className="w-3.5 h-3.5" />
          </>
        )}
      </button>
    </form>
  );
}
