import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Arena } from "@/lib/models/Arena";

export async function GET() {
  try {
    await connectDB();
    const arenas = await Arena.find().sort({ createdAt: -1 }).lean();
    return NextResponse.json(arenas);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch arenas" }, { status: 500 });
  }
}

export async function POST(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    const arena = await Arena.create(body);
    return NextResponse.json(arena, { status: 201 });
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
