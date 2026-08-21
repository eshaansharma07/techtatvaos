const fs = require('fs');
let code = fs.readFileSync('src/components/technomania/technomania-register-client.tsx', 'utf8');

// Add whatsappLink to state
code = code.replace(
  'const [ticketId, setTicketId] = useState("");',
  'const [ticketId, setTicketId] = useState("");\n  const [whatsappLink, setWhatsappLink] = useState("");'
);

// Fix the ID returned and set WhatsApp link
code = code.replace(
  'setTicketId(data.registrationId);',
  'setTicketId(data.id || data.registrationId);\n      if (data.whatsappGroupLink) setWhatsappLink(data.whatsappGroupLink);'
);

// Add the Join WhatsApp button to the success screen
const successScreenEnd = '        <div className="pt-6 border-t border-tm-border/50 text-sm font-tm-mono text-tm-muted text-left space-y-2">\n          <p><span className="text-white">EVENT:</span> {selectedEvent?.title}</p>\n          {subCategory && <p><span className="text-white">CATEGORY:</span> {subCategory}</p>}\n          {requiresTeam && <p><span className="text-white">TEAM:</span> {teamName}</p>}\n          <p><span className="text-white">LEADER:</span> {leader.name} ({leader.uid})</p>\n        </div>\n      </div>';

const successScreenWithWhatsApp = `        <div className="pt-6 border-t border-tm-border/50 text-sm font-tm-mono text-tm-muted text-left space-y-2">
          <p><span className="text-white">EVENT:</span> {selectedEvent?.title}</p>
          {subCategory && <p><span className="text-white">CATEGORY:</span> {subCategory}</p>}
          {requiresTeam && <p><span className="text-white">TEAM:</span> {teamName}</p>}
          <p><span className="text-white">LEADER:</span> {leader.name} ({leader.uid})</p>
        </div>
        
        {whatsappLink && (
          <div className="pt-6 border-t border-tm-border/50 flex flex-col items-center gap-4">
            <p className="text-xs font-tm-mono text-tm-muted uppercase">Join the official WhatsApp group for updates</p>
            <a href={whatsappLink} target="_blank" rel="noopener noreferrer" className="bg-[#25D366] hover:bg-[#20bd5a] text-black font-bold tracking-widest text-sm py-3 px-6 rounded-xl flex items-center justify-center gap-2 transition-all w-full max-w-sm">
              JOIN WHATSAPP GROUP
            </a>
          </div>
        )}
      </div>`;

code = code.replace(successScreenEnd, successScreenWithWhatsApp);

fs.writeFileSync('src/components/technomania/technomania-register-client.tsx', code);
