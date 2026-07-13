import "server-only";

type EmailPayload = {
  to: string;
  subject: string;
  html: string;
};

export async function sendEmail({ to, subject, html }: EmailPayload) {
  const apiKey = process.env.RESEND_API_KEY;
  const from = process.env.EMAIL_FROM || "Tech Tatva <noreply@techtatva.in>";
  if (!apiKey) return { sent: false, reason: "missing_api_key" as const };

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "Content-Type": "application/json"
    },
    body: JSON.stringify({ from, to: [to], subject, html })
  });

  if (!res.ok) {
    const detail = await res.text().catch(() => "");
    console.error("Recruitment email failed:", detail.slice(0, 240));
    return { sent: false, reason: "api_error" as const };
  }
  return { sent: true as const };
}

export function recruitmentEmailTemplate(title: string, body: string, cta?: { label: string; href: string }) {
  return `<!DOCTYPE html><html><body style="margin:0;background:#0b0a10;font-family:Inter,Arial,sans-serif;color:#f5f5f5;padding:32px 16px"><div style="max-width:560px;margin:0 auto;border:1px solid rgba(255,255,255,.08);border-radius:24px;background:linear-gradient(180deg,#15121d,#0f0d14);padding:32px"><p style="margin:0 0 8px;font-size:11px;letter-spacing:.18em;text-transform:uppercase;color:#c4b5fd">Tech Tatva Recruitment</p><h1 style="margin:0 0 16px;font-size:28px;line-height:1.1">${title}</h1><div style="font-size:15px;line-height:1.7;color:rgba(255,255,255,.72)">${body}</div>${cta ? `<p style="margin:28px 0 0"><a href="${cta.href}" style="display:inline-block;background:#fff;color:#111;padding:12px 18px;border-radius:999px;text-decoration:none;font-weight:600;font-size:14px">${cta.label}</a></p>` : ""}<p style="margin:28px 0 0;font-size:12px;color:rgba(255,255,255,.35)">Tech Tatva · MIT Manipal</p></div></body></html>`;
}
