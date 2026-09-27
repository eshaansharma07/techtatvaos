import "server-only";
import { sendEmail } from "@/lib/email";

type ContactReplyPayload = {
  to: string;
  recipientName: string;
  originalSubject: string;
  originalMessage: string;
  replyMessage: string;
  repliedBy?: string;
};

export function contactReplyEmailTemplate({
  recipientName,
  originalSubject,
  originalMessage,
  replyMessage,
  repliedBy
}: Omit<ContactReplyPayload, "to">) {
  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Response to your query — Tech Tatva</title>
</head>
<body style="margin:0;padding:32px 16px;background:#090314;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f3f4f6;">
  <div style="max-width:580px;margin:0 auto;border:1px solid rgba(255,255,255,0.1);border-radius:24px;background:linear-gradient(180deg,#140b25 0%,#090314 100%);padding:36px;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
    
    <!-- Header Badge -->
    <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.3);margin-bottom:20px;">
      <span style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c084fc;">TECH TATVA OS · SUPPORT RESPONSE</span>
    </div>

    <!-- Main Title -->
    <h1 style="margin:0 0 12px;font-size:24px;font-weight:800;letter-spacing:-0.03em;color:#ffffff;line-height:1.2;">
      Response from Tech Tatva Team
    </h1>
    
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.7);">
      Hi <strong style="color:#ffffff;">${recipientName}</strong>, thank you for reaching out to us. A member of the Tech Tatva team has reviewed your query and sent you the following response:
    </p>

    <!-- Reply Box -->
    <div style="border-radius:18px;background:rgba(168,85,247,0.06);border:1px solid rgba(168,85,247,0.25);padding:22px;margin-bottom:24px;">
      <div style="display:flex;align-items:center;margin-bottom:10px;">
        <span style="font-size:11px;font-weight:700;letter-spacing:0.12em;text-transform:uppercase;color:#c084fc;">
          Official Response ${repliedBy ? `· ${repliedBy}` : ""}
        </span>
      </div>
      <div style="font-size:14px;line-height:1.7;color:#ffffff;white-space:pre-wrap;">${replyMessage}</div>
    </div>

    <!-- Original Message Quote -->
    <div style="border-radius:16px;background:rgba(255,255,255,0.02);border:1px solid rgba(255,255,255,0.06);padding:18px;margin-bottom:26px;">
      <p style="margin:0 0 6px;font-size:10px;text-transform:uppercase;letter-spacing:0.12em;color:rgba(255,255,255,0.4);font-weight:700;">Your Original Inquiry</p>
      <p style="margin:0 0 4px;font-size:12px;font-weight:600;color:rgba(255,255,255,0.8);">Subject: ${originalSubject || "Inquiry"}</p>
      <p style="margin:0;font-size:12px;color:rgba(255,255,255,0.5);line-height:1.5;font-style:italic;">"${originalMessage}"</p>
    </div>

    <!-- Action Link -->
    <div style="text-align:center;margin-bottom:28px;">
      <a href="https://techtatva.in/contact" style="display:inline-block;padding:12px 28px;border-radius:999px;background:#ffffff;color:#090314;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.04em;">
        Visit Tech Tatva Help Desk
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;font-size:11px;color:rgba(255,255,255,0.35);text-align:center;">
      <p style="margin:0 0 4px;">Tech Tatva Club · Chandigarh University</p>
      <p style="margin:0;">You can reply to this message directly or connect with us on <a href="https://techtatva.in" style="color:#c084fc;text-decoration:none;">techtatva.in</a></p>
    </div>

  </div>
</body>
</html>`;
}

export async function sendContactReplyEmail(payload: ContactReplyPayload) {
  const html = contactReplyEmailTemplate(payload);
  const subject = `Re: ${payload.originalSubject || "Your inquiry with Tech Tatva"}`;
  return await sendEmail({
    to: payload.to,
    subject,
    html
  });
}
