import { NextRequest, NextResponse } from "next/server";
import { getClubInfo } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  try {
    const clubInfo = await getClubInfo();
    const instagramFeedUrl = clubInfo.instagramFeedUrl?.trim();

    if (!instagramFeedUrl) {
      return NextResponse.json({ source: "manual", posts: [] });
    }

    // Fetch the live Instagram feed from the configured URL (e.g. Behold.so or public JSON proxy)
    const res = await fetch(instagramFeedUrl, {
      cache: "no-store"
    });

    if (!res.ok) {
      throw new Error(`Failed to fetch Instagram feed, status: ${res.status}`);
    }

    const rawData = await res.json();
    let posts: any[] = [];

    if (Array.isArray(rawData)) {
      // Behold API returns a flat array of posts
      posts = rawData.slice(0, 6).map((post: any) => ({
        id: post.id || String(Math.random()),
        image: post.sizes?.medium?.mediaUrl || post.sizes?.small?.mediaUrl || post.sizes?.full?.mediaUrl || post.thumbnail_url || post.media_url || post.thumbnailUrl || post.mediaUrl,
        url: post.permalink || "https://instagram.com"
      }));
    } else if (rawData && Array.isArray(rawData.data)) {
      // Standard Instagram Graph API or proxy response
      posts = rawData.data.slice(0, 6).map((post: any) => ({
        id: post.id || String(Math.random()),
        image: post.sizes?.medium?.mediaUrl || post.sizes?.small?.mediaUrl || post.sizes?.full?.mediaUrl || post.thumbnail_url || post.media_url || post.thumbnailUrl || post.mediaUrl,
        url: post.permalink || "https://instagram.com"
      }));
    }

    // Filter out posts that don't have valid images
    const validPosts = posts.filter(p => p.image);

    return NextResponse.json({
      source: "api",
      posts: validPosts
    });
  } catch (error) {
    console.error("Failed fetching live Instagram feed API:", error);
    return NextResponse.json({ source: "manual", posts: [] });
  }
}
