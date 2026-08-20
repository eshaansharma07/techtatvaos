import fs from "fs";
import path from "path";
import mongoose from "mongoose";
import { Event } from "../src/lib/models";

const envPath = path.join(process.cwd(), ".env.local");
if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  envContent.split("\n").forEach(line => {
    const match = line.match(/^([^=]+)=(.*)$/);
    if (match) {
      process.env[match[1]] = match[2];
    }
  });
}

const eventsData = [
  {
    "id": "hackverse",
    "title": "HackVerse",
    "category": "DeepTech & AI",
    "description": "24-hour national hackathon. Sprint from prototype to MVP with three mentor checkpoints and a code freeze.",
    "capacity": 300,
    "team_size": { "min": 1, "max": 4 },
    "prize_pool": "₹80,000",
    "rounds": ["National Online Screening", "24-Hour Onsite Finale", "Live Demos"]
  },
  {
    "id": "battlegrid",
    "title": "BattleGrid",
    "category": "Gaming & Community",
    "description": "Esports championship featuring BGMI, VALORANT, and Clash Royale.",
    "capacity": 800,
    "team_size": { "min": 1, "max": 5 },
    "prize_pool": "₹30,500",
    "rounds": ["Day 1 Qualifiers", "Day 2 Live Grand Finals"]
  },
  {
    "id": "robowar",
    "title": "RoboWar",
    "category": "Hardware & Speed",
    "description": "Inter-university combat robotics championship. 1v1 bouts in a safety-controlled arena.",
    "capacity": 80,
    "team_size": { "min": 3, "max": 5 },
    "prize_pool": "₹80,000",
    "rounds": ["Inspection", "Group Qualifiers", "Knockouts & Grand Final"]
  },
  {
    "id": "dronestorm",
    "title": "DroneStorm",
    "category": "Hardware & Speed",
    "description": "Inter-university FPV drone racing on a checkpoint-and-obstacle track.",
    "capacity": 40,
    "team_size": { "min": 1, "max": 2 },
    "prize_pool": "TBA",
    "rounds": ["Entry & Inspection", "Practice & Timed Main Round", "Final Round"]
  },
  {
    "id": "promptclash",
    "title": "Prompt Clash",
    "category": "DeepTech & AI",
    "description": "Inter-college AI challenge of recreating a reference image through pure prompt-craft.",
    "capacity": 90,
    "team_size": { "min": 1, "max": 3 },
    "prize_pool": "₹10,000",
    "rounds": ["Reference Reveal", "Prompt & Iterate", "Rubric Judging"]
  },
  {
    "id": "scavengerhunt",
    "title": "Scavenger Hunt",
    "category": "Gaming & Community",
    "description": "Campus-wide tech clue trail, riddles, QR puzzles, and trivia.",
    "capacity": 150,
    "team_size": { "min": 3, "max": 5 },
    "prize_pool": "TBA",
    "rounds": ["Themed Clue Trail", "Staggered Starts", "Checkpoints & Tie-Breaker"]
  }
];

async function seed() {
  try {
    const MONGODB_URI = process.env.MONGODB_URI;
    if (!MONGODB_URI) {
      throw new Error("MONGODB_URI not found in environment variables.");
    }

    await mongoose.connect(MONGODB_URI);
    console.log("Connected to DB.");

    // Delete existing technomania events
    await Event.deleteMany({ fest: "technomania" });
    console.log("Cleared existing Technomania events.");

    const eventsToInsert = eventsData.map(e => ({
      title: e.title,
      slug: e.id,
      category: e.category,
      description: e.description,
      capacity: e.capacity,
      teamSize: e.team_size,
      maxTeamSize: e.team_size.max,
      prizePool: e.prize_pool,
      rounds: e.rounds,
      status: "published",
      registrationOpen: true,
      fest: "technomania",
      startAt: new Date(), // Using current date just for display
      endAt: new Date(new Date().getTime() + 24 * 60 * 60 * 1000)
    }));

    await Event.insertMany(eventsToInsert);
    console.log(`Inserted ${eventsToInsert.length} Technomania events.`);
    
    process.exit(0);
  } catch (error) {
    console.error("Seed error:", error);
    process.exit(1);
  }
}

seed();
