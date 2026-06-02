import { NextRequest, NextResponse } from "next/server";
import { auth } from "@/auth";
import { connectDB } from "@/lib/db";
import { Announcement, Event, Task, Team, User } from "@/lib/models";
import { requirePortal } from "@/lib/portal";
export async function GET(req:NextRequest){const blocked=await requirePortal(req);if(blocked)return blocked;if(!await auth())return NextResponse.json({error:"Unauthorized"},{status:401});const q=req.nextUrl.searchParams.get("q")?.trim();if(!q||q.length<2)return NextResponse.json([]);await connectDB();const regex=new RegExp(q.replace(/[.*+?^${}()|[\]\\]/g,"\\$&"),"i");const [members,teams,events,tasks,announcements]=await Promise.all([User.find({$or:[{name:regex},{email:regex},{uid:regex}]}).select("name email uid").limit(5),Team.find({name:regex}).select("name slug").limit(5),Event.find({title:regex}).select("title slug status").limit(5),Task.find({title:regex}).select("title status").limit(5),Announcement.find({title:regex}).select("title status").limit(5)]);return NextResponse.json({members,teams,events,tasks,announcements})}
