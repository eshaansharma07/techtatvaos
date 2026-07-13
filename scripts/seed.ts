import mongoose from "mongoose";
import { Role } from "../src/lib/models";
import { roleDefaults } from "../src/lib/permissions";
async function seed(){if(!process.env.MONGODB_URI)throw new Error("MONGODB_URI is required");await mongoose.connect(process.env.MONGODB_URI);for(const [slug,permissions] of Object.entries(roleDefaults))await Role.findOneAndUpdate({slug},{name:slug.split("_").map(x=>x[0].toUpperCase()+x.slice(1)).join(" "),slug,permissions,system:true},{upsert:true});console.log("Seeded roles");await mongoose.disconnect()}
seed().catch(e=>{console.error(e);process.exit(1)});
