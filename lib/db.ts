import mongoose from "mongoose";
const uri = process.env.MONGODB_URI;
let cached = (global as typeof globalThis & { mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongoose;
if (!cached) cached = (global as typeof globalThis & { mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongoose = { conn: null, promise: null };
export async function connectDB() {
  if (cached!.conn) return cached!.conn;
  if (!uri) throw new Error("MONGODB_URI is not configured");
  if (!cached!.promise) cached!.promise = mongoose.connect(uri, { bufferCommands: false });
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
