import { NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { MembershipDriveSettings } from "@/lib/models";

export const dynamic = "force-dynamic";

export async function GET() {
  try {
    await connectDB();
    const settings = (await MembershipDriveSettings.findOne({ key: "default" }).lean()) as any;

    const now = new Date();
    let status = settings?.status || "closed";
    const registrationEnabled = settings?.registrationEnabled ?? false;

    // Auto-close if deadline passed
    if (settings?.autoCloseAfterDeadline && settings?.closingDate && new Date(settings.closingDate) < now && !settings?.manualOverride) {
      status = "closed";
    }

    return NextResponse.json({
      status,
      registrationEnabled: registrationEnabled && (status === "open" || status === "closing_soon"),
      announcementBanner: settings?.announcementBanner || "",
      openingDate: settings?.openingDate || null,
      closingDate: settings?.closingDate || null,
      whatsappGroupLink: settings?.whatsappGroupLink || ""
    });
  } catch (error) {
    console.error("Membership status check failed:", error);
    return NextResponse.json({ status: "closed", registrationEnabled: false, announcementBanner: "" });
  }
}
