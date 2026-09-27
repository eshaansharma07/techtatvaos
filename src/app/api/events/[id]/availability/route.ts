import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event, EventRegistration, User } from "@/lib/models";
import { rateLimit } from "@/lib/rate-limit";
import { sendAvailabilityConfirmationEmail } from "@/lib/availability-mail";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    if (!rateLimit(`availability:${ip}`, 30)) {
      return NextResponse.json({ error: "Too many attempts. Please try again in a moment." }, { status: 429 });
    }

    const { id } = await params;
    const body = await req.json().catch(() => ({}));
    const { action, leaderUid, registrationId, availabilityStatus, note } = body;

    await connectDB();
    const event = await Event.findById(id).lean() as any;
    if (!event) {
      return NextResponse.json({ error: "Event not found." }, { status: 404 });
    }

    // 1. LOOKUP ACTION: Finds squad registration by Leader University UID
    if (action === "lookup" || !action) {
      const cleanUid = (leaderUid || body.uid || "").trim();
      const cleanEmail = (body.email || "").trim().toLowerCase();

      if (!cleanUid && !cleanEmail) {
        return NextResponse.json({ error: "Please enter your University UID to look up your team registration." }, { status: 400 });
      }

      // Find user by UID or Email
      const userQuery: any[] = [];
      if (cleanUid) userQuery.push({ uid: { $regex: new RegExp(`^${cleanUid}$`, "i") } });
      if (cleanEmail) userQuery.push({ email: cleanEmail });

      const matchedUsers = await User.find({ $or: userQuery }).lean() as any[];
      const userIds = matchedUsers.map((u) => u._id);

      // Search registration as leader OR as squad member
      let registration: any = null;
      if (userIds.length > 0) {
        registration = await EventRegistration.findOne({
          event: id,
          user: { $in: userIds }
        })
          .populate("user", "name email uid phone program semester")
          .populate("teamMembers.user", "name email uid phone program semester")
          .lean();
      }

      // Fallback: search teamMembers array directly by UID or Email
      if (!registration) {
        const elemQuery: any[] = [];
        if (cleanUid) elemQuery.push({ uid: { $regex: new RegExp(`^${cleanUid}$`, "i") } });
        if (cleanEmail) elemQuery.push({ email: cleanEmail });

        registration = await EventRegistration.findOne({
          event: id,
          $or: [
            { teamMembers: { $elemMatch: { $or: elemQuery } } }
          ]
        })
          .populate("user", "name email uid phone program semester")
          .populate("teamMembers.user", "name email uid phone program semester")
          .lean();
      }

      if (!registration) {
        return NextResponse.json(
          { error: `No registration found for UID "${cleanUid}" in ${event.title}. Please verify your UID or contact the organizers.` },
          { status: 404 }
        );
      }

      const leader = registration.user || {};
      const members = (registration.teamMembers || []).map((m: any) => ({
        name: m.name || m.user?.name || "Teammate",
        uid: m.uid || m.user?.uid || "N/A",
        email: m.email || m.user?.email || "N/A",
        phone: m.phone || m.user?.phone || "N/A",
        program: m.program || m.user?.program || "N/A"
      }));

      return NextResponse.json({
        success: true,
        registration: {
          id: String(registration._id),
          teamName: registration.teamName || (members.length > 0 ? "Squad" : "Individual Participant"),
          mode: registration.mode || (members.length > 0 ? "team" : "individual"),
          status: registration.status,
          availabilityStatus: registration.availabilityStatus || (registration.reapproved ? "available" : "pending"),
          availabilityNote: registration.availabilityNote || "",
          availabilityUpdatedAt: registration.availabilityUpdatedAt || null,
          leader: {
            name: leader.name || "Team Leader",
            uid: leader.uid || cleanUid,
            email: leader.email || "N/A",
            phone: leader.phone || registration.phone || "N/A",
            program: leader.program || "N/A",
            semester: leader.semester || "N/A"
          },
          members,
          totalMembers: 1 + members.length
        },
        event: {
          id: String(event._id),
          title: event.title,
          venue: event.venue,
          startAt: event.startAt,
          postponed: !!event.postponed,
          postponementNotice: event.postponementNotice || "",
          rescheduledDate: event.rescheduledDate || ""
        }
      });
    }

    // 2. SUBMIT ACTION: Updates availability status and dispatches confirmation email
    if (action === "submit") {
      if (!registrationId) {
        return NextResponse.json({ error: "Registration ID is required." }, { status: 400 });
      }

      if (!["available", "not_available", "tentative"].includes(availabilityStatus)) {
        return NextResponse.json({ error: "Please choose a valid availability status (Available, Not Available, or Tentative)." }, { status: 400 });
      }

      const reg = await EventRegistration.findOne({ _id: registrationId, event: id })
        .populate("user", "name email uid phone")
        .populate("teamMembers.user", "name email uid phone");

      if (!reg) {
        return NextResponse.json({ error: "Registration record not found." }, { status: 404 });
      }

      reg.availabilityStatus = availabilityStatus;
      reg.availabilityNote = (note || "").trim().slice(0, 500);
      reg.availabilityUpdatedAt = new Date();
      reg.reapproved = availabilityStatus === "available";

      await reg.save();

      // Dispatch confirmation email
      const leaderUser = reg.user as any;
      const leaderEmail = leaderUser?.email;
      const leaderName = leaderUser?.name || "Team Leader";
      const teamName = reg.teamName || "Your Squad";

      let emailSent = false;
      let emailReason: string | undefined;

      if (leaderEmail) {
        try {
          const dateStr = event.rescheduledDate || (event.startAt ? new Date(event.startAt).toLocaleString("en-IN", { dateStyle: "full", timeStyle: "short" }) : "Rescheduled Date TBA");
          const mailResult = await sendAvailabilityConfirmationEmail({
            to: leaderEmail,
            leaderName,
            teamName,
            eventTitle: event.title,
            status: availabilityStatus,
            note: reg.availabilityNote,
            eventDate: dateStr,
            venue: event.venue
          });
          emailSent = mailResult.sent;
          emailReason = !mailResult.sent ? ((mailResult as any).error || (mailResult as any).reason || "Failed to dispatch email") : undefined;
        } catch (err: any) {
          console.error("[Availability Confirmation Mail Error]", err);
          emailReason = err?.message || "Failed to send email";
        }
      }

      return NextResponse.json({
        success: true,
        message: `Availability recorded as "${availabilityStatus}".${emailSent ? " Confirmation email sent." : ""}`,
        availabilityStatus: reg.availabilityStatus,
        availabilityNote: reg.availabilityNote,
        availabilityUpdatedAt: reg.availabilityUpdatedAt,
        emailSent,
        emailReason
      });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });
  } catch (error: any) {
    console.error("[Availability Route Error]", error);
    return NextResponse.json({ error: error.message || "Failed to process availability request." }, { status: 500 });
  }
}
