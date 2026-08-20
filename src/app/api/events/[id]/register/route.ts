import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Arena } from "@/lib/models/Arena";
import { FestRegistration } from "@/lib/models/Registration";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    
    // Support querying by ID or slug
    const arena = await Arena.findOne({
      $or: [{ _id: id.match(/^[0-9a-fA-F]{24}$/) ? id : null }, { slug: id }]
    });

    if (!arena) {
      return NextResponse.json({ error: "Arena not found" }, { status: 404 });
    }

    if (arena.status === "closed" || !arena.isPublished) {
      return NextResponse.json({ error: "Registrations are closed for this arena" }, { status: 400 });
    }

    if (arena.capacity > 0 && arena.registeredCount >= arena.capacity) {
      return NextResponse.json({ error: "Arena capacity reached" }, { status: 400 });
    }

    const body = await req.json();
    const { teamName, leader, members, subCategory } = body;

    if (!leader || !leader.name || !leader.email || !leader.uid) {
      return NextResponse.json({ error: "Leader details are incomplete" }, { status: 400 });
    }

    // Check existing registration for this email/uid in this arena to prevent duplicates
    const existing = await FestRegistration.findOne({
      arenaId: arena._id,
      $or: [
        { "leader.email": leader.email.toLowerCase() },
        { "leader.uid": leader.uid }
      ]
    });

    if (existing) {
      return NextResponse.json({ error: "You have already registered for this arena." }, { status: 409 });
    }

    const registrationId = `TM3-${arena.slug.toUpperCase()}-${Math.random().toString(36).substring(2, 8).toUpperCase()}`;

    await FestRegistration.create({
      registrationId,
      arenaId: arena._id,
      teamName,
      leader: { ...leader, email: leader.email.toLowerCase() },
      members: members || [],
      subCategory
    });

    // Increment registeredCount
    arena.registeredCount = (arena.registeredCount || 0) + 1;
    await arena.save();

    return NextResponse.json({ success: true, registrationId });
  } catch (err: any) {
    console.error("Registration error:", err);
    return NextResponse.json({ error: "Internal server error" }, { status: 500 });
  }
}
