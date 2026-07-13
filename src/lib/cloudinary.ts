import { v2 as cloudinary } from "cloudinary";
cloudinary.config({cloud_name:process.env.CLOUDINARY_CLOUD_NAME,api_key:process.env.CLOUDINARY_API_KEY,api_secret:process.env.CLOUDINARY_API_SECRET,secure:true});
export function getUploadSignature(folder="tech-tatva-os"){const timestamp=Math.round(Date.now()/1000);return {timestamp,folder,signature:cloudinary.utils.api_sign_request({timestamp,folder},process.env.CLOUDINARY_API_SECRET||"")}}
export function cloudinaryConfigured() {
  return Boolean(process.env.CLOUDINARY_CLOUD_NAME && process.env.CLOUDINARY_API_KEY && process.env.CLOUDINARY_API_SECRET);
}
export async function uploadToCloudinary(buffer: Buffer, options: { folder?: string; resourceType?: "image" | "video" | "raw" | "auto" } = {}) {
  if (!cloudinaryConfigured()) throw new Error("Cloudinary is not configured");
  return new Promise<{ secure_url: string; public_id: string; resource_type: string }>((resolve, reject) => {
    const stream = cloudinary.uploader.upload_stream(
      { folder: options.folder || "tech-tatva-os", resource_type: options.resourceType || "auto" },
      (error, result) => {
        if (error || !result) return reject(error || new Error("Cloudinary upload failed"));
        resolve({ secure_url: result.secure_url, public_id: result.public_id, resource_type: result.resource_type });
      }
    );
    stream.end(buffer);
  });
}

/**
 * Automatically injects Cloudinary transformations (auto-format, auto-quality, and max-width)
 * to serve compressed WebP/AVIF images at exactly the right size for the device viewport.
 */
export function optimizeCloudinaryUrl(url: string | undefined | null, width = 800): string {
  if (!url) return "";
  if (!url.includes("res.cloudinary.com")) return url;
  
  // Look for '/upload/' in the Cloudinary URL structure
  const uploadIndex = url.indexOf("/upload/");
  if (uploadIndex === -1) return url;
  
  const prefix = url.substring(0, uploadIndex + 8); // e.g. "https://res.cloudinary.com/user/image/upload/"
  const suffix = url.substring(uploadIndex + 8);
  
  // Return with format auto, quality auto, and width set
  return `${prefix}f_auto,q_auto,w_${width}/${suffix}`;
}
