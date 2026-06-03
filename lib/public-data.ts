import "server-only";
import { connectDB } from "@/lib/db";
import {
  Achievement,
  Announcement,
  Attendance,
  ClubInfo,
  ContactMessage,
  Event,
  EventRegistration,
  Gallery,
  Notification,
  Sponsor,
  Task,
  Team,
  User
} from "@/lib/models";

const serialize = <T>(value: T): T => JSON.parse(JSON.stringify(value));

export type PublicEvent = {
  id: string;
  slug: string;
  title: string;
  description?: string;
  banner?: string;
  venue?: string;
  capacity?: number;
  category?: string;
  status: string;
  registrationOpen: boolean;
  startAt?: string;
  endAt?: string;
  team?: string;
  registrations: number;
};

export type PublicTeam = {
  id: string;
  name: string;
  slug: string;
  description?: string;
  lead?: string;
  coLeads: string[];
  facultyChampionName?: string;
  members: number;
  memberNames: string[];
};

export async function getClubInfo() {
  await connectDB();
  const rows = await ClubInfo.find({}).lean();
  return Object.fromEntries(rows.map((row) => [row.key, row.value])) as Record<string, any>;
}

export async function getPublicEvents(limit?: number): Promise<PublicEvent[]> {
  await connectDB();
  const events = await Event.find({ status: { $in: ["published", "active", "completed"] } })
    .sort({ startAt: 1 })
    .limit(limit || 0)
    .populate("team", "name")
    .lean();
  const counts = await EventRegistration.aggregate([
    { $match: { event: { $in: events.map((event) => event._id) }, status: "confirmed" } },
    { $group: { _id: "$event", count: { $sum: 1 } } }
  ]);
  const countMap = new Map(counts.map((item) => [String(item._id), item.count]));
  return serialize(
    events.map((event) => ({
      id: String(event._id),
      slug: event.slug,
      title: event.title,
      description: event.description,
      banner: event.banner,
      venue: event.venue,
      capacity: event.capacity,
      category: event.category,
      status: event.status,
      registrationOpen: event.registrationOpen,
      startAt: event.startAt?.toISOString(),
      endAt: event.endAt?.toISOString(),
      team: (event.team as unknown as { name?: string })?.name,
      registrations: countMap.get(String(event._id)) || 0
    }))
  );
}

export async function getPublicEvent(slug: string) {
  await connectDB();
  const event = await Event.findOne({ slug, status: { $in: ["published", "active", "completed"] } })
    .populate("team", "name")
    .populate("leads", "name email")
    .populate("sponsors", "name logo website level")
    .lean();
  if (!event) return null;
  const record: any = event;
  const registrations = await EventRegistration.countDocuments({ event: record._id, status: "confirmed" });
  return serialize({
    id: String(record._id),
    slug: record.slug,
    title: record.title,
    description: record.description,
    banner: record.banner,
    venue: record.venue,
    capacity: record.capacity,
    category: record.category,
    status: record.status,
    registrationOpen: record.registrationOpen,
    registrationStart: record.registrationStart?.toISOString(),
    registrationEnd: record.registrationEnd?.toISOString(),
    startAt: record.startAt?.toISOString(),
    endAt: record.endAt?.toISOString(),
    schedule: record.schedule || [],
    rules: record.rules || [],
    faqs: record.faqs || [],
    team: (record.team as { name?: string })?.name,
    leads: (record.leads || []).map((lead: any) => ({ name: lead.name, email: lead.email })),
    sponsors: (record.sponsors || []).map((sponsor: any) => ({
      name: sponsor.name,
      logo: sponsor.logo,
      website: sponsor.website,
      level: sponsor.level
    })),
    registrations
  });
}

export async function getPublicTeams(): Promise<PublicTeam[]> {
  await connectDB();
  const teams = await Team.find({ active: true })
    .sort({ order: 1, name: 1 })
    .populate("lead", "name")
    .populate("coLeads", "name")
    .lean();
  const members = await User.find({ team: { $in: teams.map((team) => team._id) }, status: "active" })
    .sort({ name: 1 })
    .select("name team")
    .lean();
  const memberMap = new Map<string, string[]>();
  for (const member of members) {
    const key = String(member.team);
    memberMap.set(key, [...(memberMap.get(key) || []), member.name]);
  }
  return serialize(
    teams.map((team) => ({
      id: String(team._id),
      name: team.name,
      slug: team.slug,
      description: team.description,
      lead: (team.lead as unknown as { name?: string })?.name,
      coLeads: (team.coLeads || []).map((lead: any) => lead.name).filter(Boolean),
      facultyChampionName: team.facultyChampionName,
      members: memberMap.get(String(team._id))?.length || 0,
      memberNames: memberMap.get(String(team._id)) || []
    }))
  );
}

export async function getPublicGallery() {
  await connectDB();
  const rows = await Gallery.find({ published: true }).sort({ createdAt: -1 }).limit(24).populate("event", "title").lean();
  return serialize(rows.map((row) => ({
    id: String(row._id),
    title: row.title,
    event: (row.event as unknown as { title?: string })?.title,
    assets: row.assets || []
  })));
}

export async function getPublicHomeData() {
  await connectDB();
  const [clubInfo, events, teams, achievements, sponsors, gallery] = await Promise.all([
    getClubInfo(),
    getPublicEvents(4),
    getPublicTeams(),
    Achievement.find({ featured: true }).sort({ awardedAt: -1 }).limit(3).lean(),
    Sponsor.find({ active: true }).sort({ level: 1, name: 1 }).limit(8).lean(),
    Gallery.find({ published: true }).sort({ createdAt: -1 }).limit(4).lean()
  ]);
  const [members, eventCount, teamCount] = await Promise.all([
    User.countDocuments({ status: "active" }),
    Event.countDocuments({ status: { $in: ["published", "active", "completed"] } }),
    Team.countDocuments({ active: true })
  ]);
  return serialize({
    clubInfo,
    events,
    teams,
    achievements,
    sponsors,
    gallery,
    stats: { members, events: eventCount, teams: teamCount }
  });
}

export async function getAdminDashboardData() {
  await connectDB();
  const [
    users,
    teams,
    events,
    tasks,
    announcements,
    notifications,
    attendance,
    registrations,
    sponsors,
    achievements,
    gallery,
    contactMessages,
    clubInfo
  ] = await Promise.all([
    User.find({}).sort({ createdAt: -1 }).limit(200).populate("role", "name slug").populate("team", "name").lean(),
    Team.find({}).sort({ order: 1, name: 1 }).populate("lead", "name").populate("coLeads", "name").lean(),
    Event.find({}).sort({ startAt: -1 }).limit(200).populate("team", "name").lean(),
    Task.find({}).sort({ dueAt: 1 }).limit(200).populate("team", "name").lean(),
    Announcement.find({}).sort({ publishAt: -1 }).limit(200).lean(),
    Notification.find({}).sort({ createdAt: -1 }).limit(50).lean(),
    Attendance.find({}).populate("event", "title").populate("user", "name uid").limit(500).lean(),
    EventRegistration.find({}).populate("event", "title").populate("user", "name email uid").limit(500).lean(),
    Sponsor.find({}).sort({ name: 1 }).lean(),
    Achievement.find({}).sort({ awardedAt: -1 }).lean(),
    Gallery.find({}).sort({ createdAt: -1 }).lean(),
    ContactMessage.find({}).sort({ createdAt: -1 }).limit(200).lean(),
    getClubInfo()
  ]);
  return serialize({
    users,
    teams,
    events,
    tasks,
    announcements,
    notifications,
    attendance,
    registrations,
    sponsors,
    achievements,
    gallery,
    contactMessages,
    clubInfo
  });
}
