import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { ClubInfo } from "@/lib/models";

export const runtime = "nodejs";

const DEFAULT_TM_CONFIG = {
  festivalName: "TECHNOMANIA 3.0",
  edition: "3.0",
  campusLocation: "CHANDIGARH UNIVERSITY · GHARUAN, MOHALI",
  headline: "Flagship Technical & Cultural Festival",
  tagline: "24H Hackathon Sprint · Multi-Title Esports Championship · Star Cultural Stage",
  announcementStatus: "REGISTRATIONS LIVE FOR UNIVERSITY STUDENTS · FREE PASSES",
  targetDate: "2026-09-15T09:00:00+05:30",
  prizePoolText: "₹XX,XXX CASH & INTERNSHIPS",
  registrationStatus: "open", // open, closed, coming_soon
  ctaPrimaryText: "REGISTER SQUAD NOW",
  ctaPrimaryLink: "/register",
  ctaSecondaryText: "EXPLORE ALL EVENTS",
  ctaSecondaryLink: "/events",
  logoUrl: "/technomania/logo-white.png",
  emblemUrl: "/technomania/logo-emblem.png",
  clubLogoUrl: "/technomania/techtatva-logo.png",
  marqueeLines: [
    "REGISTRATIONS NOW OPEN FOR TECHNOMANIA 3.0",
    "24-HOUR NON-STOP HACKATHON ARENA",
    "BGMI, VALORANT & EA FC ESPORTS CHAMPIONSHIPS",
    "CULTURAL SHOWCASE & CELEBRITY DJ NIGHT",
    "TOTAL PRIZE POOL ₹XX,XXX",
    "LIVE LEADERBOARDS & SPOT REWARDS"
  ],
  metrics: [
    { tag: "// 01_SPRINT", value: "24 HOURS", label: "NON-STOP HACKATHON", desc: "Build, Ship & Pitch Live" },
    { tag: "// 02_ARENA", value: "3+ ARENAS", label: "GAMING & ESPORTS", desc: "BGMI · Valorant · EA FC" },
    { tag: "// 03_SQUADS", value: "500+", label: "STUDENT BUILDERS", desc: "Pan-India Participants" },
    { tag: "// 04_GRANTS", value: "₹XX,XXX", label: "CASH PRIZE POOL", desc: "Cash, Internships & Goodies" }
  ],
  faqs: [
    {
      q: "Who is eligible to participate in Technomania 3.0?",
      a: "All currently enrolled students from Chandigarh University and registered participants across Indian colleges with a valid college ID are welcome to compete."
    },
    {
      q: "Is there any registration fee?",
      a: "No, participation passes for Technomania 3.0 flagship tracks and hackathons are 100% free for registered squads."
    },
    {
      q: "Can I participate in multiple events simultaneously?",
      a: "Yes, you can register for both esports and sub-events as long as their individual on-ground time slots do not overlap."
    },
    {
      q: "What should I bring to the 24H Hackathon?",
      a: "Bring your laptop, charger, student UID card, extensions, and hardware kits if working on IoT or robotics projects."
    }
  ]
};

export async function GET() {
  try {
    await connectDB();
    const doc = await ClubInfo.findOne({ key: "technomania_config" }).lean();
    if (!doc || !doc.value) {
      return NextResponse.json({ config: DEFAULT_TM_CONFIG, source: "default" });
    }
    return NextResponse.json({ config: { ...DEFAULT_TM_CONFIG, ...doc.value }, source: "database" });
  } catch (error) {
    console.error("GET /api/technomania/config error:", error);
    return NextResponse.json({ config: DEFAULT_TM_CONFIG, source: "fallback" });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    
    const updated = await ClubInfo.findOneAndUpdate(
      { key: "technomania_config" },
      { $set: { value: body } },
      { upsert: true, new: true, setDefaultsOnInsert: true }
    );

    return NextResponse.json({ success: true, config: updated.value });
  } catch (error) {
    console.error("POST /api/technomania/config error:", error);
    return NextResponse.json({ error: "Failed to update Technomania configuration" }, { status: 500 });
  }
}
