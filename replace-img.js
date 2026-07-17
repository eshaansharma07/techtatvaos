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

    if (content.includes('<img ')) {
      // Replace <img with <Image width={1200} height={1200}
      content = content.replace(/<img\s/g, '<Image width={1200} height={1200} ');
      
      // Check if import Image from "next/image" exists
      if (!content.includes('import Image from "next/image"')) {
        // Find the first import or "use client" and put it after
        if (content.includes('"use client";')) {
          content = content.replace('"use client";', '"use client";\nimport Image from "next/image";');
        } else if (content.includes("'use client';")) {
          content = content.replace("'use client';", "'use client';\nimport Image from \"next/image\";");
        } else {
          content = 'import Image from "next/image";\n' + content;
        }
      }
    }

    if (content !== original) {
      fs.writeFileSync(filePath, content, 'utf8');
      console.log(`Updated ${filePath}`);
    }
  }
});
