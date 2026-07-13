import { Types } from "mongoose";
import { connectDB } from "@/lib/db";
import { Attendance } from "@/lib/models";

export type AttendanceStatus = "present" | "absent";

export async function markAttendanceStatus(input: {
  event: string;
  user: string;
  registration?: string;
  status: AttendanceStatus;
  markedBy?: string;
}) {
  const event = String(input.event || "");
  const user = String(input.user || "");
  if (!Types.ObjectId.isValid(event) || !Types.ObjectId.isValid(user)) {
    throw new Error("Valid event and user ids are required");
  }

  await connectDB();
  const eventId = new Types.ObjectId(event);
  const userId = new Types.ObjectId(user);
  const update: Record<string, any> = {
    event: eventId,
    user: userId,
    status: input.status,
    method: "manual",
    markedAt: new Date()
  };
  if (input.registration && Types.ObjectId.isValid(input.registration)) update.registration = new Types.ObjectId(input.registration);
  if (input.markedBy && Types.ObjectId.isValid(input.markedBy)) update.markedBy = new Types.ObjectId(input.markedBy);

  const record = await Attendance.findOneAndUpdate(
    { event: eventId, user: userId },
    { $set: update },
    { upsert: true, new: true, runValidators: true, setDefaultsOnInsert: true }
  ).lean() as { _id: Types.ObjectId; status?: string } | null;
  if (!record) throw new Error(`Attendance save failed. Expected ${input.status}.`);

  const confirmed = await Attendance.findOne({ _id: record._id }).lean() as { status?: string } | null;
  if (!confirmed || confirmed.status !== input.status) {
    throw new Error(`Attendance save failed. Expected ${input.status}.`);
  }

  return Attendance.findById(record._id)
    .populate("event", "title")
    .populate("user", "name email uid program semester");
}
