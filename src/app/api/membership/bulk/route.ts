import { NextRequest, NextResponse } from "next/server";
import { z } from "zod";
import { connectDB } from "@/lib/db";
import { StudentMember } from "@/lib/models";
import { requirePortal } from "@/lib/portal";

const bulkSchema = z.object({
  action: z.enum(["approve", "reject"]),
  ids: z.array(z.string().min(1)).min(1).max(500)
});

export async function POST(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;

  const parsed = bulkSchema.safeParse(await req.json());
  if (!parsed.success) return NextResponse.json({ error: "Invalid bulk request." }, { status: 400 });

  await connectDB();
  const status = parsed.data.action === "approve" ? "approved" : "rejected";
  const update: Record<string, any> = { status };
  if (status === "approved") update.approvedAt = new Date();

  await StudentMember.updateMany(
    { _id: { $in: parsed.data.ids } },
    { $set: update }
  );

  return NextResponse.json({ updated: parsed.data.ids.length, status });
}
