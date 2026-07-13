import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";
import { rateLimit } from "@/lib/rate-limit";

export const runtime = "nodejs";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "video/mp4", "video/webm", "application/pdf"]);
const maxBytes = 20 * 1024 * 1024;

export async function POST(req: NextRequest) {
  const ip = req.headers.get("x-forwarded-for") || "local";
  if (!rateLimit(`recruitment-upload:${ip}`, 10, 60_000)) return NextResponse.json({ error: "Too many uploads. Try again shortly." }, { status: 429 });
  const form = await req.formData();
  const file = form.get("file");
  if (!(file instanceof File)) return NextResponse.json({ error: "A file is required." }, { status: 400 });
  if (!allowedTypes.has(file.type)) return NextResponse.json({ error: "Unsupported file type." }, { status: 400 });
  if (file.size > maxBytes) return NextResponse.json({ error: "File must be 20MB or smaller." }, { status: 400 });
  try {
    const resourceType = file.type === "application/pdf" ? "raw" : file.type.startsWith("video/") ? "video" : "image";
    const result = await uploadToCloudinary(Buffer.from(await file.arrayBuffer()), { folder: "tech-tatva-os/recruitment", resourceType });
    return NextResponse.json({ url: result.secure_url, publicId: result.public_id, resourceType: result.resource_type }, { status: 201 });
  } catch (error) {
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed." }, { status: 500 });
  }
}
