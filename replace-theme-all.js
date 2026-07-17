const fs = require('fs');
const path = require('path');

function walkDir(dir, callback) {
  fs.readdirSync(dir).forEach(f => {
    let dirPath = path.join(dir, f);
    let isDirectory = fs.statSync(dirPath).isDirectory();
    isDirectory ? walkDir(dirPath, callback) : callback(path.join(dir, f));
  });
}

walkDir(path.join(__dirname, 'src'), function(filePath) {
  if (filePath.endsWith('.tsx') || filePath.endsWith('.ts')) {
    let content = fs.readFileSync(filePath, 'utf8');
    let original = content;

    const isPortal = filePath.includes('portal');

    if (isPortal) {
      content = content.replace(/emerald/g, 'blue');
      content = content.replace(/bg-\[\#00FF66\]/g, 'bg-blue-500');
      content = content.replace(/text-\[\#00FF66\]/g, 'text-blue-400');
      content = content.replace(/border-\[\#00FF66\]/g, 'border-blue-500');
      content = content.replace(/\#00FF66/g, 'rgba(59, 130, 246, 1)');
      content = content.replace(/0,255,102/g, '59,130,246');
      content = content.replace(/0,\s*255,\s*102/g, '59, 130, 246');
    } else {
      content = content.replace(/emerald/g, 'purple');
      content = content.replace(/bg-\[\#00FF66\]/g, 'bg-purple-500');
      content = content.replace(/text-\[\#00FF66\]/g, 'text-purple-400');
      content = content.replace(/border-\[\#00FF66\]/g, 'border-purple-500');
      content = content.replace(/shadow-\[\#00FF66\]/g, 'shadow-purple-500');
      content = content.replace(/via-\[\#00FF66\]/g, 'via-purple-500');
      content = content.replace(/\#00FF66/g, 'rgba(168, 85, 247, 1)');
      content = content.replace(/0,255,102/g, '168,85,247');
      content = content.replace(/0,\s*255,\s*102/g, '168, 85, 247');
      content = content.replace(/brutalist-btn-green/g, 'brutalist-btn-purple');
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
