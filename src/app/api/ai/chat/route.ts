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
      university: "Chandigarh University (CU)",
      campus: "Gharuan, Mohali, Punjab",
      vision: clubInfo.vision,
      mission: clubInfo.mission,
      location: clubInfo.location || "Chandigarh University, Gharuan, Mohali",
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
    if (!rateLimit(`public-ai:${ip}`, 25, 60_000)) {
      return NextResponse.json({ error: "You're asking questions very quickly! Please wait a few seconds." }, { status: 429 });
    }

    const body = await req.json();
    const prompt = String(body.prompt || "").trim();
    if (!prompt) {
      return NextResponse.json({ error: "Please enter a message or question." }, { status: 400 });
    }
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
      parts: [{ text: `User question:\n${prompt}\n\nLive Tech Tatva Club public information & database context:\n${JSON.stringify(publicContext, null, 2).slice(0, 12000)}` }]
    });

    const fallback = "Tech Tatva is Chandigarh University's premier student-led tech club (Gharuan, Mohali). We organize hackathons, prompt wars, developer workshops, and student mentorship. You can explore our events at /events, register for student membership at /join, or check recruitment opportunities at /recruitment!";
    const response = await generateWithGemini({
      system: `You are 'Tech Tatva AI', the official interactive virtual assistant for Tech Tatva (the premier student technology and innovation club of Chandigarh University, Gharuan, Mohali).

Your core objectives:
1. Enthusiastically help students, participants, and visitors learn about Tech Tatva events, workshops, hackathons, registrations, teams, and membership at Chandigarh University (CU).
2. Provide concise, friendly, and structured responses (use bullet points and emojis where helpful).
3. If the user greets you with 'hi', 'hello', or similar greetings, warmly welcome them to Tech Tatva at Chandigarh University and mention 2-3 things you can help with (like upcoming events, membership drive, or teams).
4. Direct users to relevant website sections using clean markdown links:
   - Student Membership Drive: [Join Tech Tatva](/join)
   - Live & Upcoming Events: [Explore Events](/events)
   - Core Team Recruitment: [Recruitment Portal](/recruitment)
   - Club Teams & Leads: [Our Teams](/teams)
   - Hall of Fame & Alumni: [Hall of Fame](/hall-of-fame)
   - Event Gallery: [Gallery](/gallery)
   - Contact Organizers: [Contact Us](/contact)
5. You represent Chandigarh University (CU). Never refer to any other university. Never make up false dates or private personal contact numbers. If details are not in the context, guide them to the respective page or [Contact Us](/contact).`,
      contents,
      fallback
    });

    return NextResponse.json({ response });
  } catch (error) {
    console.error("Public chat assistant failed", error);
    return NextResponse.json({ error: "Failed to fetch response" }, { status: 500 });
  }
}
