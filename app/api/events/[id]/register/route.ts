import { randomUUID } from "crypto";
import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance, Event, EventRegistration, User } from "@/lib/models";
import { rateLimit } from "@/lib/rate-limit";
import { registrationInput } from "@/lib/validations/event";

type PublicParticipant = {
  name?: string;
  email?: string;
  uid?: string;
  registrationNumber?: string;
  program?: string;
  semester?: string | number;
};

const clean = (value: unknown) => (typeof value === "string" ? value.trim() : "");
const semesterOf = (value: unknown) => {
  const number = Number(value);
  return Number.isFinite(number) && number > 0 ? number : undefined;
};

function isValidParticipant(input: PublicParticipant) {
  return clean(input.name).length >= 2 && clean(input.email).includes("@") && clean(input.uid).length >= 2 && clean(input.program).length >= 1;
}

async function upsertParticipant(input: PublicParticipant) {
  const email = clean(input.email).toLowerCase();
  return User.findOneAndUpdate(
    { email },
    {
      $set: {
        name: clean(input.name),
        email,
        uid: clean(input.uid),
        registrationNumber: clean(input.registrationNumber),
        program: clean(input.program),
        semester: semesterOf(input.semester),
        status: "active"
      },
      $setOnInsert: { memberType: "event_candidate" }
    },
    { upsert: true, new: true, setDefaultsOnInsert: true }
  );
}

export async function POST(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const ip = req.headers.get("x-forwarded-for") || "unknown";
  if (!rateLimit(`register:${ip}`, 8)) return NextResponse.json({ error: "Too many attempts" }, { status: 429 });

  const payload = await req.json();
  const legacy = registrationInput.safeParse(payload);

  await connectDB();
  const { id } = await params;
  const event = await Event.findById(id);
  if (!event?.registrationOpen || !["published", "active"].includes(event.status)) {
    return NextResponse.json({ error: "Registration is closed" }, { status: 409 });
  }

  const mode = payload.mode === "team" ? "team" : "individual";
  const eventMode = event.participationMode || "individual";
  const allowed = eventMode === "both" || eventMode === mode;
  if (!allowed) return NextResponse.json({ error: `This event accepts ${eventMode} registrations only.` }, { status: 400 });

  let userId = legacy.success ? legacy.data.userId : null;
  let leader: any = null;
  let teamMembers: any[] = [];

  if (!userId) {
    const leaderInput: PublicParticipant = payload;
    if (!isValidParticipant(leaderInput)) return NextResponse.json({ error: "Valid candidate details are required." }, { status: 400 });

    const rawMembers: PublicParticipant[] = Array.isArray(payload.members) ? payload.members : [];
    const memberInputs: PublicParticipant[] = mode === "team" ? rawMembers.filter((member) => clean(member?.name) || clean(member?.email) || clean(member?.uid)) : [];
    const totalSize = 1 + memberInputs.length;
    const maxTeamSize = Math.max(1, Number(event.maxTeamSize || 1));
    if (mode === "team" && !clean(payload.teamName)) return NextResponse.json({ error: "Team name is required." }, { status: 400 });
    if (mode === "team" && totalSize > maxTeamSize) return NextResponse.json({ error: `Maximum team size is ${maxTeamSize}.` }, { status: 400 });
    if (mode === "team" && memberInputs.some((member) => !isValidParticipant(member))) {
      return NextResponse.json({ error: "Every team member needs name, email, UID, program, and semester." }, { status: 400 });
    }

    leader = await upsertParticipant(leaderInput);
    userId = String(leader._id);
    const memberUsers = await Promise.all(memberInputs.map((member) => upsertParticipant(member)));
    teamMembers = memberUsers.map((member, index) => ({
      user: member._id,
      name: member.name,
      email: member.email,
      uid: member.uid,
      registrationNumber: member.registrationNumber,
      program: member.program,
      semester: member.semester ?? semesterOf(memberInputs[index]?.semester)
    }));
  }

  const count = await EventRegistration.countDocuments({ event: id, status: "confirmed" });
  const status = count >= (event.capacity || Infinity) ? "waitlisted" : "confirmed";
  const record = await EventRegistration.findOneAndUpdate(
    { event: id, user: userId },
    { $setOnInsert: { qrToken: randomUUID() }, $set: { status, mode, teamName: clean(payload.teamName), teamMembers, registeredAt: new Date() } },
    { upsert: true, new: true }
  );

  const participantIds = [userId, ...teamMembers.map((member) => String(member.user))];
  await Promise.all(
    participantIds.map((participantId) =>
      Attendance.findOneAndUpdate(
        { event: id, user: participantId },
        { $setOnInsert: { status: "absent", method: "manual", markedAt: new Date(), registration: record._id } },
        { upsert: true, new: true, setDefaultsOnInsert: true }
      )
    )
  );

  return NextResponse.json({ id: String(record._id), status: record.status, mode: record.mode }, { status: 201 });
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const input = registrationInput.safeParse(await req.json());
  if (!input.success) return NextResponse.json({ error: input.error.flatten() }, { status: 400 });
  await connectDB();
  const { id } = await params;
  const record = await EventRegistration.findOneAndUpdate({ event: id, user: input.data.userId }, { status: "cancelled" }, { new: true });
  return NextResponse.json(record);
}
