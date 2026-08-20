const fs = require('fs');
let content = fs.readFileSync('src/components/portal/technomania-admin-portal.tsx', 'utf8');

content = content.replace(/\{subTab === "overview" && \([\s\S]*?(?=\{subTab === "arenas")/g, '{subTab === "overview" && <TechnomaniaOverview />}\n\n      ');
content = content.replace(/\{subTab === "arenas" && \([\s\S]*?(?=\{subTab === "squads")/g, '{subTab === "arenas" && <TechnomaniaArenas />}\n\n      ');
content = content.replace(/\{subTab === "squads" && \([\s\S]*?(?=\{subTab === "leaderboard")/g, '{subTab === "squads" && <TechnomaniaRegistrations />}\n\n      ');

fs.writeFileSync('src/components/portal/technomania-admin-portal.tsx', content);
