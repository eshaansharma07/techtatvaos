const fs = require('fs');
let code = fs.readFileSync('src/app/api/events/[id]/register/route.ts', 'utf8');

// 1. We need to fetch RecruitmentSettings too to fall back to the global whatsappGroupLink
if (!code.includes('RecruitmentSettings')) {
  code = code.replace(
    'import { Attendance, Event, EventRegistration, User } from "@/lib/models";',
    'import { Attendance, Event, EventRegistration, RecruitmentSettings, User } from "@/lib/models";'
  );
}

// 2. We need to extract the event whatsapp group link
const beforeReturn = '    const participantIds = [userId, ...teamMembers.map((member) => String(member.user))];';
const logicToAdd = `    let whatsappGroupLink = event.whatsappGroupLink || "";
    if (!whatsappGroupLink) {
      const settings = await RecruitmentSettings.findOne({ key: "default" }).lean();
      whatsappGroupLink = (settings as any)?.whatsappGroupLink || "";
    }

    const participantIds = [userId, ...teamMembers.map((member) => String(member.user))];`;
code = code.replace(beforeReturn, logicToAdd);

// 3. Update the return statement to include whatsappGroupLink
code = code.replace(
  'return NextResponse.json({ id: String(record._id), status: record.status, mode: record.mode }, { status: 201 });',
  'return NextResponse.json({ id: String(record._id), status: record.status, mode: record.mode, whatsappGroupLink }, { status: 201 });'
);

fs.writeFileSync('src/app/api/events/[id]/register/route.ts', code);
