import { NextRequest, NextResponse } from "next/server";
import { getClubInfo } from "@/lib/public-data";

export const dynamic = "force-dynamic";

export async function GET(req: NextRequest) {
  let stats = { followers: "109", following: "35", postsCount: "40" };
  let posts: any[] = [];
  let source = "manual";

  try {
    const clubInfo = await getClubInfo();
    const instagramFeedUrl = clubInfo.instagramFeedUrl?.trim();
    const instagramHandle = clubInfo.instagramHandle?.trim() || "techtatvaclub";

    // 1. Try to scrape Instagram follower counts
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
          const content = match[1];
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

    // 2. Fetch the live Instagram feed from the configured URL
    if (instagramFeedUrl) {
      try {
        const res = await fetch(instagramFeedUrl, {
          cache: "no-store"
        });

        if (res.ok) {
          const rawData = await res.json();
          source = "api";

          if (rawData && typeof rawData === "object") {
            if (typeof rawData.followersCount === "number" || typeof rawData.followersCount === "string") {
              stats.followers = String(rawData.followersCount);
            }
            if (typeof rawData.followsCount === "number" || typeof rawData.followsCount === "string") {
              stats.following = String(rawData.followsCount);
            }
          }

          let postsArray: any[] = [];
          if (Array.isArray(rawData)) {
            postsArray = rawData;
          } else if (rawData && Array.isArray(rawData.posts)) {
            postsArray = rawData.posts;
          } else if (rawData && Array.isArray(rawData.data)) {
            postsArray = rawData.data;
          }

          posts = postsArray.slice(0, 6).map((post: any) => ({
            id: post.id || String(Math.random()),
            image: post.sizes?.medium?.mediaUrl || post.sizes?.small?.mediaUrl || post.sizes?.full?.mediaUrl || post.thumbnailUrl || post.mediaUrl || post.thumbnail_url || post.media_url,
            url: post.permalink || `https://instagram.com/p/${post.id}`,
            caption: post.prunedCaption || post.caption || "",
            timestamp: post.timestamp,
            isReel: post.isReel === true || post.isReel === "true" || (post.permalink && String(post.permalink).includes("/reel/"))
          })).filter(p => p.image);
        }
      } catch (feedErr) {
        console.error("Failed to fetch Behold Instagram feed:", feedErr);
      }
    }

    // 3. Apply manual overrides from database if present (gives final absolute priority)
    if (clubInfo.instagramFollowers) stats.followers = String(clubInfo.instagramFollowers).trim();
    if (clubInfo.instagramFollowing) stats.following = String(clubInfo.instagramFollowing).trim();
    if (clubInfo.instagramPosts) stats.postsCount = String(clubInfo.instagramPosts).trim();

  } catch (error) {
    console.error("Failed fetching live Instagram feed API:", error);
  }

  return NextResponse.json({
    source,
    stats,
    posts
  }, {
    headers: {
      "Cache-Control": "public, s-maxage=60, stale-while-revalidate=30"
    }
  });
}
