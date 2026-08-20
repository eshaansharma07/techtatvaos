const fs = require('fs');
let code = fs.readFileSync('src/app/portal/portal-client.tsx', 'utf8');

code = code.replace(
  '<TechnomaniaAdminPortal />',
  '<TechnomaniaAdminPortal data={data} open={open} setPanel={setPanel} />'
);

fs.writeFileSync('src/app/portal/portal-client.tsx', code);
