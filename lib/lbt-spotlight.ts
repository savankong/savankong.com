export type SpotlightEpisode = {
  slug: string;
  guest: string;
  photo: string;
  show: string;
  youtubeTitle: string;
};

export async function getFeaturedShows(): Promise<SpotlightEpisode[]> {
  try {
    const res = await fetch("https://www.lifebetweentitles.com/api/spotlight", {
      cache: "no-store",
    });
    if (!res.ok) return [];
    return (await res.json()) as SpotlightEpisode[];
  } catch {
    return [];
  }
}
