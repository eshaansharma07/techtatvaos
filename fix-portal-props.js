const fs = require('fs');
let code = fs.readFileSync('src/components/portal/technomania-admin-portal.tsx', 'utf8');

code = code.replace(
  'export function TechnomaniaAdminPortal({ data, open, setPanel }: { data: any, open: any, setPanel: any }) {',
  'export function TechnomaniaAdminPortal({ data, openDrawer, setPanel, refresh, patch, remove }: { data: any, openDrawer: any, setPanel: any, refresh?: any, patch?: any, remove?: any }) {'
);

code = code.replace(
  'open({',
  'openDrawer({'
);

fs.writeFileSync('src/components/portal/technomania-admin-portal.tsx', code);
