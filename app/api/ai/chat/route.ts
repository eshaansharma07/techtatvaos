import { NextRequest, NextResponse } from "next/server";
import { connectDB } from "@/lib/db";
import { Event, Team, Sponsor, Achievement, ClubInfo } from "@/lib/models";
import { generateWithGemini } from "@/lib/services/gemini";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";
export const revalidate = 0;

async function getPublicContext() {
  const [events, teams, sponsors, achievements, clubInfoRows] = await Promise.all([
    Event.find({ status: "published" }).select("title description category startAt venue registrationOpen participationMode slug").limit(10).lean(),
    Team.find({ active: true }).select("name description members").limit(15).lean(),
    Sponsor.find({ active: true }).select("name tier").limit(10).lean(),
    Achievement.find({}).select("title description kind").limit(10).lean(),
    ClubInfo.find({}).lean()
  ]);
  
  const clubInfo = Object.fromEntries(clubInfoRows.map(r => [r.key, r.value]));
  
  return {
    club: {
      name: "Tech Tatva",
      vision: clubInfo.vision,
      mission: clubInfo.mission,
      location: clubInfo.location,
      email: clubInfo.email,
      website: clubInfo.website,
      linkedinUrl: clubInfo.linkedinUrl,
      instagramUrl: clubInfo.instagramUrl,
      instagramHandle: clubInfo.instagramHandle,
    },
    events,
    teams,
    sponsors,
    achievements
  };
}

export async function POST(req: NextRequest) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "public";
    if (!rateLimit(`public-ai:${ip}`, 6, 60_000)) {
      return NextResponse.json({ error: "Too many requests. Try again in a minute." }, { status: 429 });
    }

    const body = await req.json();
    const prompt = String(body.prompt || "").trim();
    if (prompt.length < 3) return NextResponse.json({ error: "Prompt is required" }, { status: 400 });
    const history = Array.isArray(body.history) ? body.history : [];

    await connectDB();
    const publicContext = await getPublicContext();

    const contents: any[] = [];
    for (const turn of history) {
      if (turn.role === "user" || turn.role === "model") {
        contents.push({
          role: turn.role,
          parts: [{ text: turn.text }]
        });
      }
    }
    while (contents.length > 0 && contents[0].role === "model") {
      contents.shift();
    }
    
    contents.push({
      role: "user",
      parts: [{ text: `User question:\n${prompt}\n\nLive Tech Tatva Club public information:\n${JSON.stringify(publicContext, null, 2).slice(0, 10000)}` }]
    });

    const fallback = "Tech Tatva is a premier student-led tech community. We host hackathons, workshops, and recruitment drives. Ask me about our teams, events, or how to register!";
    const response = await generateWithGemini({
      system: "You are the public Tech Tatva Chat Assistant. Help candidates and visitors learn about the club, upcoming events, recruitment, and teams. Always answer politely using only the provided public club details. If info is not present, guide them to our links (e.g. /recruitment for joining, /events for registering). Never make up details or give private member information.",
      contents,
      fallback
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Public chat assistant failed", error);
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
  }
}
