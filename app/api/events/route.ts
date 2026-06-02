import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Event } from "@/lib/models";
import { audit, requirePortal } from "@/lib/portal";
import { eventInput } from "@/lib/validations/event";
export async function GET(req:NextRequest){await connectDB();const status=req.nextUrl.searchParams.get("status");const query=status?{status}:{status:{$in:["published","active"]}};return NextResponse.json(await Event.find(query).sort({startAt:1}).populate("team","name slug").lean())}
export async function POST(req:NextRequest){const blocked=await requirePortal(req);if(blocked)return blocked;const session=await auth();if(!["super_admin","president","vice_president","secretary","team_lead"].includes((session?.user as {role?:string})?.role||""))return NextResponse.json({error:"Forbidden"},{status:403});const parsed=eventInput.safeParse(await req.json());if(!parsed.success)return NextResponse.json({error:parsed.error.flatten()},{status:400});await connectDB();const event=await Event.create(parsed.data);await audit(req,"portal.events.create",{entityType:"events",entityId:event._id});return NextResponse.json(event,{status:201})}
