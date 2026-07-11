import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { User, EventRegistration, Attendance, Team } from "@/lib/models";
import { audit } from "@/lib/portal";
import { Types } from "mongoose";

export const dynamic = "force-dynamic";

export async function POST(req: NextRequest) {
  try {
    const session = await auth();
    const currentUserId = session?.user?.id;

    if (!currentUserId) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    await connectDB();
    const userIdObj = new Types.ObjectId(String(currentUserId));

    // Remove user references from Teams
    await Promise.all([
      Team.updateMany(
        { $or: [{ members: userIdObj }, { coLeads: userIdObj }] },
        { $pull: { members: userIdObj, coLeads: userIdObj } }
      ),
      Team.updateMany(
        { lead: userIdObj },
        { $unset: { lead: "" } }
      )
    ]);

    // Delete user's attendance records
    await Attendance.deleteMany({ user: userIdObj });

    // Delete user's event registrations
    await EventRegistration.deleteMany({ user: userIdObj });

    // Audit the deletion action
    await audit(req, "portal.account.self_delete", { entityType: "users", entityId: currentUserId });

    // Finally delete the user document
    await User.findByIdAndDelete(currentUserId);

    return NextResponse.json({ ok: true, message: "Account and associated data deleted successfully." });
  } catch (error) {
    console.error("Account self-deletion failed:", error);
    return NextResponse.json({ error: "Failed to delete account. Please try again." }, { status: 500 });
  }
}
