const fs = require('fs');
let code = fs.readFileSync('src/components/technomania/technomania-register-client.tsx', 'utf8');

code = code.replace(
  'const [leader: { name: leader.name, email: leader.email, uid: leader.uid, customFields: leader.gameId ? { gameId: leader.gameId, inGameName: leader.inGameName } : undefined }, setLeader] = useState({ name: "", email: "", uid: "", gameId: "", inGameName: "" });',
  'const [leader, setLeader] = useState({ name: "", email: "", uid: "", gameId: "", inGameName: "" });'
);

fs.writeFileSync('src/components/technomania/technomania-register-client.tsx', code);
