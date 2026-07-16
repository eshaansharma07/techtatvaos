const fs = require('fs');
const mongoose = require('mongoose');

let uri = process.env.MONGODB_URI;
try {
  const envFile = fs.readFileSync('e:\\techtatvaos\\.env.local', 'utf8');
  const line = envFile.split('\n').find(l => l.trim().startsWith('MONGODB_URI='));
  if (line) {
    uri = line.split('=')[1].trim().replace(/['"]/g, '');
  }
} catch (e) {
  console.log("No .env.local file found or failed to read:", e.message);
}

async function main() {
  if (!uri) {
    console.error("MONGODB_URI not found");
    process.exit(1);
  }
  await mongoose.connect(uri);
  const db = mongoose.connection.db;

  console.log("Connected to MongoDB database.");

  // Clear existing teams, users, and clubinfos to prevent duplicates
  await db.collection('teams').deleteMany({});
  await db.collection('users').deleteMany({});
  await db.collection('clubinfos').deleteMany({});

  console.log("Cleared old teams, users, and settings.");

  // Helper to create users
  async function createUser(name, email, role = 'club_member') {
    const doc = {
      name,
      email: email.toLowerCase(),
      passwordHash: '$2a$10$xyz', // Dummy hash
      role: 'member',
      memberType: 'club_member',
      status: 'active',
      createdAt: new Date(),
      updatedAt: new Date()
    };
    const res = await db.collection('users').insertOne(doc);
    return res.insertedId;
  }

  // Create leads
  const sarthId = await createUser("Sarth", "sarth@techtatva.in");
  const satvikId = await createUser("Satvik", "satvik@techtatva.in");
  const laxitaId = await createUser("Laxita Gaur", "laxita@techtatva.in");
  const arshitaId = await createUser("Arshita Thakur", "arshita@techtatva.in");
  const vaaniId = await createUser("Vaani Garg", "vaani@techtatva.in");

  // Create co-leads
  const kritarthId = await createUser("Kritarth Singh", "kritarth@techtatva.in");
  const sanketId = await createUser("Sanket", "sanket@techtatva.in");
  const sikhpreetId = await createUser("Sikhpreet Kaur", "sikhpreet@techtatva.in");
  const pawanpreetId = await createUser("Pawanpreet Singh", "pawanpreet@techtatva.in");
  const ehaId = await createUser("Eha Ahuja", "eha@techtatva.in");

  // Create members
  const rupeshId = await createUser("Rupesh Singh Pathania", "rupesh@techtatva.in");
  const darveshId = await createUser("Darvesh Singh", "darvesh@techtatva.in");
  const chhayaId = await createUser("Chhaya Prakash", "chhaya@techtatva.in");
  const anmolId = await createUser("Anmol Saini", "anmol@techtatva.in");

  const adityaId = await createUser("Aditya", "aditya@techtatva.in");
  const abhinavId = await createUser("Abhinav", "abhinav@techtatva.in");

  const metikalaId = await createUser("Metikala Jeevan Kumar", "metikala@techtatva.in");
  const bhavikaId = await createUser("Bhavika Dev", "bhavika@techtatva.in");
  const srishtiId = await createUser("Srishti Kumari", "srishti@techtatva.in");
  const krishId = await createUser("Krish Verma", "krish@techtatva.in");

  const bhumiId = await createUser("Bhumi", "bhumi@techtatva.in");
  const ishratId = await createUser("Ishrat Singh Grewal", "ishrat@techtatva.in");
  const tarunikaId = await createUser("Tarunika Kumari", "tarunika@techtatva.in");

  const prachiId = await createUser("Prachi", "prachi@techtatva.in");

  console.log("Seeded all team leads, co-leads, and members.");

  // Insert 5 teams
  const teamDocs = [
    {
      name: "Operations Team",
      slug: "operations-team",
      description: "Ensuring seamless execution of club activities through planning, coordination, logistics, and documentation.",
      lead: sarthId,
      coLeads: [kritarthId],
      members: [rupeshId, darveshId, chhayaId, anmolId],
      jointSecretaryLane: "technical",
      active: true,
      order: 1
    },
    {
      name: "Technical Team",
      slug: "technical-team",
      description: "Building innovative digital solutions, managing technology infrastructure, and driving technical excellence across Tech Tatva.",
      lead: satvikId,
      coLeads: [sanketId],
      members: [adityaId, abhinavId],
      jointSecretaryLane: "technical",
      active: true,
      order: 2
    },
    {
      name: "Social Media Team",
      slug: "social-media-team",
      description: "Managing the club's digital presence through engaging content, community interaction, and brand storytelling.",
      lead: laxitaId,
      coLeads: [sikhpreetId],
      members: [metikalaId, bhavikaId, srishtiId, krishId],
      jointSecretaryLane: "creative",
      active: true,
      order: 3
    },
    {
      name: "Design Team",
      slug: "design-team",
      description: "Designing impactful visuals and creative content that strengthen the identity and outreach of Tech Tatva.",
      lead: arshitaId,
      coLeads: [pawanpreetId],
      members: [bhumiId, ishratId, tarunikaId],
      jointSecretaryLane: "creative",
      active: true,
      order: 4
    },
    {
      name: "Event Team",
      slug: "event-team",
      description: "Planning and executing engaging events that foster learning, innovation, and collaboration.",
      lead: vaaniId,
      coLeads: [ehaId],
      members: [prachiId],
      jointSecretaryLane: "technical",
      active: true,
      order: 5
    }
  ];

  await db.collection('teams').insertMany(teamDocs);
  console.log("Seeded 5 teams successfully.");

  // Seed settings in clubinfos
  const settingsDocs = [
    { key: "secretaryName", value: "Eshaan Sharma" },
    { key: "secretaryEmail", value: "secretary@techtatva.in" },
    { key: "secretaryPhoto", value: "" },
    { key: "jointSecretaryOneName", value: "Aryan Dahiya" },
    { key: "jointSecretaryOneEmail", value: "jtsec.tech@techtatva.in" },
    { key: "jointSecretaryOnePhoto", value: "" },
    { key: "jointSecretaryTwoName", value: "Ritik Chawla" },
    { key: "jointSecretaryTwoEmail", value: "jtsec.creative@techtatva.in" },
    { key: "jointSecretaryTwoPhoto", value: "" },
    { key: "facultyChampionName", value: "Dr. Faculty Lead" },
    { key: "facultyChampionEmail", value: "faculty@cumail.in" }
  ];

  await db.collection('clubinfos').insertMany(settingsDocs);
  console.log("Seeded settings in clubinfos.");

  console.log("Database seeding completed successfully!");
  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
