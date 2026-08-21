const fs = require('fs');
let code = fs.readFileSync('src/app/technomania/events/[slug]/page.tsx', 'utf8');

const heroCard = `      {/* Hero card */}
      <div className="tm-card p-5 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tm-accent/3 via-transparent to-transparent pointer-events-none" />

        <div className="relative grid items-start gap-8 lg:grid-cols-[1fr_minmax(300px,0.7fr)]">
          <div>
            {/* Category badge */}`;

const heroCardWithBanner = `      {/* Hero card */}
      <div className="tm-card p-5 md:p-8 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-tm-accent/3 via-transparent to-transparent pointer-events-none" />

        <div className="relative grid items-start gap-8 lg:grid-cols-[1fr_minmax(300px,0.7fr)]">
          <div>
            {/* Category badge */}`;

// Let's add the banner in the second column of the grid!
// Currently it's lg:grid-cols-[1fr_minmax(300px,0.7fr)], but the second column is totally empty!
// Wait, is it empty? Let me check the original code!
