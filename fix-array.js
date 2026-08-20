const fs = require('fs');
let code = fs.readFileSync('src/lib/public-data.ts', 'utf8');

code = code.replace(
  `  const [
    users,
    teams,
    events: allEvents,
    tasks,
    announcements,
    notifications,
    attendance,
    registrations: allRegistrations,`,
  `  const [
    users,
    teams,
    events,
    tasks,
    announcements,
    notifications,
    attendance,
    registrations,`
);

fs.writeFileSync('src/lib/public-data.ts', code);
