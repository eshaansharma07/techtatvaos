const fs = require('fs');
let code = fs.readFileSync('src/app/api/attendance/export/route.ts', 'utf8');

code = code.replace(
  'import { Attendance, Event, EventRegistration } from "@/lib/models";',
  'import { Attendance, Event, EventRegistration, Arena, FestRegistration } from "@/lib/models";'
);

const fetchLogic = `
  let event = await Event.findById(eventObjectId).lean();
  let isFest = false;
  if (!event) {
    event = await Arena.findById(eventObjectId).lean();
    if (!event) return NextResponse.json({ error: "Event/Arena not found" }, { status: 404 });
    isFest = true;
  }

  let presentRows = [];
  let registrations = [];

  if (!isFest) {
    [presentRows, registrations] = await Promise.all([
      Attendance.find({ event: eventObjectId, status: "present" }).populate("user", "uid name program semester").sort({ markedAt: 1 }).lean(),
      EventRegistration.find({ event: eventObjectId, status: "confirmed" })
        .populate("user", "uid name program semester")
        .populate("teamMembers.user", "uid name program semester")
        .lean()
    ]);
  } else {
    // For Fest
    presentRows = await Attendance.find({ event: eventObjectId, status: "present" }).sort({ markedAt: 1 }).lean();
    const festRegs = await FestRegistration.find({ arenaId: eventObjectId }).lean();
    
    // Map Fest registrations to the format expected by the exporter
    registrations = festRegs.map((r: any) => {
      const leaderId = String(r._id);
      return {
        user: { _id: leaderId, name: r.leader?.name, uid: r.leader?.uid, program: r.leader?.college, semester: 1 },
        teamMembers: (r.members || []).map((m: any, i: number) => ({
          _id: String(r._id).slice(0, 22) + String(i).padStart(2, "0"),
          name: m.name, uid: m.uid, program: "N/A", semester: 1
        }))
      };
    });
  }
`;

code = code.replace(
  /const event = await Event\.findById\(eventObjectId\);[\s\S]*?\]\);/,
  fetchLogic
);

fs.writeFileSync('src/app/api/attendance/export/route.ts', code);
console.log('Patched export route');
