import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { StudentMember, MembershipDriveSettings } from "@/lib/models";
import { rateLimit } from "@/lib/rate-limit";
import { studentMemberRegistrationSchema } from "@/lib/validations/student-member";

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (!rateLimit(`membership:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = studentMemberRegistrationSchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Please check the highlighted fields.";
      return NextResponse.json({ error: firstIssue, issues: parsed.error.flatten() }, { status: 400 });
    }
    const input = parsed.data;

    await connectDB();

    // Check if drive is open
    const settings = (await MembershipDriveSettings.findOne({ key: "default" }).lean()) as any;
    const driveStatus = settings?.status || "closed";
    const registrationEnabled = settings?.registrationEnabled ?? false;
    if (!registrationEnabled || (driveStatus !== "open" && driveStatus !== "closing_soon")) {
      return NextResponse.json({ error: "Membership registrations are currently closed. Please check back later." }, { status: 403 });
    }

    // Auto-close check
    if (settings?.autoCloseAfterDeadline && settings?.closingDate && new Date(settings.closingDate) < new Date()) {
      return NextResponse.json({ error: "The membership registration deadline has passed." }, { status: 403 });
    }

    const member = await StudentMember.create({
      fullName: input.fullName,
      uid: input.uid.toUpperCase(),
      department: input.department,
      year: input.year,
      section: input.section || "",
      email: input.email.toLowerCase(),
      phone: input.phone,
      gender: input.gender,
      interests: input.interests,
      source: input.source || "online",
      registeredAt: new Date()
    });

    return NextResponse.json(
      {
        id: String(member._id),
        message: settings?.customSuccessMessage || "Your registration has been received! Welcome to the Tech Tatva club."
      },
      { status: 201 }
    );
  } catch (error) {
    if ((error as any)?.code === 11000) {
      const keyPattern = (error as any)?.keyPattern || {};
      if (keyPattern.email) {
        return NextResponse.json({ error: "This email address is already registered." }, { status: 409 });
      }
      if (keyPattern.uid) {
        return NextResponse.json({ error: "This University ID is already registered." }, { status: 409 });
      }
      return NextResponse.json({ error: "A registration already exists with this email or University ID." }, { status: 409 });
    }
    console.error("Membership registration failed:", error);
    return NextResponse.json({ error: "Registration could not be completed. Please try again in a moment." }, { status: 500 });
  }
}
