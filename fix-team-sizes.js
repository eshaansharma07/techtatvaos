const fs = require('fs');
let code = fs.readFileSync('src/app/api/events/[id]/register/route.ts', 'utf8');

const oldLogic = `    const mode = payload.mode === "team" ? "team" : "individual";
    const eventMode = event.participationMode || "individual";
    const allowed = eventMode === "both" || eventMode === mode;
    if (!allowed) return NextResponse.json({ error: \`This event accepts \${eventMode} registrations only.\` }, { status: 400 });`;

const newLogic = `    const mode = payload.mode === "team" ? "team" : "individual";
    
    // Coerce data inconsistencies where maxTeamSize or teamSize.max > 1 but participationMode was left as "individual"
    const derivedMaxTeamSize = Math.max(1, Number(event.maxTeamSize || 1), Number(event.teamSize?.max || 1));
    const eventMode = event.participationMode === "both" ? "both" : (derivedMaxTeamSize > 1 ? "team" : (event.participationMode || "individual"));
    
    const allowed = eventMode === "both" || eventMode === mode;
    if (!allowed) return NextResponse.json({ error: \`This event accepts \${eventMode} registrations only.\` }, { status: 400 });`;

code = code.replace(oldLogic, newLogic);

const oldSizeLogic = `const maxTeamSize = Math.max(1, Number(event.maxTeamSize || 1));`;
const newSizeLogic = `const maxTeamSize = derivedMaxTeamSize;`;

code = code.replace(oldSizeLogic, newSizeLogic);

fs.writeFileSync('src/app/api/events/[id]/register/route.ts', code);
