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
  GeneratedDocument,
  HallOfFame,
  AIConversation,
  Meeting,
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
  participationMode: "individual" | "team" | "both";
  maxTeamSize: number;
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
  jointSecretaryLane?: "technical" | "creative";
  facultyChampionName?: string;
  members: number;
  memberNames: string[];
};

export type HallMember = {
  id: string;
  name: string;
  category: "secretary" | "joint_secretary" | "team_lead" | "top_contributor" | "alumni";
  title?: string;
  subtitle?: string;
  batch?: string;
  year?: number;
  image?: string;
  team?: string;
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
      participationMode: (event as any).participationMode || "individual",
      maxTeamSize: (event as any).maxTeamSize || 1,
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
    participationMode: record.participationMode || "individual",
    maxTeamSize: record.maxTeamSize || 1,
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
  const members = await User.find({ team: { $in: teams.map((team) => team._id) }, memberType: "club_member", status: "active" })
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
      jointSecretaryLane: (team as any).jointSecretaryLane || "technical",
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

export async function getHallOfFameData() {
  await connectDB();
  const [clubInfo, teams, hallRows] = await Promise.all([
    getClubInfo(),
    Team.find({ active: true }).sort({ order: 1, name: 1 }).populate("lead", "name image uid program").lean(),
    HallOfFame.find({ active: true }).sort({ category: 1, order: 1, year: -1, name: 1 }).lean()
  ]);

  const secretary: HallMember[] = clubInfo.secretaryName ? [{
    id: "secretary",
    name: clubInfo.secretaryName,
    category: "secretary",
    title: "Secretary",
    subtitle: clubInfo.secretaryEmail,
    image: clubInfo.secretaryPhoto
  }] : [];

  const jointSecretaries: HallMember[] = [
    clubInfo.jointSecretaryOneName ? {
      id: "joint-secretary-technical",
      name: clubInfo.jointSecretaryOneName,
      category: "joint_secretary" as const,
      title: "Joint Secretary (Technical & Operations)",
      subtitle: clubInfo.jointSecretaryOneEmail,
      image: clubInfo.jointSecretaryOnePhoto
    } : null,
    clubInfo.jointSecretaryTwoName ? {
      id: "joint-secretary-creative",
      name: clubInfo.jointSecretaryTwoName,
      category: "joint_secretary" as const,
      title: "Joint Secretary (Media & Creative)",
      subtitle: clubInfo.jointSecretaryTwoEmail,
      image: clubInfo.jointSecretaryTwoPhoto
    } : null
  ].filter(Boolean) as HallMember[];

  const teamLeads: HallMember[] = teams
    .filter((team: any) => team.lead?.name)
    .map((team: any) => ({
      id: `team-${String(team._id)}`,
      name: team.lead.name,
      category: "team_lead",
      title: `${team.name} Lead`,
      subtitle: team.lead.program || team.lead.uid,
      image: team.lead.image,
      team: team.name
    }));

  const manual: HallMember[] = hallRows.map((row: any) => ({
    id: String(row._id),
    name: row.name,
    category: row.category,
    title: row.title,
    subtitle: row.subtitle,
    batch: row.batch,
    year: row.year,
    image: row.image
  }));

  const items = [...secretary, ...jointSecretaries, ...manual, ...teamLeads];
  return serialize({
    secretary,
    jointSecretaries,
    teamLeads,
    topContributors: items.filter((item) => item.category === "top_contributor"),
    alumni: items.filter((item) => item.category === "alumni")
  });
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
    User.countDocuments({ memberType: "club_member", status: "active" }),
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
  const clubMemberQuery = {
    $or: [
      { memberType: "club_member" },
      { team: { $ne: null } },
      { portalAccess: true },
      { role: { $ne: null } }
    ]
  };
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
    hallOfFame,
    contactMessages,
    clubInfo,
    meetings,
    generatedDocuments,
    aiConversations
  ] = await Promise.all([
    User.find(clubMemberQuery).sort({ createdAt: -1 }).limit(300).populate("role", "name slug").populate("team", "name").lean(),
    Team.find({}).sort({ order: 1, name: 1 }).populate("lead", "name").populate("coLeads", "name").lean(),
    Event.find({}).sort({ startAt: -1 }).limit(200).populate("team", "name").populate("winnerFirst", "name uid email program semester").populate("winnerSecond", "name uid email program semester").populate("winnerThird", "name uid email program semester").lean(),
    Task.find({}).sort({ dueAt: 1 }).limit(200).populate("team", "name").lean(),
    Announcement.find({}).sort({ publishAt: -1 }).limit(200).lean(),
    Notification.find({}).sort({ createdAt: -1 }).limit(50).lean(),
    Attendance.find({}).populate("event", "title").populate("user", "name email uid registrationNumber program semester").limit(1000).lean(),
    EventRegistration.find({}).populate("event", "title participationMode").populate("user", "name email uid registrationNumber program semester").limit(1000).lean(),
    Sponsor.find({}).sort({ name: 1 }).lean(),
    Achievement.find({}).sort({ awardedAt: -1 }).lean(),
    Gallery.find({}).sort({ createdAt: -1 }).lean(),
    HallOfFame.find({}).sort({ category: 1, order: 1, year: -1, name: 1 }).lean(),
    ContactMessage.find({}).sort({ createdAt: -1 }).limit(200).lean(),
    getClubInfo(),
    Meeting.find({}).sort({ date: -1 }).limit(200).populate("organizer", "name email").populate("attendees", "name email").lean(),
    GeneratedDocument.find({}).sort({ generatedAt: -1 }).limit(100).populate("event", "title").populate("meeting", "title").lean(),
    AIConversation.find({}).sort({ createdAt: -1 }).limit(100).lean()
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
    hallOfFame,
    contactMessages,
    clubInfo,
    meetings,
    generatedDocuments,
    aiConversations
  });
}
