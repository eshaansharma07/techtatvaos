import { Types } from "mongoose";
import { sendApplicationStatusEmail } from "@/lib/recruitment-mail";
import {
  Achievement,
  Announcement,
  ClubInfo,
  ContactMessage,
  Attendance,
  Event,
  EventRegistration,
  Gallery,
  HallOfFame,
  Sponsor,
  Task,
  Team,
  User,
  Meeting,
  RecruitmentApplication,
  RecruitmentQuestion,
  RecruitmentRole,
  RecruitmentSettings,
  RecruitmentTeam
} from "@/lib/models";

export const adminResources = [
  "users",
  "teams",
  "events",
  "meetings",
  "tasks",
  "announcements",
  "sponsors",
  "achievements",
  "gallery",
  "hallOfFame",
  "contacts",
  "settings",
  "recruitmentSettings",
  "recruitmentTeams",
  "recruitmentRoles",
  "recruitmentQuestions",
  "recruitmentApplications"
] as const;

export type AdminResource = (typeof adminResources)[number];

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || new Types.ObjectId().toString();
}

const clean = (input: Record<string, any>) =>
  Object.fromEntries(Object.entries(input).filter(([, value]) => value !== "" && value !== undefined && value !== null));
const refId = (value: any) => {
  if (!value) return undefined;
  if (typeof value === "object") return String(value._id || value.id || "");
  return String(value);
};
const refIds = (value: any) => (Array.isArray(value) ? value : [value]).map(refId).filter((id): id is string => Boolean(id));
const uniqueRefIds = (value: any) => Array.from(new Set(refIds(value)));
const jointSecretaryLanes = new Set(["technical", "creative"]);

function normalizeTeamBody(input: Record<string, any>, create = false) {
  const body = clean(input);
  const normalized: Record<string, any> = { ...body };
  if (body.slug || body.name) normalized.slug = body.slug || slugify(body.name);
  if (body.order !== undefined) normalized.order = Number(body.order);
  if (body.coLeads !== undefined) normalized.coLeads = Array.isArray(body.coLeads) ? body.coLeads : [body.coLeads];
  if (body.jointSecretaryLane !== undefined || create) normalized.jointSecretaryLane = jointSecretaryLanes.has(String(body.jointSecretaryLane)) ? body.jointSecretaryLane : "technical";
  if (create || body.active !== undefined) normalized.active = body.active !== false && body.active !== "false";
  return normalized;
}

function normalizeUserBody(input: Record<string, any>) {
  const body = clean(input);
  const normalized: Record<string, any> = { ...body };
  if ("teams" in input || "team" in input) {
    const teams = uniqueRefIds(input.teams ?? input.team);
    normalized.teams = teams;
    normalized.team = teams[0] || null;
  }
  if (body.semester !== undefined) normalized.semester = body.semester ? Number(body.semester) : undefined;
  return normalized;
}

function memberEmail(body: Record<string, any>) {
  const raw = String(body.email || "").trim().toLowerCase();
  if (raw && raw !== "undefined" && raw.includes("@")) return raw;
  const basis = String(body.uid || body.name || new Types.ObjectId().toString());
  return `${slugify(basis)}@members.techtatvaos.local`;
}

const eventStatuses = new Set(["draft", "published", "active", "completed", "archived"]);
const participationModes = new Set(["individual", "team", "both"]);
const recruitmentStatuses = new Set(["opening_soon", "open", "closing_soon", "closed", "full"]);
const applicationStatuses = new Set(["pending", "shortlisted", "accepted", "rejected", "on_hold"]);
const questionTypes = new Set(["short_text", "long_text", "number", "multiple_choice", "checkbox", "dropdown", "rating", "url", "file_upload"]);

function normalizeEventStatus(value: any, fallback = "published") {
  const status = String(value || fallback).toLowerCase().trim();
  if (eventStatuses.has(status)) return status;
  if (status === "final" || status === "live" || status === "public") return "published";
  if (status === "open") return "active";
  if (status === "closed" || status === "done") return "completed";
  return fallback;
}

function normalizeEventBody(input: Record<string, any>, create = false) {
  const body = clean(input);
  const normalized: Record<string, any> = { ...body };
  if (body.slug || body.title) normalized.slug = body.slug || slugify(body.title);
  if (body.capacity !== undefined) normalized.capacity = Number(body.capacity);
  if (body.maxTeamSize !== undefined) normalized.maxTeamSize = Math.max(1, Number(body.maxTeamSize) || 1);
  if (body.team !== undefined) normalized.team = refId(body.team);
  if (body.participationMode !== undefined || create) normalized.participationMode = participationModes.has(String(body.participationMode)) ? body.participationMode : "individual";
  if (create || body.status !== undefined) normalized.status = normalizeEventStatus(body.status, "published");
  if (create || body.registrationOpen !== undefined) normalized.registrationOpen = body.registrationOpen === true || body.registrationOpen === "true";
  if (body.registrationStart) normalized.registrationStart = new Date(body.registrationStart);
  if (body.registrationEnd) normalized.registrationEnd = new Date(body.registrationEnd);
  if (body.startAt) normalized.startAt = new Date(body.startAt);
  if (body.endAt) normalized.endAt = new Date(body.endAt);
  if (body.leads !== undefined) normalized.leads = refIds(body.leads);
  if ("winnerFirst" in input) normalized.winnerFirst = refId(input.winnerFirst) || null;
  if ("winnerSecond" in input) normalized.winnerSecond = refId(input.winnerSecond) || null;
  if ("winnerThird" in input) normalized.winnerThird = refId(input.winnerThird) || null;
  if (body.sponsors !== undefined) normalized.sponsors = refIds(body.sponsors);
  return normalized;
}

function parseGalleryAssets(value: any) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  try {
    const parsed = JSON.parse(String(value));
    return Array.isArray(parsed) ? parsed : [];
  } catch {
    return [];
  }
}

function normalizeGalleryBody(input: Record<string, any>) {
  const body = clean(input);
  const normalized: Record<string, any> = { ...body };
  if ("event" in input) normalized.event = refId(input.event) || null;
  if ("published" in input) normalized.published = input.published === true || input.published === "true";
  if ("assets" in input) {
    normalized.assets = parseGalleryAssets(input.assets)
      .filter((asset: any) => asset?.url)
      .map((asset: any) => ({
        url: String(asset.url),
        publicId: asset.publicId ? String(asset.publicId) : undefined,
        kind: asset.kind === "video" || asset.resourceType === "video" ? "video" : "image",
        caption: asset.caption ? String(asset.caption) : ""
      }));
  } else if (body.url) {
    normalized.assets = [{ url: body.url, publicId: body.publicId, kind: body.kind || "image", caption: body.caption }];
  }
  delete normalized.url;
  delete normalized.publicId;
  delete normalized.kind;
  delete normalized.caption;
  return normalized;
}

function userTeamIds(user: any) {
  if (!user) return [];
  const teams = uniqueRefIds(user.teams || []);
  const legacyTeam = refId(user.team);
  return teams.length ? teams : legacyTeam ? [legacyTeam] : [];
}

async function syncMemberTeams(userId: any, nextTeams: any[] = [], previousTeams: any[] = []) {
  const user = new Types.ObjectId(String(userId));
  const next = uniqueRefIds(nextTeams).filter((id) => Types.ObjectId.isValid(id));
  const previous = uniqueRefIds(previousTeams).filter((id) => Types.ObjectId.isValid(id));
  const nextSet = new Set(next);
  const removeFrom = previous.filter((id) => !nextSet.has(id));
  await Promise.all([
    removeFrom.length ? Team.updateMany({ _id: { $in: removeFrom } }, { $pull: { members: user } }) : Promise.resolve(),
    next.length ? Team.updateMany({ _id: { $in: next } }, { $addToSet: { members: user } }) : Promise.resolve()
  ]);
}

async function syncTeamLeadership(teamId: any, lead?: any, coLeads: any[] = []) {
  const ids = [lead, ...coLeads].filter(Boolean).map((id) => new Types.ObjectId(String(id)));
  if (!ids.length) return;
  await Promise.all([
    User.updateMany({ _id: { $in: ids } }, { $addToSet: { teams: teamId }, $set: { status: "active" } }),
    Team.findByIdAndUpdate(teamId, { $addToSet: { members: { $each: ids } } })
  ]);
}

function parseActionItems(value: any) {
  if (!value) return [];
  if (Array.isArray(value)) return value;
  return String(value)
    .split(/\n+/)
    .map((line) => line.trim())
    .filter(Boolean)
    .map((line) => {
      const [task, assignedTo = "", deadline = "", status = "Pending"] = line.split("|").map((part) => part.trim());
      return { task, assignedTo, deadline, status };
    });
}

function normalizeRecruitmentSettings(input: Record<string, any>) {
  const body = clean(input);
  const normalized: Record<string, any> = { ...body, key: "default" };
  if (body.status !== undefined) normalized.status = recruitmentStatuses.has(String(body.status)) ? body.status : "open";
  if ("registrationEnabled" in input) normalized.registrationEnabled = input.registrationEnabled === true || input.registrationEnabled === "true";
  if ("confirmationEmailEnabled" in input) normalized.confirmationEmailEnabled = input.confirmationEmailEnabled === true || input.confirmationEmailEnabled === "true";
  if ("emailOnAccepted" in input) normalized.emailOnAccepted = input.emailOnAccepted === true || input.emailOnAccepted === "true";
  if ("emailOnRejected" in input) normalized.emailOnRejected = input.emailOnRejected === true || input.emailOnRejected === "true";
  if ("emailOnShortlisted" in input) normalized.emailOnShortlisted = input.emailOnShortlisted === true || input.emailOnShortlisted === "true";
  if ("emailOnInterview" in input) normalized.emailOnInterview = input.emailOnInterview === true || input.emailOnInterview === "true";
  if ("autoCloseAfterDeadline" in input) normalized.autoCloseAfterDeadline = input.autoCloseAfterDeadline === true || input.autoCloseAfterDeadline === "true";
  if ("manualOverride" in input) normalized.manualOverride = input.manualOverride === true || input.manualOverride === "true";
  if (body.openingDate) normalized.openingDate = new Date(body.openingDate);
  if (body.closingDate) normalized.closingDate = new Date(body.closingDate);
  if (body.maximumApplications !== undefined) normalized.maximumApplications = Number(body.maximumApplications) || undefined;
  return normalized;
}

function normalizeRecruitmentTeam(input: Record<string, any>, create = false) {
  const body = clean(input);
  const normalized: Record<string, any> = { ...body };
  if (body.slug || body.name) normalized.slug = body.slug || slugify(body.name);
  if (body.order !== undefined) normalized.order = Number(body.order) || 0;
  if (body.applicationLimit !== undefined) normalized.applicationLimit = Number(body.applicationLimit) || undefined;
  if (create || "active" in input) normalized.active = input.active !== false && input.active !== "false";
  return normalized;
}

function normalizeRecruitmentRole(input: Record<string, any>, create = false) {
  const body = clean(input);
  const normalized: Record<string, any> = { ...body };
  if (body.slug || body.name) normalized.slug = body.slug || slugify(body.name);
  if ("team" in input) normalized.team = refId(input.team);
  if (body.order !== undefined) normalized.order = Number(body.order) || 0;
  if (create || "active" in input) normalized.active = input.active !== false && input.active !== "false";
  return normalized;
}

function normalizeRecruitmentQuestion(input: Record<string, any>, create = false) {
  const body = clean(input);
  const normalized: Record<string, any> = { ...body };
  if ("team" in input) normalized.team = refId(input.team);
  if ("role" in input) normalized.role = refId(input.role) || null;
  if (body.order !== undefined) normalized.order = Number(body.order) || 0;
  if (create || "required" in input) normalized.required = input.required === true || input.required === "true";
  if (create || "active" in input) normalized.active = input.active !== false && input.active !== "false";
  if (body.type !== undefined) normalized.type = questionTypes.has(String(body.type)) ? body.type : "long_text";
  if (body.options !== undefined) normalized.options = Array.isArray(body.options) ? body.options : String(body.options).split(/\n|,/).map((option) => option.trim()).filter(Boolean);
  return normalized;
}

export async function createResource(resource: AdminResource, input: Record<string, any>, actorId?: string) {
  const body = clean(input);
  if (resource === "settings") {
    const entries = Object.entries(body);
    await Promise.all(entries.map(([key, value]) => ClubInfo.findOneAndUpdate({ key }, { key, value }, { upsert: true })));
    return { updated: entries.length };
  }
  if (resource === "teams") {
    const team = await Team.create(normalizeTeamBody(body, true));
    await syncTeamLeadership(team._id, team.lead, team.coLeads);
    return team;
  }
  if (resource === "users") {
    const email = memberEmail(body);
    const userBody = normalizeUserBody(body);
    const existing = await User.findOne({ email }).select("team teams").lean();
    const user = await User.findOneAndUpdate(
      { email },
      { ...userBody, email, memberType: "club_member", status: body.status || "active" },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await syncMemberTeams(user._id, userTeamIds(user), userTeamIds(existing));
    return user;
  }
  if (resource === "events") {
    return Event.create(normalizeEventBody(body, true));
  }
  if (resource === "meetings") {
    return Meeting.create({
      ...body,
      date: body.date ? new Date(body.date) : undefined,
      organizer: refId(body.organizer),
      attendees: refIds(body.attendees),
      actionItems: parseActionItems(body.actionItems)
    });
  }
  if (resource === "tasks") {
    return Task.create({ ...body, createdBy: actorId, dueAt: body.dueAt ? new Date(body.dueAt) : undefined });
  }
  if (resource === "announcements") {
    return Announcement.create({ ...body, author: actorId, publishAt: body.publishAt ? new Date(body.publishAt) : new Date() });
  }
  if (resource === "sponsors") return Sponsor.create({ ...body, active: body.active !== "false" });
  if (resource === "achievements") return Achievement.create({ ...body, awardedAt: body.awardedAt ? new Date(body.awardedAt) : undefined, featured: body.featured === true || body.featured === "true" });
  if (resource === "gallery") {
    return Gallery.create(normalizeGalleryBody(input));
  }
  if (resource === "hallOfFame") return HallOfFame.create({ ...body, year: body.year ? Number(body.year) : undefined, order: body.order ? Number(body.order) : undefined, active: body.active !== "false" });
  if (resource === "contacts") return ContactMessage.findByIdAndUpdate(body.id, { status: body.status }, { new: true });
  if (resource === "recruitmentSettings") return RecruitmentSettings.findOneAndUpdate({ key: "default" }, normalizeRecruitmentSettings(body), { upsert: true, new: true, setDefaultsOnInsert: true });
  if (resource === "recruitmentTeams") return RecruitmentTeam.create(normalizeRecruitmentTeam(body, true));
  if (resource === "recruitmentRoles") return RecruitmentRole.create(normalizeRecruitmentRole(body, true));
  if (resource === "recruitmentQuestions") return RecruitmentQuestion.create(normalizeRecruitmentQuestion(body, true));
  if (resource === "recruitmentApplications") return RecruitmentApplication.create(body);
}

export async function updateResource(resource: AdminResource, id: string, input: Record<string, any>) {
  const body = clean(input);
  if (resource === "teams") {
    const team = await Team.findByIdAndUpdate(id, normalizeTeamBody(input), { new: true });
    if (team) await syncTeamLeadership(team._id, team.lead, team.coLeads);
    return team;
  }
  if (resource === "users") {
    const existing = await User.findById(id).select("team teams").lean();
    const user = await User.findByIdAndUpdate(id, { ...normalizeUserBody(input), memberType: "club_member" }, { new: true });
    if (user) await syncMemberTeams(user._id, userTeamIds(user), userTeamIds(existing));
    return user;
  }
  if (resource === "events") return Event.findByIdAndUpdate(id, normalizeEventBody(input), { new: true, runValidators: true });
  if (resource === "meetings") return Meeting.findByIdAndUpdate(id, { ...body, date: body.date ? new Date(body.date) : undefined, organizer: refId(body.organizer), attendees: refIds(body.attendees), actionItems: parseActionItems(body.actionItems) }, { new: true });
  if (resource === "tasks") return Task.findByIdAndUpdate(id, { ...body, dueAt: body.dueAt ? new Date(body.dueAt) : undefined }, { new: true });
  if (resource === "announcements") return Announcement.findByIdAndUpdate(id, { ...body, publishAt: body.publishAt ? new Date(body.publishAt) : undefined }, { new: true });
  if (resource === "sponsors") return Sponsor.findByIdAndUpdate(id, { ...body, active: body.active !== "false" }, { new: true });
  if (resource === "achievements") return Achievement.findByIdAndUpdate(id, { ...body, awardedAt: body.awardedAt ? new Date(body.awardedAt) : undefined, featured: body.featured === true || body.featured === "true" }, { new: true });
  if (resource === "gallery") return Gallery.findByIdAndUpdate(id, normalizeGalleryBody(input), { new: true });
  if (resource === "hallOfFame") return HallOfFame.findByIdAndUpdate(id, { ...body, year: body.year ? Number(body.year) : undefined, order: body.order ? Number(body.order) : undefined, active: body.active !== "false" }, { new: true });
  if (resource === "contacts") return ContactMessage.findByIdAndUpdate(id, { status: body.status }, { new: true });
  if (resource === "recruitmentSettings") return RecruitmentSettings.findByIdAndUpdate(id, normalizeRecruitmentSettings(input), { new: true, runValidators: true });
  if (resource === "recruitmentTeams") return RecruitmentTeam.findByIdAndUpdate(id, normalizeRecruitmentTeam(input), { new: true, runValidators: true });
  if (resource === "recruitmentRoles") return RecruitmentRole.findByIdAndUpdate(id, normalizeRecruitmentRole(input), { new: true, runValidators: true });
  if (resource === "recruitmentQuestions") return RecruitmentQuestion.findByIdAndUpdate(id, normalizeRecruitmentQuestion(input), { new: true, runValidators: true });
  if (resource === "recruitmentApplications") {
    const status = applicationStatuses.has(String(body.status)) ? body.status : undefined;
    const update: Record<string, any> = {};
    if (body.adminNotes !== undefined) update.adminNotes = body.adminNotes;
    if (status) update.status = status;
    const push: Record<string, any> = {};
    if (status) push.timeline = { action: status, note: body.adminNotes || "", at: new Date() };
    const application = await RecruitmentApplication.findByIdAndUpdate(
      id,
      { ...(Object.keys(update).length ? { $set: update } : {}), ...(Object.keys(push).length ? { $push: push } : {}) },
      { new: true, runValidators: true }
    ).populate("team", "name").populate("role", "name").lean() as any;
    if (application && status) {
      const settings = await RecruitmentSettings.findOne({ key: "default" }).lean() as any;
      await sendApplicationStatusEmail(
        settings || {},
        {
          fullName: application.fullName,
          email: application.email,
          teamName: application.team?.name,
          roleName: application.role?.name
        },
        status,
        body.adminNotes
      );
    }
    return application;
  }
}

export async function deleteResource(resource: AdminResource, id: string) {
  if (resource === "teams") return Team.findByIdAndUpdate(id, { active: false }, { new: true });
  if (resource === "users") {
    const user = await User.findById(id).select("team teams").lean();
    const userObjectId = new Types.ObjectId(String(id));
    await Promise.all([
      Team.updateMany({ $or: [{ members: userObjectId }, { coLeads: userObjectId }] }, { $pull: { members: userObjectId, coLeads: userObjectId } }),
      Team.updateMany({ lead: userObjectId }, { $unset: { lead: "" }, $pull: { members: userObjectId, coLeads: userObjectId } }),
      Attendance.deleteMany({ user: userObjectId }),
      EventRegistration.deleteMany({ user: userObjectId })
    ]);
    await syncMemberTeams(id, [], userTeamIds(user));
    return User.findByIdAndDelete(id);
  }
  if (resource === "events") {
    await Promise.all([EventRegistration.deleteMany({ event: id }), Attendance.deleteMany({ event: id })]);
    return Event.findByIdAndDelete(id);
  }
  if (resource === "meetings") return Meeting.findByIdAndUpdate(id, { status: "archived" }, { new: true });
  if (resource === "tasks") return Task.findByIdAndDelete(id);
  if (resource === "announcements") return Announcement.findByIdAndUpdate(id, { status: "archived" }, { new: true });
  if (resource === "sponsors") return Sponsor.findByIdAndUpdate(id, { active: false }, { new: true });
  if (resource === "achievements") return Achievement.findByIdAndDelete(id);
  if (resource === "gallery") return Gallery.findByIdAndUpdate(id, { published: false }, { new: true });
  if (resource === "hallOfFame") return HallOfFame.findByIdAndUpdate(id, { active: false }, { new: true });
  if (resource === "contacts") return ContactMessage.findByIdAndUpdate(id, { status: "resolved" }, { new: true });
  if (resource === "recruitmentTeams") return RecruitmentTeam.findByIdAndUpdate(id, { active: false }, { new: true });
  if (resource === "recruitmentRoles") return RecruitmentRole.findByIdAndUpdate(id, { active: false }, { new: true });
  if (resource === "recruitmentQuestions") return RecruitmentQuestion.findByIdAndUpdate(id, { active: false }, { new: true });
  if (resource === "recruitmentApplications") return RecruitmentApplication.findByIdAndUpdate(id, { status: "rejected", $push: { timeline: { action: "rejected", note: "Archived from portal", at: new Date() } } }, { new: true });
}
