import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { RecruitmentApplication, RecruitmentSettings } from "@/lib/models";
import { requirePortal } from "@/lib/portal";
import { sendApplicationStatusEmail } from "@/lib/recruitment-mail";

const bulkSchema = z.object({
  action: z.enum(["accept", "reject", "shortlist", "hold"]),
  ids: z.array(z.string().min(1)).min(1).max(200)
});

export async function POST(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;

  const parsed = bulkSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid bulk request." }, { status: 400 });

  await connectDB();
  const statusMap = { accept: "accepted", reject: "rejected", shortlist: "shortlisted", hold: "on_hold" } as const;
  const status = statusMap[parsed.data.action];
  const settings = await RecruitmentSettings.findOne({ key: "default" }).lean() as any;

  const applications = await RecruitmentApplication.find({ _id: { $in: parsed.data.ids } })
    .populate("team", "name")
    .populate("role", "name")
    .lean();

  await RecruitmentApplication.updateMany(
    { _id: { $in: parsed.data.ids } },
    { $set: { status }, $push: { timeline: { action: status, note: `Bulk ${parsed.data.action}`, at: new Date() } } }
  );

  await Promise.all(
    applications.map((application: any) =>
      sendApplicationStatusEmail(
        settings || {},
        {
          fullName: application.fullName,
          email: application.email,
          teamName: application.team?.name,
          roleName: application.role?.name
        },
        status
      )
    )
  );

  return NextResponse.json({ updated: parsed.data.ids.length, status });
}
