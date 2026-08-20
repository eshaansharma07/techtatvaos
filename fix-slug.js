const fs = require('fs');
let code = fs.readFileSync('src/lib/technomania-data.ts', 'utf8');

code = code.replace(
  'const event = await Event.findOne({ slug, fest: "technomania", status: { $in: ["active", "published"] } }).lean() as any;',
  'const event = await Event.findOne({ slug, $or: [{ fest: "technomania" }, { category: { $in: ["DeepTech & AI", "Hardware & Speed", "Gaming & Community"] } }], status: { $in: ["active", "published"] } }).lean() as any;'
);

fs.writeFileSync('src/lib/technomania-data.ts', code);
