import { connectDB } from "./src/lib/db";
import { Event } from "./src/lib/models";
import mongoose from "mongoose";

async function run() {
  await connectDB();
  console.log("Connected to DB");
  
  const events = await Event.find({ 
    $or: [{ fest: "technomania" }, { category: { $in: ["DeepTech & AI", "Hardware & Speed", "Gaming & Community"] } }] 
  });
  
  for (const event of events) {
    if (event.teamSize && event.teamSize.max) {
      if (event.teamSize.max > 1) {
        event.participationMode = "team";
      } else {
        event.participationMode = "individual";
      }
      event.maxTeamSize = event.teamSize.max;
      await event.save();
      console.log(`Updated event: ${event.title} -> mode: ${event.participationMode}, maxTeamSize: ${event.maxTeamSize}`);
    }
  }
  
  console.log("Done");
  process.exit(0);
}

run().catch(console.error);
