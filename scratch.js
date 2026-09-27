const fs = require('fs');
const file = '/Users/vasuislive/Downloads/techtatvaos-main/src/app/events/[slug]/page.tsx';
const content = fs.readFileSync(file, 'utf-8');
const lines = content.split('\n');
const index = lines.findIndex(l => l.includes('export default async function EventDetail'));

const metadataCode = `
import { Metadata } from "next";

export async function generateMetadata({ params }: { params: Promise<{ slug: string }> }): Promise<Metadata> {
  const { slug } = await params;
  const event = await getPublicEvent(slug);
  if (!event) return { title: "Event Not Found | Tech Tatva" };
  
  return {
    title: \`\${event.title} | Tech Tatva\`,
    description: eventSummary(event.description || ""),
    openGraph: {
      title: event.title,
      description: eventSummary(event.description || ""),
      images: event.banner ? [optimizeCloudinaryUrl(event.banner, 1200, 630)] : [],
    },
  };
}
`;

lines.splice(index, 0, metadataCode);
fs.writeFileSync(file, lines.join('\n'));
