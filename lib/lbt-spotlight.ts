export type FeaturedShow = {
  slug: string;
  guest: string;
  photo: string;
  show: string;
  youtubeTitle: string;
  season?: number;
  episode?: number;
};

export async function getFeaturedShow(): Promise<FeaturedShow | null> {
  try {
    const res = await fetch("https://www.lifebetweentitles.com/api/spotlight", {
      cache: "no-store",
    });
    if (!res.ok) return null;
    const eps = (await res.json()) as FeaturedShow[];
    const top = eps[0];
    if (!top) return null;

    try {
      const detailRes = await fetch(
        `https://www.lifebetweentitles.com/api/episodes/${top.slug}`,
        { cache: "no-store" }
      );
      if (detailRes.ok) {
        const detail = (await detailRes.json()) as {
          season?: number;
          episode?: number;
        };
        return { ...top, season: detail.season, episode: detail.episode };
      }
    } catch {
      // fall through and return the lightweight spotlight record
    }

    return top;
  } catch {
    return null;
  }
}
