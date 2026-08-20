import { NextRequest, NextResponse } from "next/server";
import { uploadToCloudinary } from "@/lib/cloudinary";

export const runtime = "nodejs";

const allowedTypes = new Set(["image/jpeg", "image/png", "image/webp", "image/gif", "image/svg+xml", "video/mp4", "video/webm"]);
const maxBytes = 20 * 1024 * 1024;

export async function POST(req: NextRequest) {
  try {
    const form = await req.formData();
    const file = form.get("file");
    const folder = String(form.get("folder") || "technomania-3.0");

    if (!(file instanceof File)) {
      return NextResponse.json({ error: "A valid file is required" }, { status: 400 });
    }
    if (!allowedTypes.has(file.type)) {
      return NextResponse.json({ error: "Unsupported file type" }, { status: 400 });
    }
    if (file.size > maxBytes) {
      return NextResponse.json({ error: "File must be 20MB or smaller" }, { status: 400 });
    }

    const buffer = Buffer.from(await file.arrayBuffer());
    const resourceType = file.type.startsWith("video/") ? "video" : "image";
    
    // Check if Cloudinary credentials exist, else fallback to base64 data url for development
    if (process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET) {
      const result = await uploadToCloudinary(buffer, {
        folder,
        resourceType
      });
      return NextResponse.json({
        url: result.secure_url,
        publicId: result.public_id,
        resourceType: result.resource_type
      }, { status: 201 });
    } else {
      // Fallback base64 data URI
      const base64 = `data:${file.type};base64,${buffer.toString("base64")}`;
      return NextResponse.json({
        url: base64,
        publicId: `tm-${Date.now()}`,
        resourceType
      }, { status: 201 });
    }
  } catch (error) {
    console.error("POST /api/technomania/upload error:", error);
    return NextResponse.json({ error: error instanceof Error ? error.message : "Upload failed" }, { status: 500 });
  }
}
