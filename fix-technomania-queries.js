const fs = require('fs');
let code = fs.readFileSync('src/lib/technomania-data.ts', 'utf8');

const festQuery = '{ $or: [{ fest: "technomania" }, { category: { $in: ["DeepTech & AI", "Hardware & Speed", "Gaming & Community"] } }], status: { $in: ["active", "published"] } }';

code = code.replace(
  /\{ fest: "technomania", status: \{ \$in: \["active", "published"\] \} \}/g,
  festQuery
);

code = code.replace(
  /match: \{ fest: "technomania" \}/g,
  'match: { $or: [{ fest: "technomania" }, { category: { $in: ["DeepTech & AI", "Hardware & Speed", "Gaming & Community"] } }] }'
);

// getTechnomaniaEvent needs the slug in the query
code = code.replace(
  /const event = await Event\.findOne\(\{ slug, \{ \$or: \[\{ fest: "technomania" \}, \{ category: \{ \$in: \["DeepTech & AI", "Hardware & Speed", "Gaming & Community"\] \} \}\], status: \{ \$in: \["active", "published"\] \} \}\}\)\.lean\(\) as any;/g,
  'const event = await Event.findOne({ slug, $or: [{ fest: "technomania" }, { category: { $in: ["DeepTech & AI", "Hardware & Speed", "Gaming & Community"] } }], status: { $in: ["active", "published"] } }).lean() as any;'
);

fs.writeFileSync('src/lib/technomania-data.ts', code);
