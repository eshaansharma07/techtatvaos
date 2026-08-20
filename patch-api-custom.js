const fs = require('fs');
let code = fs.readFileSync('src/app/api/events/[id]/register/route.ts', 'utf8');

// 1. Add customFields to PublicParticipant
code = code.replace(
  'semester?: string | number;',
  'semester?: string | number;\n  customFields?: Record<string, any>;'
);

// 2. Add customFields mapping for teamMembers
code = code.replace(
  'semester: member.semester ?? semesterOf(memberInputs[index]?.semester)',
  'semester: member.semester ?? semesterOf(memberInputs[index]?.semester),\n        customFields: memberInputs[index]?.customFields'
);

// 3. Add customFields mapping for EventRegistration
code = code.replace(
  '$set: { status, mode, teamName: clean(payload.teamName), teamMembers, registeredAt: new Date() }',
  '$set: { status, mode, teamName: clean(payload.teamName), teamMembers, customFields: payload.customFields, registeredAt: new Date() }'
);

fs.writeFileSync('src/app/api/events/[id]/register/route.ts', code);
