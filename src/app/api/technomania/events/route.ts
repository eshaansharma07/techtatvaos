import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event, EventRegistration } from "@/lib/models";

export async function GET() {
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

    const data = events.map((e: any) => ({
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
      registrations: counts[String(e._id)] || 0,
    }));

    return NextResponse.json(data, {
      headers: {
        "Cache-Control": "public, s-maxage=60, stale-while-revalidate=120"
      }
    });
  } catch (error) {
    console.error("API /technomania/events error:", error);
    return NextResponse.json({ error: "Failed to fetch events" }, { status: 500 });
  }
}
