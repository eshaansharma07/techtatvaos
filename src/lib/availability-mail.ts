import "server-only";
import { sendEmail } from "@/lib/email";

type AvailabilityEmailPayload = {
  to: string;
  leaderName: string;
  teamName: string;
  eventTitle: string;
  status: "available" | "not_available" | "tentative";
  note?: string;
  eventDate?: string;
  venue?: string;
};

export function availabilityEmailTemplate({
  leaderName,
  teamName,
  eventTitle,
  status,
  note,
  eventDate,
  venue
}: Omit<AvailabilityEmailPayload, "to">) {
  const isAvailable = status === "available";
  const statusLabel = isAvailable
    ? "Available & Attending"
    : status === "not_available"
    ? "Unable to Attend (Withdrawn)"
    : "Tentative";
  const badgeBg = isAvailable ? "#10b981" : status === "not_available" ? "#ef4444" : "#f59e0b";

  return `<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Event Availability Update — Tech Tatva</title>
</head>
<body style="margin:0;padding:32px 16px;background:#090314;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,Helvetica,Arial,sans-serif;color:#f3f4f6;">
  <div style="max-width:580px;margin:0 auto;border:1px solid rgba(255,255,255,0.1);border-radius:24px;background:linear-gradient(180deg,#140b25 0%,#090314 100%);padding:36px;box-shadow:0 20px 40px rgba(0,0,0,0.5);">
    
    <!-- Header Badge -->
    <div style="display:inline-block;padding:6px 14px;border-radius:999px;background:rgba(168,85,247,0.15);border:1px solid rgba(168,85,247,0.3);margin-bottom:20px;">
      <span style="font-size:11px;font-weight:700;letter-spacing:0.18em;text-transform:uppercase;color:#c084fc;">TECH TATVA OS · ATTENDANCE CONFIRMATION</span>
    </div>

    <!-- Main Title -->
    <h1 style="margin:0 0 12px;font-size:26px;font-weight:800;letter-spacing:-0.03em;color:#ffffff;line-height:1.2;">
      Availability Status Recorded
    </h1>
    
    <p style="margin:0 0 24px;font-size:15px;line-height:1.6;color:rgba(255,255,255,0.7);">
      Hi <strong style="color:#ffffff;">${leaderName}</strong>, your team's updated availability status for <strong style="color:#c084fc;">${eventTitle}</strong> has been received by the organizing committee.
    </p>

    <!-- Status Card -->
    <div style="border-radius:18px;background:rgba(255,255,255,0.03);border:1px solid rgba(255,255,255,0.08);padding:22px;margin-bottom:24px;">
      <table style="width:100%;border-collapse:collapse;">
        <tr>
          <td style="padding:6px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.5);">Team Name</td>
          <td style="padding:6px 0;font-size:14px;font-weight:700;text-align:right;color:#ffffff;">${teamName}</td>
        </tr>
        <tr>
          <td style="padding:6px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.5);">Event</td>
          <td style="padding:6px 0;font-size:14px;font-weight:600;text-align:right;color:#c084fc;">${eventTitle}</td>
        </tr>
        ${eventDate ? `
        <tr>
          <td style="padding:6px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.5);">Scheduled Date</td>
          <td style="padding:6px 0;font-size:13px;text-align:right;color:#ffffff;">${eventDate}</td>
        </tr>` : ""}
        ${venue ? `
        <tr>
          <td style="padding:6px 0;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.5);">Venue</td>
          <td style="padding:6px 0;font-size:13px;text-align:right;color:#ffffff;">${venue}</td>
        </tr>` : ""}
        <tr>
          <td style="padding:10px 0 6px;font-size:12px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.5);">Recorded Status</td>
          <td style="padding:10px 0 6px;text-align:right;">
            <span style="display:inline-block;padding:4px 12px;border-radius:999px;background:${badgeBg}22;border:1px solid ${badgeBg}55;font-size:12px;font-weight:700;color:${badgeBg};text-transform:uppercase;letter-spacing:0.06em;">
              ${statusLabel}
            </span>
          </td>
        </tr>
      </table>

      ${note ? `
      <div style="margin-top:16px;padding-top:16px;border-top:1px solid rgba(255,255,255,0.06);">
        <p style="margin:0 0 4px;font-size:11px;text-transform:uppercase;letter-spacing:0.1em;color:rgba(255,255,255,0.4);">Your Remarks</p>
        <p style="margin:0;font-size:13px;color:rgba(255,255,255,0.8);font-style:italic;">"${note}"</p>
      </div>` : ""}
    </div>

    <!-- Instructions / Next Steps -->
    <div style="font-size:13px;line-height:1.6;color:rgba(255,255,255,0.6);margin-bottom:28px;">
      ${isAvailable
        ? "<p style='margin:0;'>Your slot has been locked for the postponed schedule. Please ensure your squad members arrive at the venue 15 minutes before the event starts. We look forward to seeing you there!</p>"
        : "<p style='margin:0;'>We have noted that your squad cannot attend on the revised date. Your registration slot has been released for teams on the waitlist. If your plans change, please reach out to the event leads.</p>"}
    </div>

    <!-- Action Link -->
    <div style="text-align:center;margin-bottom:28px;">
      <a href="https://techtatva.in" style="display:inline-block;padding:12px 28px;border-radius:999px;background:#ffffff;color:#090314;text-decoration:none;font-weight:700;font-size:13px;letter-spacing:0.04em;">
        Visit Tech Tatva Portal
      </a>
    </div>

    <!-- Footer -->
    <div style="border-top:1px solid rgba(255,255,255,0.08);padding-top:20px;font-size:11px;color:rgba(255,255,255,0.35);text-align:center;">
      <p style="margin:0 0 4px;">Tech Tatva Club · Chandigarh University</p>
      <p style="margin:0;">For any urgent queries, contact the team leads or email support@techtatva.in</p>
    </div>

  </div>
</body>
</html>`;
}

export async function sendAvailabilityConfirmationEmail(payload: AvailabilityEmailPayload) {
  const html = availabilityEmailTemplate(payload);
  const subject = `Availability Confirmed: ${payload.teamName} for ${payload.eventTitle} — Tech Tatva`;
  return await sendEmail({
    to: payload.to,
    subject,
    html
  });
}
