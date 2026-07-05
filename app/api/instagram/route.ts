import { NextRequest, NextResponse } from "next/server";
import { getClubInfo } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let stats = { followers: "109", following: "34", postsCount: "40" };

  try {
    const clubInfo = await getClubInfo();
    const instagramFeedUrl = clubInfo.instagramFeedUrl?.trim();
    const instagramHandle = clubInfo.instagramHandle?.trim() || "techtatvaclub";

    // Scraping Instagram follower counts
    try {
      const profileRes = await fetch(`https://www.instagram.com/${instagramHandle}/`, {
        cache: "no-store"
      });

      if (profileRes.ok) {
        const html = await profileRes.text();
        const match = html.match(/<meta\s+(?:name|property)="og:description"\s+content="([^"]+)"/i) || 
                      html.match(/<meta\s+content="([^"]+)"\s+(?:name|property)="og:description"/i) ||
                      html.match(/<meta\s+(?:name|property)="description"\s+content="([^"]+)"/i) ||
                      html.match(/<meta\s+content="([^"]+)"\s+(?:name|property)="description"/i);
        if (match && match[1]) {
          const content = match[1]; // e.g. "109 Followers, 36 Following, 40 Posts..."
          const statsMatch = content.match(/([0-9kKmM\.,\s]+)\s+Followers,\s+([0-9kKmM\.,\s]+)\s+Following,\s+([0-9kKmM\.,\s]+)\s+Posts/i);
          if (statsMatch) {
            stats = {
              followers: statsMatch[1].trim(),
              following: statsMatch[2].trim(),
              postsCount: statsMatch[3].trim()
            };
          }
        }
      }
    } catch (scrapeErr) {
      console.error("Failed to scrape live Instagram stats:", scrapeErr);
    }

    if (!instagramFeedUrl) {
      return NextResponse.json({ source: "manual", stats, posts: [] });
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
      stats,
      posts: validPosts
    });
  } catch (error) {
    console.error("Failed fetching live Instagram feed API:", error);
    return NextResponse.json({ source: "manual", stats, posts: [] });
  }
}
