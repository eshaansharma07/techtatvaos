import "./globals.css";
import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Tech Tatva OS",
  description: "The operating system for a new generation of builders."
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return <html lang="en"><body>{children}</body></html>;
}
