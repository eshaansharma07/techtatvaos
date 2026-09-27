import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event, EventRegistration, User } from "@/lib/models";
import { rateLimit } from "@/lib/rate-limit";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`check-status:${ip}`, 20)) {
      return NextResponse.json({ error: "Too many attempts. Try again later." }, { status: 429 });
    }

    const { id } = await params;
    const body = await req.json();
    const { email, uid, action } = body;

    if (!email || !uid) {
      return NextResponse.json({ error: "Email and UID are required." }, { status: 400 });
    }

    await connectDB();
    const event = await Event.findById(id).lean() as any;
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    const searchEmail = email.trim().toLowerCase();
    const searchUid = uid.trim();

    // Find the user if they are the leader
    const leaderUser = await User.findOne({ email: searchEmail, uid: searchUid }).lean() as any;
    
    let registration: any = null;

    if (leaderUser) {
      registration = await EventRegistration.findOne({ event: id, user: leaderUser._id }).populate("user", "name email uid");
    }

    // If not found as leader, search teamMembers array
    if (!registration) {
      registration = await EventRegistration.findOne({
        event: id,
        teamMembers: { $elemMatch: { email: searchEmail, uid: searchUid } }
      }).populate("user", "name email uid");
    }

    if (!registration) {
      return NextResponse.json({ error: "No registration found matching this Email and UID." }, { status: 404 });
    }

    if (action === "confirm") {
      if (!event.requireReapproval) {
        return NextResponse.json({ error: "Re-approval is not required for this event." }, { status: 400 });
      }

      const needsReapproval = event.reapprovalScope === "all" || (event.reapprovalScope === "waitlisted" && registration.status === "waitlisted");
      
      if (!needsReapproval) {
        return NextResponse.json({ error: "Your registration status does not require re-approval." }, { status: 400 });
      }

      registration.reapproved = true;
      await registration.save();

      return NextResponse.json({ success: true, status: registration.status, reapproved: true });
    }

    // For action === "check"
    const requiresReapproval = event.requireReapproval && (event.reapprovalScope === "all" || (event.reapprovalScope === "waitlisted" && registration.status === "waitlisted"));

    return NextResponse.json({
      success: true,
      status: registration.status,
      teamName: registration.teamName,
      requiresReapproval,
      hasReapproved: !!registration.reapproved
    });

  } catch (error) {
    console.error("[Check Status Error]", error);
    return NextResponse.json({ error: "Internal server error." }, { status: 500 });
  }
}
