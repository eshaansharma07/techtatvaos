import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FestRegistration } from "@/lib/models/Registration";

export async function GET(req: NextRequest) {
  try {
    await connectDB();
    const { searchParams } = new URL(req.url);
    const arenaId = searchParams.get("arenaId");
    
    let query: any = {};
    if (arenaId) query.arenaId = arenaId;
    
    const registrations = await FestRegistration.find(query)
      .populate("arenaId", "title slug")
      .sort({ createdAt: -1 })
      .lean();
      
    return NextResponse.json(registrations);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch registrations" }, { status: 500 });
  }
}
