"use client";

import { PrismaHero } from "@/components/ui/prisma-hero";

export default function PrismaDemoPage() {
  return (
    <main className="min-h-screen bg-black text-white flex flex-col p-4 md:p-8">
      <PrismaHero />
    </main>
  );
}
