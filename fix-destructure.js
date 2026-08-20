const fs = require('fs');
let code = fs.readFileSync('src/lib/public-data.ts', 'utf8');

code = code.replace(
  /events: allEvents,/,
  'events,'
);

code = code.replace(
  /registrations: allRegistrations,/,
  'registrations,'
);

// Wait, the serialize logic:
//   return serialize({
//     events: allEvents,
//     registrations: allRegistrations,
// ...
// Oh, the replacement happened in BOTH the destructuring AND the serialize!
