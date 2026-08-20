import mongoose from "mongoose";

let uri = process.env.MONGODB_URI;

let cached = (global as typeof globalThis & { mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongoose;
if (!cached) cached = (global as typeof globalThis & { mongoose?: { conn: typeof mongoose | null; promise: Promise<typeof mongoose> | null } }).mongoose = { conn: null, promise: null };

export async function connectDB() {
  if (cached!.conn) return cached!.conn;

  if (!uri || uri.trim() === "") {
    if (process.env.NODE_ENV === "development") {
      const { MongoMemoryServer } = await import("mongodb-memory-server");
      const mongod = await MongoMemoryServer.create();
      uri = mongod.getUri();
      console.log("Started in-memory MongoDB at", uri);
    } else {
      throw new Error("MONGODB_URI is not configured");
    }
  }

  if (!cached!.promise) {
    const opts = {
      bufferCommands: false,
      maxPoolSize: 2,
      minPoolSize: 0,
      serverSelectionTimeoutMS: 5000,
      socketTimeoutMS: 45000,
    };
    cached!.promise = mongoose.connect(uri as string, opts).then(mongoose => {
      return mongoose;
    });
  }
  
  cached!.conn = await cached!.promise;
  return cached!.conn;
}
