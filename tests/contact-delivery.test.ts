import assert from "node:assert/strict";
import { test } from "node:test";
import { sendContactMessage } from "../src/lib/contact-delivery";

const recipient = "owner@example.com";
const message = { name: " Visitor ", email: " visitor@example.com ", message: " Hello Gabriel. ", _honey: "" };

test("sends only allowed fields to the fixed provider with a timeout", async () => {
  await sendContactMessage(recipient, message, async (url, init) => {
    assert.equal(url, "https://formsubmit.co/ajax/owner%40example.com");
    assert.equal(init?.method, "POST");
    assert.ok(init?.signal);
    assert.deepEqual(JSON.parse(String(init?.body)), {
      name: "Visitor", email: "visitor@example.com", message: "Hello Gabriel.", _honey: "",
      _subject: "New message from Gabriel’s portfolio", _template: "table",
    });
    return Response.json({ success: "true", message: "The form was submitted successfully." });
  });
});

test("rejects blank, oversized, invalid and honeypot input before sending", async () => {
  let calls = 0;
  const fetcher: typeof fetch = async () => { calls++; return Response.json({ success: true }); };
  for (const invalid of [{ name: "  " }, { name: "x".repeat(101) }, { email: "bad-email" }, { message: "  " }, { message: "x".repeat(5001) }, { _honey: "spam" }]) {
    await assert.rejects(sendContactMessage(recipient, { ...message, ...invalid }, fetcher));
  }
  assert.equal(calls, 0);
});

test("never reports activation, rejection, malformed responses or HTTP failures as success", async () => {
  for (const result of [
    { status: 200, body: { success: "true", message: "Please check your email to activate this form." } },
    { status: 200, body: { success: "false" } },
    { status: 200, body: {} },
    { status: 200, body: null },
    { status: 429, body: { success: true } },
    { status: 500, body: { success: true } },
  ]) {
    await assert.rejects(sendContactMessage(recipient, message, async () => Response.json(result.body, { status: result.status })));
  }
  await assert.rejects(sendContactMessage(recipient, message, async () => new Response("invalid json")));
  await assert.rejects(sendContactMessage(recipient, message, async () => { throw new TypeError("network failure"); }));
});
