import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event, EventRegistration } from "@/lib/models";

export async function GET() {
  try {
    await connectDB();
    
    const totalEvents = await Event.countDocuments({ fest: "technomania", status: { $in: ["published", "active", "completed"] } });
    const liveEvents = await Event.countDocuments({ fest: "technomania", status: "active" });
    
    const events = await Event.find({ fest: "technomania" }).select("_id").lean();
    const eventIds = events.map((e: any) => e._id);
    
    const totalRegistrations = await EventRegistration.countDocuments({ event: { $in: eventIds }, status: "confirmed" });

    return NextResponse.json({
      totalEvents,
      liveEvents,
      totalRegistrations
    }, {
      headers: {
        "Cache-Control": "public, s-maxage=30"
      }
    });
  } catch (error) {
    console.error("API /technomania/stats error:", error);
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
