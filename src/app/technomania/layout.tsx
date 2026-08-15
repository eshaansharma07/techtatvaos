import { TechnomaniaShell } from "@/components/technomania/technomania-shell";
import { TechnomaniaBackground } from "@/components/technomania/technomania-background";

export default function TechnomaniaLayout({ children }: { children: React.ReactNode }) {
  return (
    <div className="font-tm-body bg-tm-bg text-tm-text min-h-screen relative selection:bg-tm-accent selection:text-black">
      <TechnomaniaBackground />
      <TechnomaniaShell>
        {children}
      </TechnomaniaShell>
    </div>
  );
}

