"use client";

import { useForm, ValidationError } from "@formspree/react";
import Script from "next/script";
import { ArrowUpRight, Check, Copy, Mail } from "lucide-react";
import { useEffect, useRef, useState, type FormEvent } from "react";

declare global {
  interface Window {
    grecaptcha?: { ready: (callback: () => void) => void; execute: (siteKey: string, options: { action: string }) => Promise<string> };
  }
}

function MessageForm({ formId, captchaSiteKey }: { formId: string; captchaSiteKey?: string }) {
  const [state, submit, reset] = useForm(formId);
  const [inputError, setInputError] = useState("");
  const [preparing, setPreparing] = useState(false);
  const inFlight = useRef(false);
  const successRef = useRef<HTMLDivElement>(null);

  useEffect(() => { if (state.succeeded) successRef.current?.focus(); }, [state.succeeded]);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    if (inFlight.current) return;
    const form = event.currentTarget;
    for (const field of ["name", "email", "message"]) {
      const input = form.elements.namedItem(field) as HTMLInputElement | HTMLTextAreaElement;
      input.value = input.value.trim();
    }
    if (!form.checkValidity()) {
      setInputError("Please complete your name, a valid email address, and your message.");
      form.reportValidity();
      return;
    }
    setInputError("");
    const data = new FormData(form);
    inFlight.current = true;
    try {
      if (captchaSiteKey) {
        setPreparing(true);
        const token = await new Promise<string>((resolve, reject) => {
          const timeout = setTimeout(() => reject(new Error("Verification timed out. Please try again.")), 10000);
          const captcha = window.grecaptcha;
          if (!captcha) { clearTimeout(timeout); reject(new Error("Verification could not load. Please try again.")); return; }
          captcha.ready(() => {
            captcha.execute(captchaSiteKey, { action: "contact" }).then(resolve, reject).finally(() => clearTimeout(timeout));
          });
        });
        data.set("g-recaptcha-response", token);
      }
      setPreparing(false);
      await submit(data);
    } catch {
      setInputError("Your message hasn’t been submitted. Verification or the connection failed. Please try again; your text is still here.");
    } finally {
      setPreparing(false);
      inFlight.current = false;
    }
  }

  if (state.succeeded) {
    return (
      <div ref={successRef} className="message-form__success" role="status" tabIndex={-1}>
        <Check aria-hidden="true" />
        <h3>Thanks for reaching out.</h3>
        <p>Your message was submitted. I’ll reply to the email address you provided.</p>
        <button className="button" type="button" onClick={() => { reset(); requestAnimationFrame(() => document.getElementById("contact-name")?.focus()); }}>Write another message</button>
      </div>
    );
  }

  return (
    <>
    {captchaSiteKey ? <Script src={`https://www.google.com/recaptcha/api.js?render=${encodeURIComponent(captchaSiteKey)}`} strategy="afterInteractive" /> : null}
    <form className="message-form" onSubmit={handleSubmit} aria-label="Send Gabriel a message" aria-busy={state.submitting || preparing}>
      <div className="message-form__row">
        <label htmlFor="contact-name">Name
          <input id="contact-name" name="name" autoComplete="name" required maxLength={100} aria-describedby="contact-name-error" aria-invalid={Boolean(state.errors?.getFieldErrors("name").length)} />
          <ValidationError id="contact-name-error" field="name" prefix="Name" errors={state.errors} />
        </label>
        <label htmlFor="contact-email">Email
          <input id="contact-email" name="email" type="email" autoComplete="email" required maxLength={254} aria-describedby="contact-email-error" aria-invalid={Boolean(state.errors?.getFieldErrors("email").length)} />
          <ValidationError id="contact-email-error" field="email" prefix="Email" errors={state.errors} />
        </label>
      </div>
      <label htmlFor="contact-message">Message
        <textarea id="contact-message" name="message" rows={6} required maxLength={5000} placeholder="Tell me what you have in mind…" aria-describedby="contact-message-error" aria-invalid={Boolean(state.errors?.getFieldErrors("message").length)} />
        <ValidationError id="contact-message-error" field="message" prefix="Message" errors={state.errors} />
      </label>
      <input type="text" name="_gotcha" className="message-form__honeypot" tabIndex={-1} autoComplete="off" aria-hidden="true" />
      <input type="hidden" name="subject" value="New message from Gabriel’s portfolio" />
      <div className="message-form__errors" role="alert">
        {inputError ? <p>{inputError}</p> : null}
        <ValidationError errors={state.errors} />
        {state.errors ? <p>Your message hasn’t been submitted. Your text is still here; please try again or copy my email address below.</p> : null}
      </div>
      <div className="message-form__actions">
        <button className="button message-form__submit" type="submit" disabled={state.submitting || preparing}>
          {preparing ? "Verifying…" : state.submitting ? "Sending…" : "Send message"}<ArrowUpRight aria-hidden="true" />
        </button>
        <p>Formspree processes this form to deliver your message. <a href="https://formspree.io/legal/privacy-policy/" target="_blank" rel="noreferrer">Privacy policy</a></p>
      </div>
      {captchaSiteKey ? <p className="message-form__captcha-note">Protected by reCAPTCHA. Google’s <a href="https://policies.google.com/privacy" target="_blank" rel="noreferrer">Privacy Policy</a> and <a href="https://policies.google.com/terms" target="_blank" rel="noreferrer">Terms of Service</a> apply.</p> : null}
    </form>
    </>
  );
}

export function ContactForm({ email, formId, captchaSiteKey }: { email: string; formId?: string; captchaSiteKey?: string }) {
  const addressRef = useRef<HTMLInputElement>(null);
  const [copyStatus, setCopyStatus] = useState("");
  async function copyEmail() {
    try {
      await navigator.clipboard.writeText(email);
      setCopyStatus("Email address copied.");
    } catch {
      addressRef.current?.focus();
      addressRef.current?.select();
      setCopyStatus("Email address selected. Copy it using your device’s copy command.");
    }
  }
  return (
    <div className="contact-panel">
      {formId ? (
        <>
          <p className="contact-panel__intro">Your message will reach my inbox. I’ll reply to the email address you provide.</p>
          <MessageForm formId={formId} captchaSiteKey={captchaSiteKey} />
        </>
      ) : (
        <div className="contact-panel__unavailable" role="status">
          <Mail aria-hidden="true" />
          <h3>The contact form is currently unavailable.</h3>
          <p>You can still reach me by email. Copy the address below to write your message.</p>
        </div>
      )}
      <div className="contact-address">
        <label className="sr-only" htmlFor="contact-address">Gabriel’s email address</label>
        <input ref={addressRef} id="contact-address" value={email} readOnly />
        <button type="button" onClick={copyEmail}><Copy aria-hidden="true" />Copy email</button>
      </div>
      <p className="contact-address__status" role="status" aria-atomic="true">{copyStatus}</p>
    </div>
  );
}
