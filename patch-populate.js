const fs = require('fs');
let code = fs.readFileSync('src/lib/public-data.ts', 'utf8');

code = code.replace(
  'Attendance.find({}).populate("event", "title").populate("user", "name email uid program semester").limit(1000).lean(),',
  'Attendance.find({}).limit(1000).lean(), // We will populate manually to preserve raw user IDs'
);

const manualPopulate = `
  // Manually populate attendance to preserve raw user IDs for Fest attendees
  const userIds = attendance.map(a => a.user);
  const populatedUsers = await User.find({ _id: { $in: userIds } }).select("name email uid program semester").lean();
  const userMap = new Map(populatedUsers.map(u => [String(u._id), u]));
  
  attendance.forEach(a => {
    const rawUserId = String(a.user);
    const foundUser = userMap.get(rawUserId);
    if (foundUser) {
      a.user = foundUser;
    } else {
      a.user = { _id: rawUserId }; // Preserve the ID so portal-client can match it!
    }
  });

  const allEvents = [...events, ...mappedArenas];
`;

code = code.replace(
  'const allEvents = [...events, ...mappedArenas];',
  manualPopulate
);

fs.writeFileSync('src/lib/public-data.ts', code);
console.log('Patched populate');
