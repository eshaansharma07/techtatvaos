const fs = require('fs');
let code = fs.readFileSync('src/lib/technomania-data.ts', 'utf8');

// Replace Arena and FestRegistration imports
code = code.replace(
  'import { Arena } from "@/lib/models/Arena";\nimport { FestRegistration } from "@/lib/models/Registration";',
  'import { Event, EventRegistration } from "@/lib/models";'
);

// Replace Arena.find with Event.find
code = code.replace(/let arenas = await Arena\.find\(\{ isPublished: true \}\)\.lean\(\);/g, 'let arenas = await Event.find({ fest: "technomania", status: { $in: ["active", "published"] } }).lean();');

code = code.replace(/await Arena\.insertMany/g, 'await Event.insertMany');
code = code.replace(/arenas = await Arena\.find\(\{ isPublished: true \}\)\.lean\(\);/g, 'arenas = await Event.find({ fest: "technomania", status: { $in: ["active", "published"] } }).lean();');

// The seed data needs fest: "technomania"
code = code.replace(
  /status: "active",\n\s*isPublished: true/g,
  'status: "active",\n        fest: "technomania"'
);

// getTechnomaniaEvent
code = code.replace(
  /const event = await Arena\.findOne\(\{ slug, isPublished: true \}\)\.lean\(\) as any;/g,
  'const event = await Event.findOne({ slug, fest: "technomania", status: { $in: ["active", "published"] } }).lean() as any;'
);

// getTechnomaniaStats
code = code.replace(
  /const activeFestArenas = await Arena\.countDocuments\(\{ isPublished: true \}\);/g,
  'const activeFestArenas = await Event.countDocuments({ fest: "technomania", status: { $in: ["active", "published"] } });'
);

code = code.replace(
  /const registrations = await FestRegistration\.find\(\)\.lean\(\);/g,
  'const registrations = await EventRegistration.find().populate({ path: "event", match: { fest: "technomania" } }).lean();\n    const festRegs = registrations.filter((r: any) => r.event);'
);

code = code.replace(
  /const registeredSquads = registrations\.filter\(r => \(r as any\)\.teamName\)\.length;/g,
  'const registeredSquads = festRegs.filter((r: any) => r.teamName).length;'
);

code = code.replace(
  /registrations\.forEach\(r => \{/g,
  'festRegs.forEach((r: any) => {'
);
code = code.replace(
  /if \(\(r as any\)\.members && Array\.isArray\(\(r as any\)\.members\)\) \{/g,
  'if (r.teamMembers && Array.isArray(r.teamMembers)) {'
);
code = code.replace(
  /totalBuilders \+= \(r as any\)\.members\.length;/g,
  'totalBuilders += r.teamMembers.length;'
);

fs.writeFileSync('src/lib/technomania-data.ts', code);
