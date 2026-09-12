import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Attendance, EventRegistration } from "@/lib/models";
import { FestRegistration } from "@/lib/models/Registration";
import { requirePortal } from "@/lib/portal";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;

  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    
    // First try updating EventRegistration
    const eventReg = await EventRegistration.findByIdAndUpdate(id, body, { new: true }).lean();
    if (eventReg) {
      return NextResponse.json(eventReg);
    }

    // Only allow updating paymentStatus, attended, checkpointsCleared for FestRegistration
    const updateData: any = {};
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus;
    if (body.attended !== undefined) updateData.attended = body.attended;
    if (body.checkpointsCleared !== undefined) updateData.checkpointsCleared = body.checkpointsCleared;

    const reg = await FestRegistration.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!reg) return NextResponse.json({ error: "Registration not found" }, { status: 404 });
    return NextResponse.json(reg);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;

  try {
    await connectDB();
    const { id } = await params;

    // First try deleting EventRegistration (Tech Tatva standard event registration)
    const eventReg = await EventRegistration.findByIdAndDelete(id);
    if (eventReg) {
      // Also clean up any linked attendance records
      await Attendance.deleteMany({ registration: id });
      return NextResponse.json({ success: true, deleted: "EventRegistration" });
    }

    // Next try deleting FestRegistration (Technomania fest registration)
    const festReg = await FestRegistration.findByIdAndDelete(id);
    if (festReg) {
      return NextResponse.json({ success: true, deleted: "FestRegistration" });
    }

    return NextResponse.json({ error: "Registration not found" }, { status: 404 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
