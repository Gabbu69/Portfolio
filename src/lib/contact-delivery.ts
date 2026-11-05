export type ContactMessage = { name: string; email: string; message: string; _honey: string };

export async function sendContactMessage(
  recipient: string,
  message: ContactMessage,
  fetcher: typeof fetch = fetch,
) {
  const name = message.name.trim();
  const email = message.email.trim();
  const body = message.message.trim();
  if (!name || name.length > 100 || !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email) || email.length > 254 || !body || body.length > 5000 || message._honey) {
    throw new Error("Please enter your name, a valid email address, and a message of up to 5,000 characters.");
  }
  if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(recipient)) {
    throw new Error("Message delivery is unavailable. Please try again later.");
  }

  const response = await fetcher(`https://formsubmit.co/ajax/${encodeURIComponent(recipient)}`, {
    method: "POST",
    headers: { "Content-Type": "application/json", Accept: "application/json" },
    body: JSON.stringify({ name, email, message: body, _honey: "", _subject: "New message from Gabriel’s portfolio", _template: "table" }),
    signal: AbortSignal.timeout(20000),
  });
  const result: unknown = await response.json().catch(() => null);
  if (!result || typeof result !== "object") throw new Error("Your message could not be sent. Please try again; your text is still here.");
  const data = result as { success?: unknown; message?: unknown };
  // An activation acknowledgement is not a delivered visitor message.
  if (typeof data.message === "string" && /activat|actived|confirm your email|verify your email/i.test(data.message)) {
    throw new Error("Message delivery is waiting for Gabriel to activate the form. Your message has not been sent; please try again later.");
  }
  if (!response.ok || (data.success !== true && data.success !== "true")) {
    throw new Error("Your message could not be sent. Please try again; your text is still here.");
  }
}
