import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { FestConfig } from "@/lib/models/FestConfig";

export async function GET() {
  try {
    await connectDB();
    let config = await FestConfig.findOne().lean();
    if (!config) {
      config = await FestConfig.create({ marqueeTicker: ["WELCOME"], festDays: 3, registrationOpen: true });
    }
    return NextResponse.json(config);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch config" }, { status: 500 });
  }
}

export async function PUT(req: NextRequest) {
  try {
    await connectDB();
    const body = await req.json();
    let config = await FestConfig.findOne();
    if (!config) {
      config = await FestConfig.create(body);
    } else {
      config = await FestConfig.findByIdAndUpdate(config._id, body, { new: true });
    }
    return NextResponse.json(config);
  } catch (err: any) {
    return NextResponse.json({ error: err.message }, { status: 400 });
  }
}
