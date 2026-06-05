import { Types } from "mongoose";
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
  Meeting
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
  "settings"
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
const refIds = (value: any) => (Array.isArray(value) ? value : [value]).map(refId).filter(Boolean);
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

function memberEmail(body: Record<string, any>) {
  const raw = String(body.email || "").trim().toLowerCase();
  if (raw && raw !== "undefined" && raw.includes("@")) return raw;
  const basis = String(body.uid || body.registrationNumber || body.name || new Types.ObjectId().toString());
  return `${slugify(basis)}@members.techtatvaos.local`;
}

const eventStatuses = new Set(["draft", "published", "active", "completed", "archived"]);
const participationModes = new Set(["individual", "team", "both"]);

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

async function syncMemberTeam(userId: any, nextTeam?: any, previousTeam?: any) {
  const user = new Types.ObjectId(String(userId));
  const next = nextTeam ? String(nextTeam) : "";
  const previous = previousTeam ? String(previousTeam) : "";
  if (previous && previous !== next) await Team.findByIdAndUpdate(previous, { $pull: { members: user } });
  if (next) await Team.findByIdAndUpdate(next, { $addToSet: { members: user } });
}

async function syncTeamLeadership(teamId: any, lead?: any, coLeads: any[] = []) {
  const ids = [lead, ...coLeads].filter(Boolean).map((id) => new Types.ObjectId(String(id)));
  if (!ids.length) return;
  await Promise.all([
    User.updateMany({ _id: { $in: ids } }, { $set: { team: teamId, status: "active" } }),
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
    const existing = await User.findOne({ email }).select("team").lean();
    const user = await User.findOneAndUpdate(
      { email },
      { ...body, email, memberType: "club_member", status: body.status || "active", semester: body.semester ? Number(body.semester) : undefined },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await syncMemberTeam(user._id, user.team, (existing as any)?.team);
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
}

export async function updateResource(resource: AdminResource, id: string, input: Record<string, any>) {
  const body = clean(input);
  if (resource === "teams") {
    const team = await Team.findByIdAndUpdate(id, normalizeTeamBody(input), { new: true });
    if (team) await syncTeamLeadership(team._id, team.lead, team.coLeads);
    return team;
  }
  if (resource === "users") {
    const existing = await User.findById(id).select("team").lean();
    const user = await User.findByIdAndUpdate(id, { ...body, memberType: "club_member", semester: body.semester ? Number(body.semester) : undefined }, { new: true });
    if (user) await syncMemberTeam(user._id, user.team, (existing as any)?.team);
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
}

export async function deleteResource(resource: AdminResource, id: string) {
  if (resource === "teams") return Team.findByIdAndUpdate(id, { active: false }, { new: true });
  if (resource === "users") {
    const user = await User.findById(id).select("team").lean();
    const userObjectId = new Types.ObjectId(String(id));
    await Promise.all([
      Team.updateMany({ $or: [{ members: userObjectId }, { coLeads: userObjectId }] }, { $pull: { members: userObjectId, coLeads: userObjectId } }),
      Team.updateMany({ lead: userObjectId }, { $unset: { lead: "" }, $pull: { members: userObjectId, coLeads: userObjectId } }),
      Attendance.deleteMany({ user: userObjectId }),
      EventRegistration.deleteMany({ user: userObjectId })
    ]);
    if ((user as any)?.team) await syncMemberTeam(id, undefined, (user as any).team);
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
}
