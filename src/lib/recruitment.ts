import "server-only";
import { RecruitmentApplication } from "@/lib/models";

export type RecruitmentStatus = "opening_soon" | "open" | "closing_soon" | "closed" | "full";

export type RecruitmentSettingsLike = {
  status?: RecruitmentStatus;
  registrationEnabled?: boolean;
  openingDate?: Date | string | null;
  closingDate?: Date | string | null;
  maximumApplications?: number | null;
  autoCloseAfterDeadline?: boolean;
  manualOverride?: boolean;
};

export function computeRecruitmentStatus(
  settings: RecruitmentSettingsLike,
  totalApplications: number,
  now = new Date()
): RecruitmentStatus {
  if (settings.manualOverride && settings.status) return settings.status;
  if (settings.maximumApplications && totalApplications >= settings.maximumApplications) return "full";
  const openingDate = settings.openingDate ? new Date(settings.openingDate) : null;
  const closingDate = settings.closingDate ? new Date(settings.closingDate) : null;
  if (openingDate && openingDate > now) return "opening_soon";
  if (settings.autoCloseAfterDeadline !== false && closingDate && closingDate < now) return "closed";
  return settings.status || "open";
}

export function isRecruitmentOpen(settings: RecruitmentSettingsLike, computedStatus: RecruitmentStatus) {
  return Boolean(settings.registrationEnabled) && ["open", "closing_soon"].includes(computedStatus);
}

export async function assertRecruitmentOpen(settings: RecruitmentSettingsLike, teamId?: string) {
  const totalApplications = await RecruitmentApplication.countDocuments({});
  const computedStatus = computeRecruitmentStatus(settings, totalApplications);
  if (!isRecruitmentOpen(settings, computedStatus)) {
    return { ok: false as const, error: "Recruitment applications are not open right now.", computedStatus };
  }
  if (teamId) {
    const teamCount = await RecruitmentApplication.countDocuments({ team: teamId });
    return { ok: true as const, computedStatus, totalApplications, teamCount };
  }
  return { ok: true as const, computedStatus, totalApplications };
}
