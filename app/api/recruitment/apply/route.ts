import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { RecruitmentApplication, RecruitmentQuestion, RecruitmentRole, RecruitmentSettings, RecruitmentTeam } from "@/lib/models";
import { rateLimit } from "@/lib/rate-limit";
import { assertRecruitmentOpen } from "@/lib/recruitment";
import { sendApplicationReceivedEmail } from "@/lib/recruitment-mail";

const applySchema = z.object({
  fullName: z.string().min(2).max(120),
  uid: z.string().min(3).max(40),
  course: z.string().min(1).max(80),
  branch: z.string().min(1).max(80),
  year: z.string().min(1).max(20),
  email: z.string().email().max(160),
  phone: z.string().min(7).max(20),
  linkedin: z.string().url().optional().or(z.literal("")),
  github: z.string().url().optional().or(z.literal("")),
  portfolio: z.string().url().optional().or(z.literal("")),
  team: z.string().min(1),
  role: z.string().min(1),
  answers: z.record(z.any()).default({}),
  files: z.array(z.object({ label: z.string(), url: z.string().url(), publicId: z.string().optional(), resourceType: z.string().optional() })).default([])
});

function empty(value: unknown) {
  return value === undefined || value === null || value === "" || (Array.isArray(value) && value.length === 0);
}

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!rateLimit(`recruitment:${ip}`, 5, 60_000)) return NextResponse.json({ error: "Too many attempts. Try again in a minute." }, { status: 429 });

  const parsed = applySchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Please check the highlighted fields.", issues: parsed.error.flatten() }, { status: 400 });
  const input = parsed.data;

  await connectDB();
  const [settings, team, role] = await Promise.all([
    RecruitmentSettings.findOne({ key: "default" }).lean() as any,
    RecruitmentTeam.findOne({ _id: input.team, active: true }).lean() as any,
    RecruitmentRole.findOne({ _id: input.role, team: input.team, active: true }).lean() as any
  ]);

  const gate = await assertRecruitmentOpen(settings || {}, input.team);
  if (!gate.ok) return NextResponse.json({ error: gate.error }, { status: 403 });
  if (!team || !role) return NextResponse.json({ error: "Choose an active team and role." }, { status: 400 });
  if (team.applicationLimit && gate.teamCount !== undefined && gate.teamCount >= team.applicationLimit) {
    return NextResponse.json({ error: "This team is no longer accepting applications." }, { status: 403 });
  }

  try {
    const questions = await RecruitmentQuestion.find({ active: true, team: input.team, $or: [{ role: input.role }, { role: null }, { role: { $exists: false } }] }).sort({ order: 1 }).lean();
    const answers = questions.map((question: any) => {
      const value = input.answers[String(question._id)];
      if (question.required && empty(value)) throw new Error(`Answer required: ${question.label}`);
      return { question: question._id, label: question.label, type: question.type, value };
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

    await sendApplicationReceivedEmail(settings || {}, {
      fullName: input.fullName,
      email: input.email.toLowerCase(),
      teamName: team.name,
      roleName: role.name
    });

    return NextResponse.json({ id: String(application._id), message: settings?.customSuccessMessage || "Your application has been received." }, { status: 201 });
  } catch (error) {
    if (error instanceof Error && error.message.startsWith("Answer required:")) return NextResponse.json({ error: error.message }, { status: 400 });
    if ((error as any)?.code === 11000) return NextResponse.json({ error: "An application already exists for this email or UID." }, { status: 409 });
    return NextResponse.json({ error: "Application could not be submitted." }, { status: 500 });
  }
}
