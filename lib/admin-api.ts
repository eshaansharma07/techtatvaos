import { Types } from "mongoose";
import {
  Achievement,
  Announcement,
  ClubInfo,
  ContactMessage,
  Event,
  Gallery,
  Sponsor,
  Task,
  Team,
  User
} from "@/lib/models";

export const adminResources = [
  "users",
  "teams",
  "events",
  "tasks",
  "announcements",
  "sponsors",
  "achievements",
  "gallery",
  "contacts",
  "settings"
] as const;

export type AdminResource = (typeof adminResources)[number];

export function slugify(value: string) {
  return value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "") || new Types.ObjectId().toString();
}

const clean = (input: Record<string, any>) =>
  Object.fromEntries(Object.entries(input).filter(([, value]) => value !== "" && value !== undefined && value !== null));

async function syncMemberTeam(userId: any, nextTeam?: any, previousTeam?: any) {
  const user = new Types.ObjectId(String(userId));
  const next = nextTeam ? String(nextTeam) : "";
  const previous = previousTeam ? String(previousTeam) : "";
  if (previous && previous !== next) await Team.findByIdAndUpdate(previous, { $pull: { members: user } });
  if (next) await Team.findByIdAndUpdate(next, { $addToSet: { members: user } });
}

export async function createResource(resource: AdminResource, input: Record<string, any>, actorId?: string) {
  const body = clean(input);
  if (resource === "settings") {
    const entries = Object.entries(body);
    await Promise.all(entries.map(([key, value]) => ClubInfo.findOneAndUpdate({ key }, { key, value }, { upsert: true })));
    return { updated: entries.length };
  }
  if (resource === "teams") {
    return Team.create({ ...body, slug: body.slug || slugify(body.name), active: body.active !== "false" });
  }
  if (resource === "users") {
    const email = String(body.email).toLowerCase();
    const existing = await User.findOne({ email }).select("team").lean();
    const user = await User.findOneAndUpdate(
      { email },
      { ...body, email, semester: body.semester ? Number(body.semester) : undefined },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );
    await syncMemberTeam(user._id, user.team, (existing as any)?.team);
    return user;
  }
  if (resource === "events") {
    return Event.create({
      ...body,
      slug: body.slug || slugify(body.title),
      capacity: body.capacity ? Number(body.capacity) : undefined,
      registrationOpen: body.registrationOpen === true || body.registrationOpen === "true",
      startAt: body.startAt ? new Date(body.startAt) : undefined,
      endAt: body.endAt ? new Date(body.endAt) : undefined
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
    return Gallery.create({
      title: body.title,
      published: body.published !== "false",
      assets: body.url ? [{ url: body.url, publicId: body.publicId, kind: body.kind || "image", caption: body.caption }] : []
    });
  }
  if (resource === "contacts") return ContactMessage.findByIdAndUpdate(body.id, { status: body.status }, { new: true });
}

export async function updateResource(resource: AdminResource, id: string, input: Record<string, any>) {
  const body = clean(input);
  if (resource === "teams") return Team.findByIdAndUpdate(id, { ...body, active: body.active !== "false" }, { new: true });
  if (resource === "users") {
    const existing = await User.findById(id).select("team").lean();
    const user = await User.findByIdAndUpdate(id, { ...body, semester: body.semester ? Number(body.semester) : undefined }, { new: true });
    if (user) await syncMemberTeam(user._id, user.team, (existing as any)?.team);
    return user;
  }
  if (resource === "events") return Event.findByIdAndUpdate(id, { ...body, capacity: body.capacity ? Number(body.capacity) : undefined, registrationOpen: body.registrationOpen === true || body.registrationOpen === "true", startAt: body.startAt ? new Date(body.startAt) : undefined, endAt: body.endAt ? new Date(body.endAt) : undefined }, { new: true });
  if (resource === "tasks") return Task.findByIdAndUpdate(id, { ...body, dueAt: body.dueAt ? new Date(body.dueAt) : undefined }, { new: true });
  if (resource === "announcements") return Announcement.findByIdAndUpdate(id, { ...body, publishAt: body.publishAt ? new Date(body.publishAt) : undefined }, { new: true });
  if (resource === "sponsors") return Sponsor.findByIdAndUpdate(id, { ...body, active: body.active !== "false" }, { new: true });
  if (resource === "achievements") return Achievement.findByIdAndUpdate(id, { ...body, awardedAt: body.awardedAt ? new Date(body.awardedAt) : undefined, featured: body.featured === true || body.featured === "true" }, { new: true });
  if (resource === "gallery") return Gallery.findByIdAndUpdate(id, body.url ? { title: body.title, published: body.published !== "false", assets: [{ url: body.url, publicId: body.publicId, kind: body.kind || "image", caption: body.caption }] } : body, { new: true });
  if (resource === "contacts") return ContactMessage.findByIdAndUpdate(id, { status: body.status }, { new: true });
}

export async function deleteResource(resource: AdminResource, id: string) {
  if (resource === "teams") return Team.findByIdAndUpdate(id, { active: false }, { new: true });
  if (resource === "users") {
    const user = await User.findByIdAndUpdate(id, { status: "inactive" }, { new: true });
    if (user?.team) await syncMemberTeam(user._id, undefined, user.team);
    return user;
  }
  if (resource === "events") return Event.findByIdAndUpdate(id, { status: "archived", registrationOpen: false }, { new: true });
  if (resource === "tasks") return Task.findByIdAndDelete(id);
  if (resource === "announcements") return Announcement.findByIdAndUpdate(id, { status: "archived" }, { new: true });
  if (resource === "sponsors") return Sponsor.findByIdAndUpdate(id, { active: false }, { new: true });
  if (resource === "achievements") return Achievement.findByIdAndDelete(id);
  if (resource === "gallery") return Gallery.findByIdAndUpdate(id, { published: false }, { new: true });
  if (resource === "contacts") return ContactMessage.findByIdAndUpdate(id, { status: "resolved" }, { new: true });
}
