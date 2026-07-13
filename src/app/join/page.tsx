import { getMembershipDriveStatus } from "@/lib/public-data";
import { PublicShell } from "@/components/public-shell";
import { JoinClient } from "./join-client";
import fs from "fs";
import path from "path";

export const revalidate = 10;

export default async function JoinPage() {
  const status = await getMembershipDriveStatus();
  
  const logoPath = path.join(process.cwd(), "public/logo-colour.png");
  const cuLogoPath = path.join(process.cwd(), "public/chandigarh-university-logo.png");

  const logoBase64 = fs.existsSync(logoPath)
    ? `data:image/png;base64,${fs.readFileSync(logoPath).toString("base64")}`
    : "";

  const cuLogoBase64 = fs.existsSync(cuLogoPath)
    ? `data:image/png;base64,${fs.readFileSync(cuLogoPath).toString("base64")}`
    : "";

  return (
    <PublicShell>
      <JoinClient 
        initialStatus={status} 
        logoBase64={logoBase64}
        cuLogoBase64={cuLogoBase64}
      />
    </PublicShell>
  );
}
