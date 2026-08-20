import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FestRegistration } from "@/lib/models/Registration";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    
    // Only allow updating paymentStatus, attended, checkpointsCleared
    const updateData: any = {};
    if (body.paymentStatus !== undefined) updateData.paymentStatus = body.paymentStatus;
    if (body.attended !== undefined) updateData.attended = body.attended;
    if (body.checkpointsCleared !== undefined) updateData.checkpointsCleared = body.checkpointsCleared;

    const reg = await FestRegistration.findByIdAndUpdate(id, updateData, { new: true }).lean();
    if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(reg);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const reg = await FestRegistration.findByIdAndDelete(id);
    if (!reg) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
