import { NextResponse } from "next/server";
import { getTechnomaniaStats } from "@/lib/technomania-data";

export async function GET() {
  try {
    const stats = await getTechnomaniaStats();
    return NextResponse.json(stats);
  } catch (err) {
    return NextResponse.json({ error: "Failed to fetch stats" }, { status: 500 });
  }
}
