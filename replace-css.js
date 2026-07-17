const fs = require('fs');
const path = require('path');

const filePath = path.join(__dirname, 'src/app/globals.css');
if (fs.existsSync(filePath)) {
  let content = fs.readFileSync(filePath, 'utf8');
  content = content.replace(/#00FF66/ig, '#a855f7');
  content = content.replace(/#34d399/ig, '#3b82f6');
  content = content.replace(/0,\s*255,\s*102/g, '168, 85, 247');
  fs.writeFileSync(filePath, content, 'utf8');
  console.log('Updated globals.css');
}
