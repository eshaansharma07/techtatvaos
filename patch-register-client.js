const fs = require('fs');
let code = fs.readFileSync('src/components/technomania/technomania-register-client.tsx', 'utf8');

// 1. Update the state to hold customFields
code = code.replace(
  'const [leader, setLeader] = useState({ name: "", email: "", uid: "" });',
  'const [leader, setLeader] = useState({ name: "", email: "", uid: "", gameId: "", inGameName: "" });'
);

code = code.replace(
  'const [members, setMembers] = useState([{ name: "", email: "", uid: "" }]);',
  'const [members, setMembers] = useState([{ name: "", email: "", uid: "", gameId: "", inGameName: "" }]);'
);

code = code.replace(
  'setMembers([{ name: "", email: "", uid: "" }]);',
  'setMembers([{ name: "", email: "", uid: "", gameId: "", inGameName: "" }]);'
);

// 2. Add validation for minSize
code = code.replace(
  'if (requiresTeam && !teamName) {',
  `if (requiresTeam && members.length < minSize - 1) {
      setError(\`This event requires a minimum of \${minSize} team members (Leader + \${minSize - 1} members).\`);
      return;
    }
    if (requiresTeam && !teamName) {`
);

// 3. Remove the conditional render of the delete button so it's always visible
code = code.replace(
  /\{members\.length > \(minSize - 1\) && \(\s*<button type="button" onClick=\{\(\) => removeMember\(i\)\}/g,
  '{true && (\n                          <button type="button" onClick={() => removeMember(i)}'
);

// 4. In Leader Details, add fields for BattleGrid
const leaderFieldsReplace = `
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <input type="text" placeholder="Full Name" required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={leader.name} onChange={e => setLeader({...leader, name: e.target.value})} />
                <input type="email" placeholder="Email Address" required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={leader.email} onChange={e => setLeader({...leader, email: e.target.value})} />
                <input type="text" placeholder="University UID" required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={leader.uid} onChange={e => setLeader({...leader, uid: e.target.value})} />
              </div>
              {selectedEvent.slug === "battlegrid" && subCategory && (
                <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
                  <input type="text" placeholder={subCategory === "VALORANT" ? "Riot ID" : subCategory === "CLASH ROYALE" ? "Player Tag" : "Player ID"} required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={leader.gameId} onChange={e => setLeader({...leader, gameId: e.target.value})} />
                  <input type="text" placeholder="In-Game Name (IGN)" required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={leader.inGameName} onChange={e => setLeader({...leader, inGameName: e.target.value})} />
                </div>
              )}
`;
code = code.replace(
  /<div className="grid grid-cols-1 md:grid-cols-3 gap-4">\s*<input type="text" placeholder="Full Name"[^>]+>\s*<input type="email" placeholder="Email Address"[^>]+>\s*<input type="text" placeholder="University UID"[^>]+>\s*<\/div>/g,
  leaderFieldsReplace
);

// 5. In Additional Members, add fields for BattleGrid
const memberFieldsReplace = `
                      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 w-full">
                        <input type="text" placeholder="Full Name" required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={m.name} onChange={e => { const newM = [...members]; newM[i].name = e.target.value; setMembers(newM); }} />
                        <input type="email" placeholder="Email Address" required className="col-span-1 md:col-span-2 bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={m.email} onChange={e => { const newM = [...members]; newM[i].email = e.target.value; setMembers(newM); }} />
                        <div className="flex gap-2">
                          <input type="text" placeholder="UID" required className="flex-1 bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={m.uid} onChange={e => { const newM = [...members]; newM[i].uid = e.target.value; setMembers(newM); }} />
                          <button type="button" onClick={() => removeMember(i)} className="w-12 flex items-center justify-center text-tm-dim hover:text-red-500 transition-colors bg-black border border-tm-border rounded-xl">
                            <AlertCircle size={16} />
                          </button>
                        </div>
                        {selectedEvent.slug === "battlegrid" && subCategory && (
                          <div className="col-span-1 md:col-span-4 grid grid-cols-1 md:grid-cols-2 gap-4">
                            <input type="text" placeholder={subCategory === "VALORANT" ? "Riot ID" : subCategory === "CLASH ROYALE" ? "Player Tag" : "Player ID"} required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={m.gameId} onChange={e => { const newM = [...members]; newM[i].gameId = e.target.value; setMembers(newM); }} />
                            <input type="text" placeholder="In-Game Name (IGN)" required className="bg-black border border-tm-border rounded-xl p-3 text-sm text-white font-tm-mono outline-none focus:border-white" value={m.inGameName} onChange={e => { const newM = [...members]; newM[i].inGameName = e.target.value; setMembers(newM); }} />
                          </div>
                        )}
                      </div>
`;
code = code.replace(
  /<input type="text" placeholder="Full Name"[^>]+>\s*<input type="email" placeholder="Email Address"[^>]+>\s*<div className="flex gap-2">\s*<input type="text" placeholder="UID"[^>]+>\s*\{true && \(\s*<button type="button" onClick=\{\(\) => removeMember\(i\)\}[^>]+>\s*<AlertCircle size=\{16\} \/>\s*<\/button>\s*\)\}\s*<\/div>/g,
  memberFieldsReplace
);

// 6. In payload construction, wrap gameId and inGameName into customFields
code = code.replace(
  'leader,',
  'leader: { name: leader.name, email: leader.email, uid: leader.uid, customFields: leader.gameId ? { gameId: leader.gameId, inGameName: leader.inGameName } : undefined },'
);
code = code.replace(
  'members: requiresTeam ? members : [],',
  'members: requiresTeam ? members.map(m => ({ name: m.name, email: m.email, uid: m.uid, customFields: m.gameId ? { gameId: m.gameId, inGameName: m.inGameName } : undefined })) : [],'
);

fs.writeFileSync('src/components/technomania/technomania-register-client.tsx', code);
