const fs = require('fs');
let code = fs.readFileSync('src/components/technomania/technomania-register-client.tsx', 'utf8');

code = code.replace(
  'const addMember = () => {',
  'const addMember = () => {\n    setError("");'
);

code = code.replace(
  'const removeMember = (index: number) => {',
  'const removeMember = (index: number) => {\n    setError("");'
);

// also reset error when selecting a new event
code = code.replace(
  'setSubCategory("");\n            }}',
  'setSubCategory("");\n              setError("");\n            }}'
);

fs.writeFileSync('src/components/technomania/technomania-register-client.tsx', code);
