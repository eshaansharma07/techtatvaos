import { NextRequest, NextResponse } from "next/server";
import { Types } from "mongoose";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { RecruitmentApplication, RecruitmentQuestion, RecruitmentRole, RecruitmentSettings, RecruitmentTeam } from "@/lib/models";
import { rateLimit } from "@/lib/rate-limit";
import { assertRecruitmentOpen } from "@/lib/recruitment";
import { sendApplicationReceivedEmail } from "@/lib/recruitment-mail";

const optionalUrl = z
  .string()
  .trim()
  .optional()
  .transform((value) => {
    const text = value || "";
    if (!text) return "";
    return /^https?:\/\//i.test(text) ? text : `https://${text}`;
  })
  .refine((value) => !value || /^https?:\/\/.+/i.test(value), { message: "Enter a valid URL starting with http:// or https://" });

const applySchema = z.object({
  fullName: z.string().trim().min(2, "Full name must be at least 2 characters").max(120),
  uid: z.string().trim().min(3, "UID must be at least 3 characters").max(40),
  course: z.string().trim().min(1, "Course is required").max(80),
  branch: z.string().trim().min(1, "Branch is required").max(80),
  year: z.string().trim().min(1, "Year is required").max(20),
  email: z.string().trim().email("Enter a valid email address").max(160),
  phone: z.string().trim().min(7, "Phone number must be at least 7 digits").max(20, "Phone number is too long"),
  linkedin: optionalUrl,
  github: optionalUrl,
  portfolio: optionalUrl,
  team: z.string().min(1, "Please select a team"),
  role: z.string().min(1, "Please select a role"),
  answers: z.record(z.any()).default({}),
  files: z
    .array(
      z.object({
        label: z.string(),
        url: z.string().url(),
        publicId: z.string().optional(),
        resourceType: z.string().optional()
      })
    )
    .default([])
});

function empty(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "local";
    if (!rateLimit(`recruitment:${ip}`, 5, 60_000)) {
      return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });
    }

    let body: unknown;
    try {
      body = await req.json();
    } catch {
      return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
    }

    const parsed = applySchema.safeParse(body);
    if (!parsed.success) {
      const firstIssue = parsed.error.issues[0]?.message || "Please check the highlighted fields.";
      return NextResponse.json({ error: firstIssue, issues: parsed.error.flatten() }, { status: 400 });
    }
    const input = parsed.data;

    if (!Types.ObjectId.isValid(input.team) || !Types.ObjectId.isValid(input.role)) {
      return NextResponse.json({ error: "Choose a valid team and role." }, { status: 400 });
    }

    await connectDB();
    const [settings, team, role] = await Promise.all([
      RecruitmentSettings.findOne({ key: "default" }).lean() as any,
      RecruitmentTeam.findOne({ _id: input.team, active: true }).lean() as any,
      RecruitmentRole.findOne({ _id: input.role, team: input.team, active: true }).lean() as any
    ]);

    const gate = await assertRecruitmentOpen(settings || {}, input.team);
    if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: 403 });
    if (!team || !role) return NextResponse.json({ error: "Choose an active team and role." }, { status: 400 });
    if (team.slug === "technical") {
      const githubUrl = input.github || "";
      if (!githubUrl.trim()) {
        return NextResponse.json({ error: "GitHub profile URL is required for Technical Team applicants." }, { status: 400 });
      }
      const isValid = /^https?:\/\/(www\.)?github\.com\/[a-z0-9](-?[a-z0-9]){0,38}\/?$/i.test(githubUrl);
      if (!isValid) {
        return NextResponse.json({ error: "Please enter a valid GitHub profile URL (e.g., https://github.com/username)." }, { status: 400 });
      }
    }
    if (team.applicationLimit && gate.teamCount !== undefined && gate.teamCount >= team.applicationLimit) {
      return NextResponse.json({ error: "This team is no longer accepting applications." }, { status: 403 });
    }

    const questions = await RecruitmentQuestion.find({
      active: true,
      team: input.team,
      $or: [{ role: input.role }, { role: null }, { role: { $exists: false } }]
    })
      .sort({ order: 1 })
      .lean();

    const answers = questions.map((question: any) => {
      const value = input.answers[String(question._id)];
      if (question.required && empty(value)) throw new Error(`Answer required: ${question.label}`);
      return { question: question._id, label: question.label, type: question.type, value: value ?? "" };
    });

    const application = await RecruitmentApplication.create({
      fullName: input.fullName,
      uid: input.uid,
      course: input.course,
      branch: input.branch,
      year: input.year,
      email: input.email.toLowerCase(),
      phone: input.phone,
      linkedin: input.linkedin || undefined,
      github: input.github || undefined,
      portfolio: input.portfolio || undefined,
      team: input.team,
      role: input.role,
      answers,
      files: input.files,
      ip,
      userAgent: req.headers.get("user-agent") || "",
      timeline: [{ action: "submitted", note: "Application submitted", at: new Date() }]
    });

    try {
      await sendApplicationReceivedEmail(settings || {}, {
        fullName: input.fullName,
        email: input.email.toLowerCase(),
        teamName: team.name,
        roleName: role.name
      });
    } catch (emailError) {
      console.error("Recruitment confirmation email failed:", emailError);
    }

    return NextResponse.json(
      { id: String(application._id), message: settings?.customSuccessMessage || "Your application has been received." },
      { status: 201 }
    );
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Answer required:")) {
      return NextResponse.json({ error: error.message }, { status: 400 });
    }
    if ((error as any)?.code === 11000) {
      return NextResponse.json({ error: "An application already exists for this email or UID." }, { status: 409 });
    }
    console.error("Recruitment apply failed:", error);
    return NextResponse.json({ error: "Application could not be submitted. Please try again in a moment." }, { status: 500 });
  }
}
