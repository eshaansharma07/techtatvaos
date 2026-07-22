"use client";

import dynamic from "next/dynamic";
import type { ComponentProps } from "react";
import { useEffect, useState } from "react";

const InteractiveHero3D = dynamic(
  () => import("@/components/interactive-hero-3d").then((mod) => mod.InteractiveHero3D),
  { ssr: false }
);

const InstagramFeed = dynamic(
  () => import("@/components/instagram-feed").then((mod) => mod.InstagramFeed),
  { ssr: false }
);

const CommunityShowcase = dynamic(
  () => import("@/components/community-showcase").then((mod) => mod.CommunityShowcase),
  { ssr: false }
);

function useMediaQuery(query: string) {
  const [matches, setMatches] = useState(false);

  useEffect(() => {
    const media = window.matchMedia(query);
    const update = () => setMatches(media.matches);
    update();
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, [query]);

  return matches;
}

export function DeferredHero3D() {
  const isDesktop = useMediaQuery("(min-width: 768px)");
  return isDesktop ? <InteractiveHero3D /> : null;
}

export function DeferredInstagramFeed(props: ComponentProps<typeof InstagramFeed>) {
  return <InstagramFeed {...props} />;
}

export function DeferredCommunityShowcase(props: ComponentProps<typeof CommunityShowcase>) {
  return <CommunityShowcase {...props} />;
}
