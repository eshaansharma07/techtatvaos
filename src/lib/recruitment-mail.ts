import "server-only";
import { recruitmentEmailTemplate, sendEmail } from "@/lib/email";

type SettingsLike = {
  confirmationEmailEnabled?: boolean;
  emailOnAccepted?: boolean;
  emailOnRejected?: boolean;
  emailOnShortlisted?: boolean;
  emailOnInterview?: boolean;
  customSuccessMessage?: string;
};

export async function sendApplicationReceivedEmail(
  settings: SettingsLike,
  applicant: { fullName: string; email: string; teamName?: string; roleName?: string }
) {
  if (!settings.confirmationEmailEnabled) return;
  await sendEmail({
    to: applicant.email,
    subject: "Application received — Tech Tatva Recruitment",
    html: recruitmentEmailTemplate(
      "We received your application.",
      `<p>Hi ${applicant.fullName},</p><p>Your application${applicant.teamName ? ` for <strong>${applicant.teamName}</strong>` : ""}${applicant.roleName ? ` (${applicant.roleName})` : ""} has been received.</p><p>${settings.customSuccessMessage || "Our team will review your submission and reach out with next steps."}</p>`,
      { label: "Visit Tech Tatva", href: "https://techtatva.in" }
    )
  });
}

export async function sendApplicationStatusEmail(
  settings: SettingsLike,
  applicant: { fullName: string; email: string; teamName?: string; roleName?: string },
  status: string,
  note?: string
) {
  const map: Record<string, { enabled?: boolean; subject: string; title: string; body: string }> = {
    accepted: {
      enabled: settings.emailOnAccepted,
      subject: "Welcome aboard — Tech Tatva Recruitment",
      title: "Your application was accepted.",
      body: `<p>Hi ${applicant.fullName},</p><p>Congratulations — you have been accepted${applicant.teamName ? ` to <strong>${applicant.teamName}</strong>` : ""}${applicant.roleName ? ` as <strong>${applicant.roleName}</strong>` : ""}.</p>${note ? `<p>${note}</p>` : "<p>We will share onboarding details soon.</p>"}`
    },
    rejected: {
      enabled: settings.emailOnRejected,
      subject: "Application update — Tech Tatva Recruitment",
      title: "Application update.",
      body: `<p>Hi ${applicant.fullName},</p><p>Thank you for applying. After careful review, we will not be moving forward with your application at this time.${note ? ` ${note}` : ""}</p><p>We appreciate your interest in Tech Tatva.</p>`
    },
    shortlisted: {
      enabled: settings.emailOnShortlisted,
      subject: "You have been shortlisted — Tech Tatva Recruitment",
      title: "You have been shortlisted.",
      body: `<p>Hi ${applicant.fullName},</p><p>Your application${applicant.teamName ? ` for <strong>${applicant.teamName}</strong>` : ""} has been shortlisted.${note ? ` ${note}` : " We will contact you with the next steps."}</p>`
    },
    on_hold: {
      enabled: settings.emailOnInterview,
      subject: "Interview invitation — Tech Tatva Recruitment",
      title: "Next steps for your application.",
      body: `<p>Hi ${applicant.fullName},</p><p>Your application is progressing.${note ? ` ${note}` : " We would like to schedule a conversation with you."}</p>`
    }
  };
  const template = map[status];
  if (!template?.enabled) return;
  await sendEmail({
    to: applicant.email,
    subject: template.subject,
    html: recruitmentEmailTemplate(template.title, template.body, { label: "Visit Tech Tatva", href: "https://techtatva.in" })
  });
}
