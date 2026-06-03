import { NextRequest, NextResponse } from "next/server";
import { audit, requirePortal } from "@/lib/portal";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "video/mp4", "video/webm"]);
const maxBytes = 10 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const blocked = await requirePortal(req);
  if (blocked) return blocked;

  const form = await req.formData();
  const file = form.get("file");
  const folder = String(form.get("folder") || "tech-tatva-os");

  if (!(file instanceof File)) return NextResponse.json({ error: "A file is required" }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
  if (file.size > maxBytes) return NextResponse.json({ error: "File must be 10MB or smaller" }, { status: 400 });

  try {
    const buffer = Buffer.from(await file.arrayBuffer());
    const result = await uploadToCloudinary(buffer, {
      folder,
      resourceType: file.type.startsWith("video/") ? "video" : "image"
    });
    await audit(req, "portal.upload.create", { entityType: "cloudinary", publicId: result.public_id, resourceType: result.resource_type });
    return NextResponse.json({
      url: result.secure_url,
      publicId: result.public_id,
      resourceType: result.resource_type
    }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}
