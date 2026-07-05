const mongoose = require("mongoose");

const uri = "mongodb+srv://eshaansharma800_db_user:EYznrcAWvoDZ8wxy@cluster0.niwb9lv.mongodb.net/tech-tatva-os?appName=Cluster0";

const ClubInfoSchema = new mongoose.Schema({
  key: { type: String, required: true, unique: true },
  value: mongoose.Schema.Types.Mixed
}, { timestamps: true });

const ClubInfo = mongoose.models.ClubInfo || mongoose.model("ClubInfo", ClubInfoSchema, "clubinfos");

async function run() {
  await mongoose.connect(uri);
  console.log("Connected to MongoDB!");
  
  // Find current values
  const allRows = await ClubInfo.find({});
  console.log("Current ClubInfo keys/values:");
  for (const row of allRows) {
    console.log(`- ${row.key}: ${JSON.stringify(row.value)}`);
  }

  // Update instagramHandle
  const updatedHandle = await ClubInfo.findOneAndUpdate(
    { key: "instagramHandle" },
    { value: "techtatvaclub" },
    { upsert: true, new: true }
  );
  console.log("Updated instagramHandle:", updatedHandle);

  // Update instagramUrl
  const updatedUrl = await ClubInfo.findOneAndUpdate(
    { key: "instagramUrl" },
    { value: "https://instagram.com/techtatvaclub" },
    { upsert: true, new: true }
  );
  console.log("Updated instagramUrl:", updatedUrl);

  await mongoose.disconnect();
  console.log("Disconnected from MongoDB!");
}

run().catch(console.error);
