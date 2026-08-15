import "server-only";
import { connectDB } from "@/lib/db";
import {
  Event,
  EventRegistration,
  LeaderboardEntry,
  Team,
  User,
} from "@/lib/models";
import { TM_CONFIG } from "@/lib/technomania-theme";

const serialize = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");
const escapeRegex = (value: string) => value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
const slugRegex = (value: string) => ({ $regex: `^${escapeRegex(value)}$`, $options: "i" });

export async function getTechnomaniaEvents() {
  try {
    await connectDB();
    const events = await Event.find({
      fest: "technomania",
      status: { $in: ["published", "active", "completed"] },
    })
      .sort({ startAt: 1 })
      .lean();

    const eventIds = events.map((e: any) => e._id);
    const regs = await EventRegistration.aggregate([
      { $match: { event: { $in: eventIds }, status: "confirmed" } },
      { $group: { _id: "$event", count: { $sum: 1 } } },
    ]);
    
    const counts = Object.fromEntries(regs.map((r: any) => [String(r._id), r.count]));

    return serialize(
      events.map((e: any) => ({
        id: String(e._id),
        slug: e.slug,
        title: e.title,
        description: e.description,
        banner: e.banner,
        venue: e.venue,
        capacity: e.capacity,
        category: e.category,
        status: e.status,
        participationMode: e.participationMode,
        maxTeamSize: e.maxTeamSize,
        registrationOpen: e.registrationOpen,
        startAt: e.startAt,
        endAt: e.endAt,
        certEventLogo: e.certEventLogo,
        fest: e.fest,
        leaderboardVisible: e.leaderboardVisible,
        registrations: counts[String(e._id)] || 0,
      }))
    );
  } catch (err) {
    console.error("Error in getTechnomaniaEvents:", err);
    return [];
  }
}

export async function getTechnomaniaEvent(slug: string) {
  try {
    await connectDB();
    const decoded = decodeURIComponent(slug);
    
    const query = {
      fest: "technomania",
      status: { $in: ["published", "active", "completed"] },
      $or: [
        { slug },
        { slug: slugRegex(slug) },
        { title: slugRegex(decoded) },
        { slug: slugify(decoded) }
      ]
    };

    const event: any = await Event.findOne(query).lean();
    if (!event) return null;

    const regsCount = await EventRegistration.countDocuments({
      event: event._id,
      status: "confirmed"
    });

    const leaderboards = await LeaderboardEntry.find({ event: event._id, isHidden: { $ne: true } })
      .sort({ rank: 1 })
      .lean();

    return serialize({
      ...event,
      id: String(event._id),
      _id: undefined,
      registrations: regsCount,
      leaderboardVisible: event.leaderboardVisible,
      leaderboard: leaderboards.map((l: any) => ({
        ...l,
        id: String(l._id),
        _id: undefined
      }))
    });
  } catch (err) {
    console.error("Error in getTechnomaniaEvent:", err);
    return null;
  }
}

export async function getTechnomaniaStats() {
  try {
    await connectDB();
    
    const totalEvents = await Event.countDocuments({ fest: "technomania", status: { $in: ["published", "active", "completed"] } });
    const liveEvents = await Event.countDocuments({ fest: "technomania", status: "active" });
    
    const events = await Event.find({ fest: "technomania" }).select("_id").lean();
    const eventIds = events.map((e: any) => e._id);
    
    const totalRegistrations = await EventRegistration.countDocuments({ event: { $in: eventIds }, status: "confirmed" });
    
    const upcomingEvents = await Event.countDocuments({ fest: "technomania", status: "published", startAt: { $gt: new Date() } });

    return serialize({
      totalEvents,
      liveEvents,
      totalRegistrations,
      upcomingEvents
    });
  } catch (err) {
    console.error("Error in getTechnomaniaStats:", err);
    return {
      totalEvents: 0,
      liveEvents: 0,
      totalRegistrations: 0,
      upcomingEvents: 0
    };
  }
}

export async function getTechnomaniaSchedule() {
  try {
    await connectDB();
    const events = await Event.find({ fest: "technomania", status: { $in: ["published", "active", "completed"] } })
      .select("slug title category startAt endAt venue status schedule")
      .sort({ startAt: 1 })
      .lean();
      
    return serialize(events.map((e: any) => ({
      id: String(e._id),
      slug: e.slug,
      title: e.title,
      category: e.category,
      startAt: e.startAt,
      endAt: e.endAt,
      venue: e.venue,
      status: e.status,
      schedule: e.schedule
    })));
  } catch (err) {
    console.error("Error in getTechnomaniaSchedule:", err);
    return [];
  }
}

