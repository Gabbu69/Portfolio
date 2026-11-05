"use client";

import { ArrowUpRight, Check } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";
import { sendContactMessage } from "@/lib/contact-delivery";

export function DirectMessageForm({ email }: { email: string }) {
  const [sending, setSending] = useState(false);
  const [succeeded, setSucceeded] = useState(false);
  const [error, setError] = useState("");
  const inFlight = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);
  const errorRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (succeeded) successRef.current?.focus(); }, [succeeded]);
  useEffect(() => { if (error) errorRef.current?.focus(); }, [error]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    for (const field of ["name", "email", "message"]) {
      const input = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement;
      input.value = input.value.trim();
    }
    if (!form.reportValidity()) return;
    const data = new FormData(form);
    setError("");
    inFlight.current = true;
    setSending(true);
    try {
      await sendContactMessage(email, {
        name: String(data.get("name") ?? ""),
        email: String(data.get("email") ?? ""),
        message: String(data.get("message") ?? ""),
        _honey: String(data.get("_honey") ?? ""),
      });
      setSucceeded(true);
    } catch (cause) {
      setError(cause instanceof Error && cause.name !== "TimeoutError" && cause.name !== "TypeError"
        ? cause.message
        : "The connection failed or timed out. Your message has not been confirmed as sent. Your text is still here; please try again.");
    } finally {
      inFlight.current = false;
      setSending(false);
    }
  }

  if (succeeded) return (
    <div ref={successRef} className="message-form__success" role="status" tabIndex={-1}>
      <Check aria-hidden="true" />
      <h3>Thanks for reaching out.</h3>
      <p>Your message was submitted. I’ll reply to the email address you provided.</p>
      <button className="button" type="button" onClick={() => { setSucceeded(false); requestAnimationFrame(() => document.getElementById("contact-name")?.focus()); }}>Write another message</button>
    </div>
  );

  return (
    <form className="message-form" method="post" onSubmit={handleSubmit} aria-label="Send Gabriel a message" aria-busy={sending}>
      <div className="message-form__row">
        <label htmlFor="contact-name">Name
          <input id="contact-name" name="name" autoComplete="name" required maxLength={100} readOnly={sending} />
        </label>
        <label htmlFor="contact-email">Email
          <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} readOnly={sending} />
        </label>
      </div>
      <label htmlFor="contact-message">Message
        <textarea id="contact-message" name="message" rows={6} required maxLength={5000} readOnly={sending} placeholder="Tell me what you have in mind…" />
      </label>
      <input type="text" name="_honey" className="message-form__honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      {error ? <div ref={errorRef} className="message-form__errors" role="alert" tabIndex={-1}><p>{error}</p></div> : null}
      <div className="message-form__actions">
        <button className="button message-form__submit" type="submit" disabled={sending}>
          {sending ? "Sending…" : "Send message"}<ArrowUpRight aria-hidden="true" />
        </button>
        <p>Your name, email, and message are processed by FormSubmit to deliver your message to my inbox. <a href="https://formsubmit.co/privacy.pdf" target="_blank" rel="noreferrer">Privacy policy</a></p>
      </div>
    </form>
  );
}
