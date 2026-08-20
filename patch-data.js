const fs = require('fs');
let code = fs.readFileSync('src/lib/public-data.ts', 'utf8');

if (!code.includes('Arena.find')) {
  // Add imports
  code = code.replace(
    'import {',
    'import { Arena, FestRegistration,'
  );

  const fetchPromiseStr = `
    StudentMember.find({}).sort({ registeredAt: -1 }).limit(1000).lean(),
    MembershipDriveSettings.find({}).sort({ createdAt: -1 }).lean(),
    LeaderboardEntry.find({}).populate("event","title").sort({event:1,rank:1}).lean(),
    Arena.find({}).lean(),
    FestRegistration.find({}).lean()
  ]);`;
  
  code = code.replace(
    /StudentMember\.find[\s\S]*?LeaderboardEntry\.find[\s\S]*?\]\);/,
    fetchPromiseStr
  );

  const destructureStr = `
    studentMembers,
    membershipDriveSettings,
    leaderboardEntries,
    arenas,
    festRegistrations
  ] = await Promise.all([`;
  
  code = code.replace(
    /studentMembers,\s*membershipDriveSettings,\s*leaderboardEntries\s*\] = await Promise\.all\(\[/,
    destructureStr
  );
  
  // Transform Fest events and registrations and merge
  const mergeLogic = `
  const mappedArenas = arenas.map((a: any) => ({
    _id: String(a._id),
    title: \`[FEST] \${a.title}\`,
    slug: a.slug,
    category: a.category,
    startAt: new Date(), // placeholder
    participationMode: (a.teamSize?.max > 1) ? "team" : "individual"
  }));
  
  const mappedFestRegs = festRegistrations.map((r: any) => ({
    _id: String(r._id),
    event: { _id: String(r.arenaId), title: "Fest Event", participationMode: "team" },
    mode: (r.members && r.members.length > 0) ? "team" : "individual",
    teamName: r.teamName || r.leader?.name || "Fest Squad",
    user: {
      _id: String(r._id), // Use registration ID as unique user ID for leader
      name: r.leader?.name || "Unknown",
      email: r.leader?.email || "unknown@example.com",
      uid: r.leader?.uid || "N/A",
      program: r.leader?.college || "N/A",
      semester: 1
    },
    teamMembers: (r.members || []).map((m: any, i: number) => ({
      _id: String(r._id) + "-" + i, // Fake ID for member
      name: m.name || "Unknown",
      email: m.email || "unknown@example.com",
      uid: m.uid || "N/A",
      program: "N/A",
      semester: 1
    }))
  }));

  const allEvents = [...events, ...mappedArenas];
  const allRegistrations = [...registrations, ...mappedFestRegs];
`;

  code = code.replace(
    'return serialize({',
    mergeLogic + '\  return serialize({'
  );

  code = code.replace(
    /events,\s*tasks,\s*announcements,\s*notifications,\s*attendance,\s*registrations,/,
    `events: allEvents,
    tasks,
    announcements,
    notifications,
    attendance,
    registrations: allRegistrations,`
  );

  fs.writeFileSync('src/lib/public-data.ts', code);
  console.log('Patched public-data.ts');
}
