const fs = require('fs');
let code = fs.readFileSync('src/components/technomania/technomania-register-client.tsx', 'utf8');

const oldPayload = `    const payload = {
      teamName: requiresTeam ? teamName : undefined,
      leader,
      members: requiresTeam ? members.map(m => ({ name: m.name, email: m.email, uid: m.uid, customFields: m.gameId ? { gameId: m.gameId, inGameName: m.inGameName } : undefined })) : [],
      subCategory: selectedEvent.slug === "battlegrid" ? subCategory : undefined,
    };`;

const newPayload = `    const payload = {
      mode: requiresTeam ? "team" : "individual",
      teamName: requiresTeam ? teamName : undefined,
      name: leader.name,
      email: leader.email,
      uid: leader.uid,
      program: "N/A",
      semester: 1,
      customFields: leader.gameId || subCategory ? { gameId: leader.gameId, inGameName: leader.inGameName, subCategory } : undefined,
      members: requiresTeam ? members.map(m => ({
        name: m.name,
        email: m.email,
        uid: m.uid,
        program: "N/A",
        semester: 1,
        customFields: m.gameId ? { gameId: m.gameId, inGameName: m.inGameName } : undefined
      })) : [],
    };`;

code = code.replace(oldPayload, newPayload);

fs.writeFileSync('src/components/technomania/technomania-register-client.tsx', code);
