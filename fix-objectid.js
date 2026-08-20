const fs = require('fs');
let code = fs.readFileSync('src/lib/public-data.ts', 'utf8');

code = code.replace(
  'String(r._id) + "-" + i, // Fake ID for member',
  'String(r._id).slice(0, 22) + String(i).padStart(2, "0"), // Valid ObjectId hex for member'
);

fs.writeFileSync('src/lib/public-data.ts', code);
