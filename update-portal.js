const fs = require('fs');
let content = fs.readFileSync('src/components/portal/technomania-admin-portal.tsx', 'utf8');

// Add imports
const imports = `import { TechnomaniaOverview } from "./technomania/overview";
import { TechnomaniaArenas } from "./technomania/arenas";
import { TechnomaniaRegistrations } from "./technomania/registrations";
import { TechnomaniaLeaderboard } from "./technomania/leaderboard";
import { TechnomaniaBroadcasts } from "./technomania/broadcasts";
import { TechnomaniaConfig } from "./technomania/config";
`;

content = content.replace('import {', imports + 'import {');

// Replace tab bodies
content = content.replace(/\{subTab === "overview" && \([\s\S]*?(?=\{subTab === "events")/g, '{subTab === "overview" && <TechnomaniaOverview />}\n\n      ');

content = content.replace(/\{subTab === "events" && \([\s\S]*?(?=\{subTab === "registrations")/g, '{subTab === "events" && <TechnomaniaArenas />}\n\n      ');

content = content.replace(/\{subTab === "registrations" && \([\s\S]*?(?=\{subTab === "leaderboard")/g, '{subTab === "registrations" && <TechnomaniaRegistrations />}\n\n      ');

content = content.replace(/\{subTab === "leaderboard" && \([\s\S]*?(?=\{subTab === "ticker")/g, '{subTab === "leaderboard" && <TechnomaniaLeaderboard />}\n\n      ');

content = content.replace(/\{subTab === "ticker" && \([\s\S]*?(?=\{subTab === "settings")/g, '{subTab === "ticker" && <TechnomaniaBroadcasts />}\n\n      ');

content = content.replace(/\{subTab === "settings" && \([\s\S]*?(?=\s*<\/div>\s*\);\s*\})/g, '{subTab === "settings" && <TechnomaniaConfig />}');

fs.writeFileSync('src/components/portal/technomania-admin-portal.tsx', content);
console.log('Portal updated');
