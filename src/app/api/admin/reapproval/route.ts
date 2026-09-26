import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event, EventRegistration } from "@/lib/models";
import { requirePortal } from "@/lib/portal";

export async function POST(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;

  try {
    const { eventId, action, scope } = await req.json();

    if (!eventId || !action) {
      return NextResponse.json({ error: "Event ID and action are required." }, { status: 400 });
    }

    await connectDB();
    const event = await Event.findById(eventId);
    if (!event) return NextResponse.json({ error: "Event not found" }, { status: 404 });

    if (action === "require") {
      event.requireReapproval = true;
      event.reapprovalScope = scope || "waitlisted";
      await event.save();
      
      // Optionally reset reapproved status if a new wave is triggered
      const query: any = { event: eventId };
      if (scope === "waitlisted") {
        query.status = "waitlisted";
      }
      await EventRegistration.updateMany(query, { $set: { reapproved: false } });

      return NextResponse.json({ success: true, message: `Re-approval required for ${scope} teams.` });
    } 
    
    if (action === "disable") {
      event.requireReapproval = false;
      await event.save();
      return NextResponse.json({ success: true, message: "Re-approval requirement disabled." });
    }

    if (action === "promote") {
      // Body expects registrationId
      const { registrationId } = await req.json().catch(() => ({}));
      if (!registrationId) return NextResponse.json({ error: "Registration ID is required." }, { status: 400 });

      const reg = await EventRegistration.findOneAndUpdate(
        { _id: registrationId, event: eventId, status: "waitlisted" },
        { $set: { status: "confirmed" } },
        { new: true }
      );
      if (!reg) return NextResponse.json({ error: "Waitlisted registration not found." }, { status: 404 });

      return NextResponse.json({ success: true, message: "Promoted to confirmed successfully.", record: reg });
    }

    return NextResponse.json({ error: "Invalid action." }, { status: 400 });

  } catch (error: any) {
    console.error("[Re-approval Admin Error]", error);
    return NextResponse.json({ error: error.message || "Server Error" }, { status: 500 });
  }
}
