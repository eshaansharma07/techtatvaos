import "server-only";
import { connectDB } from "@/lib/db";
import { Event, EventRegistration } from "@/lib/models";
import { FestConfig } from "@/lib/models/FestConfig";
import { TM_CONFIG } from "@/lib/technomania-theme";

const serialize = <T>(v: T): T => JSON.parse(JSON.stringify(v));
const slugify = (value: string) => value.toLowerCase().trim().replace(/[^a-z0-9]+/g, "-").replace(/(^-|-$)/g, "");

const TECHNOMANIA_SEED = [
  {
    "slug": "hackverse",
    "title": "HackVerse",
    "category": "DeepTech & AI",
    "description": "24-hour national hackathon. Sprint from prototype to MVP with three mentor checkpoints and a code freeze.",
    "capacity": 300,
    "teamSize": { "min": 1, "max": 4 },
    "prizePool": "₹80,000",
    "rounds": ["Online Screening", "24h Finale", "Live Demos"]
  },
  {
    "slug": "battlegrid",
    "title": "BattleGrid",
    "category": "Gaming & Community",
    "description": "Esports championship featuring BGMI, VALORANT, and Clash Royale.",
    "capacity": 800,
    "teamSize": { "min": 1, "max": 5 },
    "prizePool": "₹30,500",
    "rounds": ["Day 1 Qualifiers", "Day 2 Grand Finals"]
  },
  {
    "slug": "robowar",
    "title": "RoboWar",
    "category": "Hardware & Speed",
    "description": "Inter-university combat robotics championship. 1v1 bouts in a safety-controlled arena.",
    "capacity": 80,
    "teamSize": { "min": 3, "max": 5 },
    "prizePool": "₹80,000",
    "rounds": ["Inspection", "Group Qualifiers", "Knockouts & Grand Final"]
  },
  {
    "slug": "dronestorm",
    "title": "DroneStorm",
    "category": "Hardware & Speed",
    "description": "Inter-university FPV drone racing on a checkpoint-and-obstacle track.",
    "capacity": 40,
    "teamSize": { "min": 1, "max": 2 },
    "prizePool": "TBA",
    "rounds": ["Inspection", "Timed Main Round", "Final Round"]
  },
  {
    "slug": "promptclash",
    "title": "Prompt Clash",
    "category": "DeepTech & AI",
    "description": "Inter-college AI challenge of recreating a reference image through pure prompt-craft.",
    "capacity": 90,
    "teamSize": { "min": 1, "max": 3 },
    "prizePool": "₹10,000",
    "rounds": ["Reference Reveal", "Prompt & Iterate", "Rubric Judging"]
  },
  {
    "slug": "scavengerhunt",
    "title": "Scavenger Hunt",
    "category": "Gaming & Community",
    "description": "Campus-wide tech clue trail, riddles, QR puzzles, and trivia.",
    "capacity": 150,
    "teamSize": { "min": 3, "max": 5 },
    "prizePool": "TBA",
    "rounds": ["Themed Clue Trail", "Staggered Starts", "Checkpoints & Tie-Breaker"]
  }
];

export async function getTechnomaniaEvents() {
  try {
    await connectDB();
    
    // Seed FestConfig if empty
    let config = await FestConfig.findOne();
    if (!config) {
      config = await FestConfig.create({
        marqueeTicker: ["WELCOME TO TECHNOMANIA 3.0", "REGISTRATIONS NOW OPEN", "₹1L+ PRIZE POOL"],
        festDays: 3,
        registrationOpen: true
      });
    }

    let arenas = await Event.find({ $or: [{ fest: "technomania" }, { category: { $in: ["DeepTech & AI", "Hardware & Speed", "Gaming & Community"] } }], status: { $in: ["active", "published"] } }).lean();

    if (arenas.length === 0) {
      console.log("Seeding Arenas...");
      await Event.insertMany(TECHNOMANIA_SEED.map(a => ({
        ...a,
        status: "active",
        fest: "technomania"
      })));
      arenas = await Event.find({ $or: [{ fest: "technomania" }, { category: { $in: ["DeepTech & AI", "Hardware & Speed", "Gaming & Community"] } }], status: { $in: ["active", "published"] } }).lean();
    }

    return serialize(
      arenas.map((a: any) => ({
        id: String(a._id),
        slug: a.slug,
        title: a.title,
        category: a.category,
        description: a.description,
        capacity: a.capacity,
        registeredCount: a.registeredCount,
        teamSize: a.teamSize,
        prizePool: a.prizePool,
        rounds: a.rounds,
        status: a.status,
        isPublished: a.isPublished,
        // Mock start dates based on day 1/2 for UI layout
        startAt: new Date(new Date().getTime() + (Math.random() > 0.5 ? 86400000 : 0))
      }))
    );
  } catch (err) {
    console.error("Error in getTechnomaniaEvents:", err);
    return [];
  }
}

export async function getFestConfig() {
  try {
    await connectDB();
    const config = await FestConfig.findOne().lean();
    return serialize(config || { marqueeTicker: [], registrationOpen: true });
  } catch(err) {
    return { marqueeTicker: [], registrationOpen: true };
  }
}

export async function getTechnomaniaEvent(slug: string) {
  try {
    await connectDB();
    const event = await Event.findOne({ slug, $or: [{ fest: "technomania" }, { category: { $in: ["DeepTech & AI", "Hardware & Speed", "Gaming & Community"] } }], status: { $in: ["active", "published"] } }).lean() as any;
    if (!event) return null;
    return serialize({
      ...event,
      id: String(event._id),
      _id: undefined,
      startAt: event.startAt || new Date(),
      leaderboardVisible: false,
      leaderboard: []
    });
  } catch (err) {
    return null;
  }
}

export async function getTechnomaniaStats() {
  try {
    await connectDB();
    const activeFestArenas = await Event.countDocuments({ $or: [{ fest: "technomania" }, { category: { $in: ["DeepTech & AI", "Hardware & Speed", "Gaming & Community"] } }], status: { $in: ["active", "published"] } });
    
    const registrations = await EventRegistration.find().populate({ path: "event", match: { $or: [{ fest: "technomania" }, { category: { $in: ["DeepTech & AI", "Hardware & Speed", "Gaming & Community"] } }] } }).lean();
    const festRegs = registrations.filter((r: any) => r.event);
    const registeredSquads = festRegs.filter((r: any) => r.teamName).length;
    
    let totalBuilders = 0;
    festRegs.forEach((r: any) => {
      totalBuilders += 1; // leader
      if (r.teamMembers && Array.isArray(r.teamMembers)) {
        totalBuilders += r.teamMembers.length;
      }
    });

    const liveLeaderboardTeams = 0; // Mock for now until leaderboard is fully implemented

    return serialize({ 
      activeFestArenas, 
      registeredSquads, 
      totalBuilders, 
      liveLeaderboardTeams 
    });
  } catch (err) {
    return { activeFestArenas: 0, registeredSquads: 0, totalBuilders: 0, liveLeaderboardTeams: 0 };
  }
}

export async function getTechnomaniaSchedule() {
  const events = await getTechnomaniaEvents();
  return events.map((e: any) => ({
    ...e,
    venue: "Main Campus Arena",
    endAt: new Date(new Date(e.startAt).getTime() + 4 * 60 * 60 * 1000)
  }));
}
