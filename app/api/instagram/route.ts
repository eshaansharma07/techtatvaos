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
    let postsArray: any[] = [];

    if (Array.isArray(rawData)) {
      postsArray = rawData;
    } else if (rawData && Array.isArray(rawData.posts)) {
      postsArray = rawData.posts;
    } else if (rawData && Array.isArray(rawData.data)) {
      postsArray = rawData.data;
    }

    const posts = postsArray.slice(0, 6).map((post: any) => ({
      id: post.id || String(Math.random()),
      image: post.sizes?.medium?.mediaUrl || post.sizes?.small?.mediaUrl || post.sizes?.full?.mediaUrl || post.thumbnailUrl || post.mediaUrl || post.thumbnail_url || post.media_url,
      url: post.permalink || `https://instagram.com/p/${post.id}`,
      caption: post.prunedCaption || post.caption || "",
      timestamp: post.timestamp,
      isReel: post.isReel === true || post.isReel === "true" || (post.permalink && String(post.permalink).includes("/reel/"))
    }));

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
