import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { ContactMessage } from "@/lib/models";
import { rateLimit } from "@/lib/rate-limit";

const contactInput=z.object({
  name:z.string().min(2).max(120),
  email:z.string().email(),
  registrationNumber:z.string().max(80).optional().or(z.literal("")),
  subject:z.string().min(2).max(160),
  message:z.string().min(5).max(4000)
});

export async function POST(req:NextRequest){
  const ip=req.headers.get("x-forwarded-for")||"unknown";
  if(!rateLimit(`contact:${ip}`,5))return NextResponse.json({error:"Too many messages. Try again later."},{status:429});
  const parsed=contactInput.safeParse(await req.json());
  if(!parsed.success)return NextResponse.json({error:"Valid contact details are required."},{status:400});
  await connectDB();
  const message=await ContactMessage.create(parsed.data);
  return NextResponse.json({id:String(message._id),status:message.status},{status:201});
}
