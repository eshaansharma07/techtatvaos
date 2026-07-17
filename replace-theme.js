const fs = require('fs');
const path = require('path');

const filesToUpdate = [
  "src/app/join/join-client.tsx",
  "src/app/gallery/page.tsx",
  "src/app/gallery/gallery-client.tsx",
  "src/app/gallery/[id]/page.tsx",
  "src/app/recruitment/recruitment-client.tsx",
  "src/app/about/page.tsx",
  "src/app/hall-of-fame/page.tsx",
  "src/app/teams/page.tsx",
  "src/app/events/page.tsx",
  "src/app/portal/portal-client.tsx"
];

filesToUpdate.forEach(file => {
  const fullPath = path.join(__dirname, file);
  if (fs.existsSync(fullPath)) {
    let content = fs.readFileSync(fullPath, 'utf8');
    
    if (file.includes('portal-client')) {
      content = content.replace(/emerald/g, 'blue');
      content = content.replace(/bg-\[\#00FF66\]/g, 'bg-blue-500');
      content = content.replace(/text-\[\#00FF66\]/g, 'text-blue-400');
      content = content.replace(/border-\[\#00FF66\]/g, 'border-blue-500');
      content = content.replace(/\#00FF66/g, 'rgba(59, 130, 246, 1)'); // blue-500
    } else {
      content = content.replace(/emerald/g, 'purple');
      content = content.replace(/bg-\[\#00FF66\]/g, 'bg-purple-500');
      content = content.replace(/text-\[\#00FF66\]/g, 'text-purple-400');
      content = content.replace(/border-\[\#00FF66\]/g, 'border-purple-500');
      content = content.replace(/shadow-\[\#00FF66\]/g, 'shadow-purple-500');
      content = content.replace(/via-\[\#00FF66\]/g, 'via-purple-500');
      content = content.replace(/\#00FF66/g, 'rgba(168, 85, 247, 1)'); // purple-500 fallback
      content = content.replace(/brutalist-btn-green/g, 'brutalist-btn-purple');
    }
    fs.writeFileSync(fullPath, content, 'utf8');
    console.log(`Updated ${file}`);
  }
});
