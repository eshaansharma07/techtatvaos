import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Arena } from "@/lib/models/Arena";

export async function PUT(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const body = await req.json();
    const arena = await Arena.findByIdAndUpdate(id, body, { new: true }).lean();
    if (!arena) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json(arena);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}

export async function DELETE(req: NextRequest, { params }: { params: Promise<{ id: string }> }) {
  try {
    await connectDB();
    const { id } = await params;
    const arena = await Arena.findByIdAndDelete(id);
    if (!arena) return NextResponse.json({ error: "Not found" }, { status: 404 });
    return NextResponse.json({ success: true });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
