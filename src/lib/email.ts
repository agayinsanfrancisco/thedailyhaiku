import { Resend } from "resend";

// All email is gated on RESEND_API_KEY. Until it's set (and a domain is
// verified on Resend), every send is a logged no-op — the app works fully,
// it just doesn't email yet. Set RESEND_API_KEY + EMAIL_FROM to go live.

const FROM = process.env.EMAIL_FROM ?? "the daily haiku <hello@thedailyhaiku.com>";
const SITE = process.env.SITE_URL ?? "https://thedailyhaiku.com";

function client(): Resend | null {
  const key = process.env.RESEND_API_KEY;
  return key ? new Resend(key) : null;
}

async function send(to: string, subject: string, html: string): Promise<boolean> {
  const resend = client();
  if (!resend) {
    console.log(`[email:noop] would send "${subject}" to ${to} (RESEND_API_KEY not set)`);
    return false;
  }
  try {
    await resend.emails.send({ from: FROM, to, subject, html });
    return true;
  } catch (e) {
    console.error("[email] send failed:", e);
    return false;
  }
}

const shell = (body: string) => `
  <div style="font-family:Georgia,serif;max-width:480px;margin:0 auto;color:#1a1812">
    ${body}
    <p style="margin-top:28px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#a8a08e">the daily haiku — one poem per day</p>
  </div>`;

// Sent at submit time, when we still hold the plaintext manage token, so the
// poet has a recovery link that works on any device.
export function sendSubmissionReceipt(to: string, haikuId: number, token: string, date: string) {
  const manage = `${SITE}/mine?claim=${haikuId}.${encodeURIComponent(token)}`;
  return send(
    to,
    "your haiku is in review",
    shell(`
      <h1 style="font-size:22px;font-weight:normal">Thanks — your haiku for ${date} is in review.</h1>
      <p style="font-size:15px;line-height:1.7;color:#5a5448">We fact-check the moment and read every poem, usually within a day. If it's approved, your word takes over the front page on that date.</p>
      <p style="font-size:15px;line-height:1.7;color:#5a5448">This private link lets you edit or delete it from any device — keep it:</p>
      <p><a href="${manage}" style="color:#c2391b">${manage}</a></p>
    `),
  );
}

// Sent when an admin approves a haiku.
export function sendApprovalNotice(to: string, haikuId: number, date: string, word: string) {
  return send(
    to,
    `published: "${word}" is your word for ${date}`,
    shell(`
      <h1 style="font-size:22px;font-weight:normal">Your haiku is live.</h1>
      <p style="font-size:15px;line-height:1.7;color:#5a5448">It's published for ${date}, and your word — <b>${word}</b> — headlines the front page that day.</p>
      <p><a href="${SITE}/haiku/${haikuId}" style="color:#c2391b">see it →</a></p>
    `),
  );
}
