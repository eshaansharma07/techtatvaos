const fs = require('fs');
let code = fs.readFileSync('src/lib/public-data.ts', 'utf8');

// 1. Add imports at the top
code = code.replace(
  'import { connectDB } from "@/lib/db";',
  'import { connectDB } from "@/lib/db";\nimport { Arena } from "@/lib/models/Arena";\nimport { FestRegistration } from "@/lib/models/Registration";'
);

// 2. Locate getAdminDashboardData
const funcStart = code.indexOf('export async function getAdminDashboardData()');
if (funcStart === -1) throw new Error("Could not find getAdminDashboardData");

const beforeFunc = code.substring(0, funcStart);
let funcCode = code.substring(funcStart);

// 3. Update destructuring
funcCode = funcCode.replace(
  /StudentMember\.find\(\{.*?\}\)\.sort\(\{.*?\}\)\.limit\(1000\)\.lean\(\),\n\s*MembershipDriveSettings\.find\(\{.*?\}\)\.sort\(\{.*?\}\)\.lean\(\),\n\s*LeaderboardEntry\.find\(\{.*?\}\)\.populate\("event","title"\)\.sort\(\{event:1,rank:1\}\)\.lean\(\)/,
  `StudentMember.find({}).sort({ registeredAt: -1 }).limit(1000).lean(),
    MembershipDriveSettings.find({}).sort({ createdAt: -1 }).lean(),
    LeaderboardEntry.find({}).populate("event","title").sort({event:1,rank:1}).lean(),
    Arena.find({}).lean(),
    FestRegistration.find({}).lean()`
);

funcCode = funcCode.replace(
  /studentMembers,\n\s*membershipDriveSettings,\n\s*leaderboardEntries\n\s*\] = await Promise\.all/,
  `studentMembers,
    membershipDriveSettings,
    leaderboardEntries,
    arenas,
    festRegistrations
  ] = await Promise.all`
);

// 4. Update the Attendance query
funcCode = funcCode.replace(
  'Attendance.find({}).populate("event", "title").populate("user", "name email uid program semester").limit(1000).lean(),',
  'Attendance.find({}).limit(1000).lean(),'
);

// 5. Replace `return serialize({` inside getAdminDashboardData
const mergeLogic = `
  // --- MANUALLY POPULATE ATTENDANCE ---
  const userIds = attendance.map((a: any) => a.user);
  const populatedUsers = await User.find({ _id: { $in: userIds } }).select("name email uid program semester").lean();
  const userMap = new Map(populatedUsers.map((u: any) => [String(u._id), u]));
  attendance.forEach((a: any) => {
    const rawUserId = String(a.user);
    const foundUser = userMap.get(rawUserId);
    if (foundUser) {
      a.user = foundUser;
    } else {
      a.user = { _id: rawUserId, name: "Fest Member", uid: "N/A" };
    }
    // Mock event populate
    a.event = { _id: String(a.event), title: "Arena" };
  });

  // --- MERGE FEST ARENAS & SQUADS ---
  const mappedArenas = arenas.map((a: any) => ({
    _id: String(a._id),
    title: \`[FEST] \${a.title}\`,
    slug: a.slug,
    category: a.category,
    startAt: new Date(),
    participationMode: (a.teamSize?.max > 1) ? "team" : "individual"
  }));
  
  const mappedFestRegs = festRegistrations.map((r: any) => ({
    _id: String(r._id),
    event: { _id: String(r.arenaId), title: "Fest Event", participationMode: "team" },
    mode: (r.members && r.members.length > 0) ? "team" : "individual",
    teamName: r.teamName || r.leader?.name || "Fest Squad",
    user: {
      _id: String(r._id),
      name: r.leader?.name || "Unknown",
      email: r.leader?.email || "unknown@example.com",
      uid: r.leader?.uid || "N/A",
      program: r.leader?.college || "N/A",
      semester: 1
    },
    teamMembers: (r.members || []).map((m: any, i: number) => ({
      _id: String(r._id).slice(0, 22) + String(i).padStart(2, "0"),
      name: m.name || "Unknown",
      email: m.email || "unknown@example.com",
      uid: m.uid || "N/A",
      program: "N/A",
      semester: 1
    }))
  }));

  const allEvents = [...events, ...mappedArenas];
  const allRegistrations = [...registrations, ...mappedFestRegs];

  return serialize({`;

funcCode = funcCode.replace('return serialize({', mergeLogic);

funcCode = funcCode.replace(
  /events,\n\s*tasks,\n\s*announcements,\n\s*notifications,\n\s*attendance,\n\s*registrations,/,
  `events: allEvents,
    tasks,
    announcements,
    notifications,
    attendance,
    registrations: allRegistrations,`
);

fs.writeFileSync('src/lib/public-data.ts', beforeFunc + funcCode);
console.log('Safe patched public-data.ts');
