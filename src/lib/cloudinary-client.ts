/**
 * Automatically injects Cloudinary transformations (auto-format, auto-quality, and max-width)
 * to serve compressed WebP/AVIF images at exactly the right size for the device viewport.
 * Safe for Client Components (zero Node.js/server dependencies).
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
