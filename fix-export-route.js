const fs = require('fs');
let code = fs.readFileSync('src/app/api/attendance/export/route.ts', 'utf8');

code = code.replace(
  'import { Attendance, Event, EventRegistration, Arena, FestRegistration } from "@/lib/models";',
  'import { Attendance, Event, EventRegistration } from "@/lib/models";\nimport { Arena } from "@/lib/models/Arena";\nimport { FestRegistration } from "@/lib/models/Registration";'
);

code = code.replace(
  'let event = await Event.findById(eventObjectId).lean();',
  'let event = await Event.findById(eventObjectId).lean() as any;'
);

code = code.replace(
  'event = await Arena.findById(eventObjectId).lean();',
  'event = await Arena.findById(eventObjectId).lean() as any;'
);

fs.writeFileSync('src/app/api/attendance/export/route.ts', code);
